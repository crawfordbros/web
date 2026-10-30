import { render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../lib/api";
import { ReportForm } from "./ReportForm";

vi.mock("../lib/api", async (orig) => {
  const actual = await orig<typeof import("../lib/api")>();
  const { ISSUE_TYPES, ISSUE_TYPE_LABELS } = await import("../lib/schemas");
  return {
    ...actual,
    submitResidentReport: vi.fn(async () => ({ refNo: 1001, token: "a".repeat(36) })),
    // The saved list from Admin → Settings: the original types plus one CBES added.
    getPublicSettings: vi.fn(async () => ({
      issueTypes: [
        ...ISSUE_TYPES.map((key) => ({ key, label: ISSUE_TYPE_LABELS[key], labelEs: null })),
        { key: "gate_code", label: "Gate code not working", labelEs: null },
      ],
      serviceNights: ["sun", "mon", "tue", "wed", "thu"],
      startTime: "20:00",
      holidays: [],
    })),
  };
});
const api = await import("../lib/api");

function formTree(url: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <ReportForm />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const renderForm = (url = "/report") => render(formTree(url));

beforeEach(() => vi.clearAllMocks());

describe("ReportForm", () => {
  it("shows inline errors and does not submit when required fields are empty", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Report issue" }));
    expect(await screen.findByText("Type your community name")).toBeInTheDocument();
    expect(screen.getByText("Enter your building and unit")).toBeInTheDocument();
    expect(screen.getByText("Enter your email")).toBeInTheDocument();
    expect(screen.getByText("Tell us what happened")).toBeInTheDocument();
    expect(api.submitResidentReport).not.toHaveBeenCalled();
  });

  it("never lists the communities CBES serves", async () => {
    renderForm();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("keeps the errors showing when the saved issue types arrive after an early submit", async () => {
    let finish!: (s: Awaited<ReturnType<typeof api.getPublicSettings>>) => void;
    vi.mocked(api.getPublicSettings).mockImplementationOnce(() => new Promise((resolve) => (finish = resolve)));
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Report issue" }));
    expect(await screen.findByText("Enter your building and unit")).toBeInTheDocument();

    finish({ issueTypes: [], serviceNights: [], startTime: "20:00", holidays: [] });
    await waitFor(() => expect(screen.getByText("Enter your building and unit")).toBeInTheDocument());
  });

  it("sends a typed community name", async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText("Community"), "Maple Ridge");
    await userEvent.type(screen.getByLabelText("Building and unit"), "Bldg 4, Unit 412");
    await userEvent.type(screen.getByLabelText("Your name"), "Jordan");
    await userEvent.type(screen.getByLabelText("Email"), "jordan@example.com");
    await userEvent.type(screen.getByLabelText("Tell us more"), "Bags left by the door.");
    await userEvent.click(screen.getByRole("button", { name: "Report issue" }));
    await waitFor(() => expect(api.submitResidentReport).toHaveBeenCalled());
    const [data] = vi.mocked(api.submitResidentReport).mock.calls[0];
    expect(data).toMatchObject({ propertySlug: "other", communityText: "Maple Ridge", source: "web" });
  });

  it("offers the issue types saved in Admin → Settings, including a ?type= link to a new one", async () => {
    renderForm("/report?type=gate_code");
    expect(await screen.findByRole("radio", { name: "Gate code not working" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Missed pickup" })).not.toBeChecked();
  });

  it("pre-fills community and unit from a QR link and marks the source", async () => {
    renderForm("/report?p=demo-community&u=412");
    expect(screen.getByText("Filled in from your QR code")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Community" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Building and unit")).toHaveValue("Unit 412");

    await userEvent.type(screen.getByLabelText("Your name"), "Jordan");
    await userEvent.type(screen.getByLabelText("Email"), "jordan@example.com");
    await userEvent.type(screen.getByLabelText("Tell us more"), "Bags left by the door.");
    await userEvent.click(screen.getByRole("button", { name: "Report issue" }));

    await waitFor(() => expect(api.submitResidentReport).toHaveBeenCalled());
    const [data] = vi.mocked(api.submitResidentReport).mock.calls[0];
    expect(data).toMatchObject({
      propertySlug: "demo-community",
      unitCode: "412",
      unitText: "Unit 412",
      issueType: "missed_pickup",
      source: "qr",
    });
  });

  it("asks for a phone number only after the resident offers one", async () => {
    renderForm();
    expect(screen.queryByLabelText("Phone number")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Can we call you?" }));
    expect(screen.getByLabelText("Phone number")).toHaveFocus();

    await userEvent.click(screen.getByRole("button", { name: "Report issue" }));
    expect(await screen.findByText("Enter your phone number")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Don't call me" }));
    expect(screen.queryByLabelText("Phone number")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Can we call you?" })).toHaveFocus();
  });

  it("sends the phone number with the email when the resident can take a call", async () => {
    renderForm("/report?p=demo-community");
    await userEvent.type(screen.getByLabelText("Building and unit"), "Bldg 4, Unit 412");
    await userEvent.type(screen.getByLabelText("Your name"), "Jordan");
    await userEvent.type(screen.getByLabelText("Email"), "jordan@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Can we call you?" }));
    await userEvent.type(screen.getByLabelText("Phone number"), "(404) 555-0100");
    await userEvent.type(screen.getByLabelText("Tell us more"), "Bags left by the door.");
    await userEvent.click(screen.getByRole("button", { name: "Report issue" }));
    await waitFor(() => expect(api.submitResidentReport).toHaveBeenCalled());
    const [data] = vi.mocked(api.submitResidentReport).mock.calls[0];
    expect(data).toMatchObject({ reporterEmail: "jordan@example.com", wantsCall: true, reporterPhone: "(404) 555-0100" });
  });

  it("lets a QR resident type a different community instead", async () => {
    renderForm("/report?p=demo-community");
    await userEvent.click(screen.getByRole("button", { name: "Change" }));
    expect(screen.getByLabelText("Community")).toHaveFocus();
    expect(screen.queryByText("Filled in from your QR code")).not.toBeInTheDocument();
  });

  it("pre-selects bulk pickup from the residents page link to /report", async () => {
    renderForm("/report?type=bulk_pickup_request");
    expect(await screen.findByRole("radio", { name: "Bulk pickup request" })).toBeChecked();
  });

  it("shows the reference number and status link after submitting", async () => {
    renderForm("/report?p=demo-community");
    await userEvent.type(screen.getByLabelText("Building and unit"), "Bldg 4, Unit 412");
    await userEvent.type(screen.getByLabelText("Your name"), "Jordan");
    await userEvent.type(screen.getByLabelText("Email"), "jordan@example.com");
    await userEvent.type(screen.getByLabelText("Tell us more"), "Bags left by the door.");
    await userEvent.click(screen.getByRole("button", { name: "Report issue" }));

    expect(await screen.findByRole("heading", { name: /issue #1001/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /check your issue status/i })).toHaveAttribute(
      "href",
      `/report/${"a".repeat(36)}`,
    );
  });

  it("asks for the community name when the server doesn't recognize the QR code", async () => {
    vi.mocked(api.submitResidentReport).mockRejectedValueOnce(
      new ApiError("Please fix the highlighted fields.", 422, {
        propertySlug: "We couldn't match your QR code. Type your community name.",
      }),
    );
    renderForm("/report?p=demo-community");
    await userEvent.type(screen.getByLabelText("Building and unit"), "412");
    await userEvent.type(screen.getByLabelText("Your name"), "Jordan");
    await userEvent.type(screen.getByLabelText("Email"), "jordan@example.com");
    await userEvent.type(screen.getByLabelText("Tell us more"), "Bags left by the door.");
    await userEvent.click(screen.getByRole("button", { name: "Report issue" }));
    expect(await screen.findByText("We couldn't match your QR code. Type your community name.")).toBeInTheDocument();
    expect(screen.getByLabelText("Community")).toHaveAttribute("aria-invalid", "true");
  });

  it("leaves the date limit out of prerendered HTML so it never freezes at the build date", () => {
    expect(renderToString(formTree("/report"))).not.toMatch(/type="date"[^>]*max=/);
  });

  it("sets today's date as the limit once running in the browser", async () => {
    renderForm();
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    await waitFor(() => expect(screen.getByLabelText("Date of issue")).toHaveAttribute("max", today));
  });

  it("drops the QR unit code when the resident changes the unit", async () => {
    renderForm("/report?p=demo-community&u=412");
    const unit = screen.getByLabelText("Building and unit");
    await userEvent.clear(unit);
    await userEvent.type(unit, "Bldg 2, Unit 205");
    await userEvent.type(screen.getByLabelText("Your name"), "Jordan");
    await userEvent.type(screen.getByLabelText("Email"), "jordan@example.com");
    await userEvent.type(screen.getByLabelText("Tell us more"), "Bags left by the door.");
    await userEvent.click(screen.getByRole("button", { name: "Report issue" }));
    await waitFor(() => expect(api.submitResidentReport).toHaveBeenCalled());
    const [data] = vi.mocked(api.submitResidentReport).mock.calls[0];
    expect(data.unitCode).toBeUndefined();
    expect(data.unitText).toBe("Bldg 2, Unit 205");
  });
});
