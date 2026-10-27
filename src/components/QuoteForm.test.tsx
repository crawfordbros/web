import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QuoteForm } from "./QuoteForm";
import { ContactForm } from "./ContactForm";

vi.mock("../lib/api", async (orig) => {
  const actual = await orig<typeof import("../lib/api")>();
  return { ...actual, submitQuote: vi.fn(async () => ({ ok: true })) };
});
const api = await import("../lib/api");

const renderAt = (ui: React.ReactNode, url = "/quote") => render(<MemoryRouter initialEntries={[url]}>{ui}</MemoryRouter>);

beforeEach(() => vi.clearAllMocks());

describe("QuoteForm", () => {
  it("carries over the home page short form without putting it in the URL", () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/quote", state: { name: "Pat", community: "Maple Ridge", email: "pat@example.com", units: "240" } }]}
      >
        <QuoteForm />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText("Full name")).toHaveValue("Pat");
    expect(screen.getByLabelText("Community name")).toHaveValue("Maple Ridge");
    expect(screen.getByLabelText("Email")).toHaveValue("pat@example.com");
    expect(screen.getByLabelText("Number of units")).toHaveValue(240);
  });

  it("starts with valet trash and spot pressure washing selected", () => {
    renderAt(<QuoteForm />);
    expect(screen.getByRole("checkbox", { name: "Doorstep valet trash" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Annual spot pressure washing" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Bulk trash removal" })).not.toBeChecked();
  });

  it("shows inline errors for missing required fields", async () => {
    renderAt(<QuoteForm />);
    await userEvent.click(screen.getByRole("button", { name: "Request my quote" }));
    expect(await screen.findByText("Enter your name")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
    expect(screen.getByText("Enter the community name")).toBeInTheDocument();
    expect(screen.getByText("Enter the number of units")).toBeInTheDocument();
    expect(api.submitQuote).not.toHaveBeenCalled();
  });

  it("submits a quote and confirms", async () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/quote", state: { name: "Pat", community: "Maple Ridge", email: "pat@example.com", units: "240" } }]}
      >
        <QuoteForm />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Request my quote" }));
    await waitFor(() => expect(api.submitQuote).toHaveBeenCalled());
    expect(vi.mocked(api.submitQuote).mock.calls[0][0]).toMatchObject({
      kind: "quote",
      fullName: "Pat",
      communityName: "Maple Ridge",
      services: ["valet_trash", "pressure_washing"],
    });
    expect(await screen.findByText(/Nick or Nigel will reach out within 24 hours/)).toBeInTheDocument();
  });
});

describe("ContactForm", () => {
  it("sends a contact message", async () => {
    renderAt(<ContactForm />, "/contact");
    await userEvent.type(screen.getByLabelText("Name"), "Sam");
    await userEvent.type(screen.getByLabelText("Email"), "sam@example.com");
    await userEvent.type(screen.getByLabelText("Message"), "Question about bulk pickup");
    await userEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(api.submitQuote).toHaveBeenCalled());
    expect(vi.mocked(api.submitQuote).mock.calls[0][0]).toMatchObject({ kind: "contact", notes: "Question about bulk pickup" });
    expect(await screen.findByText(/We got your message/)).toBeInTheDocument();
  });
});
