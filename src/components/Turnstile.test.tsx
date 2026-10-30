import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "./ContactForm";
import { QuoteForm } from "./QuoteForm";
import { ReportForm } from "./ReportForm";
import { TurnstileField } from "./TurnstileField";
import { ApiError, submitQuote, submitResidentReport } from "../lib/api";

const widget = vi.hoisted(() => ({
  reset: vi.fn(),
  getResponsePromise: vi.fn(),
  onExpire: undefined as undefined | (() => void),
  onError: undefined as undefined | (() => void),
  onTimeout: undefined as undefined | (() => void),
  onScriptError: undefined as undefined | (() => void),
  onUnsupported: undefined as undefined | (() => void),
}));

vi.mock("../config", async (original) => {
  const actual = await original<typeof import("../config")>();
  return { ...actual, config: { ...actual.config, turnstileSiteKey: "test-site-key" }, turnstileRequired: true };
});

vi.mock("@marsidev/react-turnstile", async () => {
  const { forwardRef, useImperativeHandle } = await import("react");
  type Props = {
    siteKey: string;
    options: { action: string };
    onSuccess: (token: string) => void;
    onExpire: () => void;
    onError: () => void;
    onTimeout: () => void;
    scriptOptions: { onError: () => void };
    onUnsupported: () => void;
  };
  return {
    Turnstile: forwardRef(function MockTurnstile(props: Props, ref) {
      useImperativeHandle(ref, () => widget);
      widget.onExpire = props.onExpire;
      widget.onError = props.onError;
      widget.onTimeout = props.onTimeout;
      widget.onScriptError = props.scriptOptions.onError;
      widget.onUnsupported = props.onUnsupported;
      return <button type="button" data-sitekey={props.siteKey} onClick={() => props.onSuccess("fresh-token")}>Verify {props.options.action}</button>;
    }),
  };
});

vi.mock("../lib/api", async (original) => {
  const actual = await original<typeof import("../lib/api")>();
  return {
    ...actual,
    submitQuote: vi.fn(async () => ({ ok: true })),
    submitResidentReport: vi.fn(async () => ({ refNo: 1001, token: "a".repeat(36) })),
    getPublicSettings: vi.fn(async () => ({ issueTypes: [], serviceNights: [], startTime: "20:00", holidays: [] })),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  widget.getResponsePromise.mockResolvedValue("");
});

function renderForm(form: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>{form}</MemoryRouter>
    </QueryClientProvider>,
  );
}

async function fillContact() {
  renderForm(<ContactForm />);
  await userEvent.type(screen.getByLabelText("Name"), "Sam");
  await userEvent.type(screen.getByLabelText("Email"), "sam@example.com");
  await userEvent.type(screen.getByLabelText("Message"), "Question about pickup");
}

async function fillReport() {
  renderForm(<ReportForm />);
  await userEvent.click(screen.getByRole("button", { name: "Verify resident_report" }));
  await userEvent.type(screen.getByLabelText("Community"), "Maple Ridge");
  await userEvent.type(screen.getByLabelText("Building and unit"), "Unit 412");
  await userEvent.type(screen.getByLabelText("Your name"), "Sam");
  await userEvent.type(screen.getByLabelText("Email"), "sam@example.com");
  await userEvent.type(screen.getByLabelText("Tell us more"), "Bags left by the door.");
}

