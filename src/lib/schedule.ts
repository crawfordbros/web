import { useQuery } from "@tanstack/react-query";
import { getPublicSettings, type Day, type PublicSettings } from "./api";
import { business } from "../config";
import { ISSUE_TYPES, ISSUE_TYPE_LABELS } from "./schemas";

// The service calendar in words, from Admin → Settings. Pages render the built-in defaults first
// (they're prerendered) and switch to the saved calendar once it loads.

const DAYS: Day[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const NAMES: Record<Day, string> = { sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" };

const and = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`);

/** "Sunday to Thursday" for a run of days, otherwise "Monday, Wednesday and Friday". */
export function nightsPhrase(nights: Day[]): string {
  const idx = DAYS.filter((d) => nights.includes(d)).map((d) => DAYS.indexOf(d));
  if (!idx.length) return "";
  if (idx.length === 7) return "every night";
  const run = idx.every((d, i) => i === 0 || d === idx[i - 1] + 1);
  if (run && idx.length > 2) return `${NAMES[DAYS[idx[0]]]} to ${NAMES[DAYS[idx.at(-1)!]]}`;
  return and(idx.map((d) => NAMES[DAYS[d]]));
}

/** "8 PM" for "20:00", "8:30 PM" for "20:30". */
export function timePhrase(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

/** Holiday names in the next 12 months, soonest first. */
export function upcomingHolidays(holidays: PublicSettings["holidays"], today: string): string[] {
  const [y, rest] = [Number(today.slice(0, 4)), today.slice(4)];
  const end = `${y + 1}${rest}`;
  return holidays
    .filter((h) => h.date >= today && h.date < end)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((h) => h.name);
}

export const holidaysPhrase = (names: string[]) => and(names);

/** The saved settings, shared by every page that shows them; null until they load (or if they can't). */
export function usePublicSettings(): PublicSettings | null {
  const q = useQuery({ queryKey: ["settings", "public"], queryFn: getPublicSettings, staleTime: 5 * 60_000, retry: 1 });
  return q.data ?? null;
}

/** The report form's choices: the saved list, or the original eight until it loads. */
export const DEFAULT_ISSUE_TYPES = ISSUE_TYPES.map((key) => ({ key, label: ISSUE_TYPE_LABELS[key] as string, labelEs: null as string | null }));

/** Service nights, start time and holidays in words, with the usual calendar until the saved one loads. */
export function useSchedule() {
  const settings = usePublicSettings();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const nights = (settings && nightsPhrase(settings.serviceNights)) || "Sunday to Thursday";
  return {
    nights,
    nightsLabel: nights.charAt(0).toUpperCase() + nights.slice(1),
    start: settings ? timePhrase(settings.startTime) : "8 PM",
    holidays: settings ? upcomingHolidays(settings.holidays, today) : business.holidays,
  };
}
