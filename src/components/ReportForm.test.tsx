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
    getProperties: vi.fn(async () => [{ name: "Demo Community", slug: "demo-community" }]),
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
    await screen.findByRole("option", { name: "Demo Community" });
    await userEvent.click(screen.getByRole("button", { name: "Submit report" }));
    expect(await screen.findByText("Choose your community")).toBeInTheDocument();
    expect(screen.getByText("Enter your building and unit")).toBeInTheDocument();
    expect(screen.getByText("Enter a phone number or email")).toBeInTheDocument();
    expect(api.submitResidentReport).not.toHaveBeenCalled();
  });

  it("keeps the errors showing when the community list arrives after an early submit", async () => {
    let finish!: (rows: { name: string; slug: string }[]) => void;
    vi.mocked(api.getProperties).mockImplementationOnce(() => new Promise((resolve) => (finish = resolve)));
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Submit report" }));
    expect(await screen.findByText("Enter your building and unit")).toBeInTheDocument();

    finish([{ name: "Demo Community", slug: "demo-community" }]);
    await screen.findByRole("option", { name: "Demo Community" });
    expect(screen.getByText("Enter your building and unit")).toBeInTheDocument();
  });

  it("offers the issue types saved in Admin → Settings, including a ?type= link to a new one", async () => {
    renderForm("/report?type=gate_code");
    expect(await screen.findByRole("radio", { name: "Gate code not working" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Missed pickup" })).not.toBeChecked();
  });

  it("pre-fills community and unit from a QR link and marks the source", async () => {
    renderForm("/report?p=demo-community&u=412");
    await screen.findByRole("option", { name: "Demo Community" });
    expect(screen.getByLabelText("Community")).toHaveValue("demo-community");
    expect(screen.getByLabelText("Building and unit")).toHaveValue("Unit 412");

    await userEvent.type(screen.getByLabelText("Your name"), "Jordan");
    await userEvent.type(screen.getByLabelText("Phone or email"), "jordan@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Submit report" }));

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

  it("asks for the community name when it is not listed", async () => {
    renderForm();
    await screen.findByRole("option", { name: "Demo Community" });
    expect(screen.queryByLabelText("Community name")).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText("Community"), "other");
    expect(screen.getByLabelText("Community name")).toBeInTheDocument();
  });

  it("pre-selects bulk pickup from the residents page link to /report", async () => {
    renderForm("/report?type=bulk_pickup_request");
    expect(await screen.findByRole("radio", { name: "Bulk pickup request" })).toBeChecked();
  });

  it("shows the reference number and status link after submitting", async () => {
    renderForm("/report?p=demo-community");
    await screen.findByRole("option", { name: "Demo Community" });
    await userEvent.type(screen.getByLabelText("Building and unit"), "Bldg 4, Unit 412");
    await userEvent.type(screen.getByLabelText("Your name"), "Jordan");
    await userEvent.type(screen.getByLabelText("Phone or email"), "(404) 555-0100");
    await userEvent.click(screen.getByRole("button", { name: "Submit report" }));

    expect(await screen.findByRole("heading", { name: /report #1001/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /check your report status/i })).toHaveAttribute(
      "href",
      `/report/${"a".repeat(36)}`,
    );
  });

  it("shows field errors returned by the server", async () => {
    vi.mocked(api.submitResidentReport).mockRejectedValueOnce(
      new ApiError("Please fix the highlighted fields.", 422, { propertySlug: "Choose your community from the list" }),
    );
    renderForm("/report?p=demo-community");
    await screen.findByRole("option", { name: "Demo Community" });
    await userEvent.type(screen.getByLabelText("Building and unit"), "412");
    await userEvent.type(screen.getByLabelText("Your name"), "Jordan");
    await userEvent.type(screen.getByLabelText("Phone or email"), "jordan@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Submit report" }));
    expect(await screen.findByText("Choose your community from the list")).toBeInTheDocument();
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
    await screen.findByRole("option", { name: "Demo Community" });
    const unit = screen.getByLabelText("Building and unit");
    await userEvent.clear(unit);
    await userEvent.type(unit, "Bldg 2, Unit 205");
    await userEvent.type(screen.getByLabelText("Your name"), "Jordan");
    await userEvent.type(screen.getByLabelText("Phone or email"), "jordan@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Submit report" }));
    await waitFor(() => expect(api.submitResidentReport).toHaveBeenCalled());
    const [data] = vi.mocked(api.submitResidentReport).mock.calls[0];
    expect(data.unitCode).toBeUndefined();
    expect(data.unitText).toBe("Bldg 2, Unit 205");
  });
});
