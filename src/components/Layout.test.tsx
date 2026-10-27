import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Layout } from "./Layout";

afterEach(() => vi.useRealTimers());

describe("Layout footer", () => {
  it("shows the build year, not the visitor's clock, so prerendered HTML hydrates cleanly after New Year", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2031-01-01T12:00:00Z"));
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>,
    );
    expect(screen.getByText(`© ${__BUILD_YEAR__} CB Environment Solutions LLC`)).toBeInTheDocument();
    expect(__BUILD_YEAR__).not.toBe(2031);
  });
});