describe("Turnstile integration", () => {
  it.each([
    { form: <ContactForm />, label: "Contact us", action: "contact" },
    { form: <QuoteForm />, label: "Request a quote", action: "quote" },
  ])("uses the $action action and mounts only after interaction", async ({ form, label, action }) => {
    renderForm(form);
    expect(screen.queryByRole("button", { name: `Verify ${action}` })).not.toBeInTheDocument();
    fireEvent.focus(screen.getByRole("form", { name: label }));
    expect(await screen.findByRole("button", { name: `Verify ${action}` })).toHaveAttribute("data-sitekey", "test-site-key");
  });

  it("starts the report browser check immediately and unlocks reporting only after success", async () => {
    renderForm(<ReportForm />);
    expect(screen.getByText("Checking your browser…")).toBeInTheDocument();
    expect(screen.getByLabelText("Community")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Report issue" })).toBeDisabled();
    const verify = screen.getByRole("button", { name: "Verify resident_report" });
    expect(verify).toHaveAttribute("data-sitekey", "test-site-key");
    await userEvent.click(verify);
    expect(screen.getByText("Browser verified")).toBeInTheDocument();
    expect(screen.getByLabelText("Community")).toBeEnabled();
    expect(screen.getByRole("button", { name: "Report issue" })).toBeEnabled();
  });

  it.each(["onExpire", "onError", "onTimeout", "onScriptError", "onUnsupported"] as const)(
    "blocks reporting on %s, retains entered details and accepts a fresh verification", async (callback) => {
      await fillReport();
      act(() => widget[callback]?.());
      expect(screen.getByLabelText("Community")).toBeDisabled();
      expect(screen.getByLabelText("Community")).toHaveValue("Maple Ridge");
      expect(screen.getByRole("button", { name: "Report issue" })).toBeDisabled();
      expect(screen.getByText(callback === "onExpire" ? "Checking your browser…" : "Browser check unavailable")).toBeInTheDocument();

      // Bypassing the disabled button must not reuse the previous token.
      fireEvent.submit(screen.getByRole("form", { name: "Report an issue" }));
      expect(await screen.findByText("Please complete the browser check at the top of the form.")).toBeInTheDocument();
      expect(submitResidentReport).not.toHaveBeenCalled();

      await userEvent.click(screen.getByRole("button", { name: "Verify resident_report" }));
      await userEvent.click(screen.getByRole("button", { name: "Report issue" }));
      expect(await screen.findByRole("heading", { name: /issue #1001/i })).toBeInTheDocument();
      expect(submitResidentReport).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ communityText: "Maple Ridge", description: "Bags left by the door." }), [], "fresh-token",
      );
    },
  );

  it("requires a new browser check after a failed report submission", async () => {
    vi.mocked(submitResidentReport).mockRejectedValueOnce(new ApiError("Try again", 503));
    await fillReport();
    await userEvent.click(screen.getByRole("button", { name: "Report issue" }));
    expect(await screen.findByText("Try again")).toBeInTheDocument();
    expect(widget.reset).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Report issue" })).toBeDisabled();
    expect(screen.getByLabelText("Community")).toHaveValue("Maple Ridge");

    await userEvent.click(screen.getByRole("button", { name: "Verify resident_report" }));
    await userEvent.click(screen.getByRole("button", { name: "Report issue" }));
    expect(await screen.findByRole("heading", { name: /issue #1001/i })).toBeInTheDocument();
  });

  it.each(["onExpire", "onError", "onTimeout"] as const)("clears a stale token on %s", async (callback) => {
    const onToken = vi.fn();
    render(<TurnstileField armed action="contact" onToken={onToken} />);
    await userEvent.click(screen.getByRole("button", { name: "Verify contact" }));
    expect(onToken).toHaveBeenLastCalledWith("fresh-token");
    act(() => widget[callback]?.());
    expect(onToken).toHaveBeenLastCalledWith("");
  });

  it("does not submit without a solved challenge", async () => {
    await fillContact();
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText(/Please complete the spam check/)).toBeInTheDocument();
    expect(submitQuote).not.toHaveBeenCalled();
  });

  it("resets a consumed token after failure and sends a fresh token on retry", async () => {
    vi.mocked(submitQuote).mockRejectedValueOnce(new ApiError("Try again", 503));
    await fillContact();
    await userEvent.click(screen.getByRole("button", { name: "Verify contact" }));
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByText("Try again")).toBeInTheDocument();
    expect(submitQuote).toHaveBeenLastCalledWith(expect.objectContaining({ kind: "contact" }), "fresh-token");
    expect(widget.reset).toHaveBeenCalledOnce();

    widget.getResponsePromise.mockResolvedValueOnce("retry-token");
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(submitQuote).toHaveBeenLastCalledWith(expect.anything(), "retry-token"));
    expect(await screen.findByText("We got your message.")).toBeInTheDocument();
  });
});
