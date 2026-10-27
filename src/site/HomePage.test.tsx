import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { HomePage } from "./HomePage";

function QuoteProbe() {
  const location = useLocation();
  return <pre data-testid="probe">{JSON.stringify({ search: location.search, state: location.state })}</pre>;
}

describe("HomePage quote starter", () => {
  it("hands the values to /quote in navigation state, never in the URL", async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quote" element={<QuoteProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    const form = screen.getByRole("form", { name: "Start a quote" });
    await userEvent.type(form.querySelector("input[autocomplete=name]")!, "Pat");
    await userEvent.type(form.querySelector("input[type=email]")!, "pat@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Request a Quote" }));
    const probe = JSON.parse((await screen.findByTestId("probe")).textContent!);
    expect(probe.search).toBe("");
    expect(probe.state).toMatchObject({ name: "Pat", email: "pat@example.com" });
  });
});
