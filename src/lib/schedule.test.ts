import { describe, expect, it } from "vitest";
import { holidaysPhrase, nightsPhrase, timePhrase, upcomingHolidays } from "./schedule";

describe("service calendar in words", () => {
  it("describes runs of nights and scattered ones", () => {
    expect(nightsPhrase(["sun", "mon", "tue", "wed", "thu"])).toBe("Sunday to Thursday");
    expect(nightsPhrase(["fri", "mon", "wed"])).toBe("Monday, Wednesday and Friday");
    expect(nightsPhrase(["mon", "tue"])).toBe("Monday and Tuesday");
    expect(nightsPhrase(["sun", "mon", "tue", "wed", "thu", "fri", "sat"])).toBe("every night");
  });

  it("formats the start time", () => {
    expect(timePhrase("20:00")).toBe("8 PM");
    expect(timePhrase("19:30")).toBe("7:30 PM");
  });

  it("lists the next 12 months of holidays, soonest first", () => {
    const holidays = [
      { date: "2026-12-25", name: "Christmas Day" },
      { date: "2026-10-01", name: "Past" },
      { date: "2026-11-26", name: "Thanksgiving Day" },
      { date: "2027-11-25", name: "Next Thanksgiving" },
    ];
    const names = upcomingHolidays(holidays, "2026-10-28");
    expect(names).toEqual(["Thanksgiving Day", "Christmas Day"]);
    expect(holidaysPhrase(names)).toBe("Thanksgiving Day and Christmas Day");
  });
});
