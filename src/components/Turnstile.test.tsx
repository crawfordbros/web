import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "./ContactForm";
import { QuoteForm } from "./QuoteForm";
import { ReportForm } from "./ReportForm";
import { TurnstileField } from "./TurnstileField";
import { ApiError, submitQuote } from "../lib/api";

const widget = vi.hoisted(() => ({
  reset: vi.fn(),
  getResponsePromise: vi.fn(),
  onExpire: undefined as undefined | (() => void),
  onError: undefined as undefined | (() => void),
  onTimeout: undefined as undefined | (() => void),
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
  };
  return {
    Turnstile: forwardRef(function MockTurnstile(props: Props, ref) {
      useImperativeHandle(ref, () => widget);
      widget.onExpire = props.onExpire;
      widget.onError = props.onError;
      widget.onTimeout = props.onTimeout;
      return <button type="button" data-sitekey={props.siteKey} onClick={() => props.onSuccess("fresh-token")}>Verify {props.options.action}</button>;
    }),
  };
});

vi.mock("../lib/api", async (original) => {
  const actual = await original<typeof import("../lib/api")>();
  return {
    ...actual,
    submitQuote: vi.fn(async () => ({ ok: true })),
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

describe("Turnstile integration", () => {
  it.each([
    { form: <ContactForm />, label: "Contact us", action: "contact" },
    { form: <QuoteForm />, label: "Request a quote", action: "quote" },
    { form: <ReportForm />, label: "Report an issue", action: "resident_report" },
  ])("uses the $action action and mounts only after interaction", async ({ form, label, action }) => {
    renderForm(form);
    expect(screen.queryByRole("button", { name: `Verify ${action}` })).not.toBeInTheDocument();
    fireEvent.focus(screen.getByRole("form", { name: label }));
    expect(await screen.findByRole("button", { name: `Verify ${action}` })).toHaveAttribute("data-sitekey", "test-site-key");
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
