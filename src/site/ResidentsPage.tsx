import { Link } from "react-router-dom";
import { business } from "../config";
import { useSeo } from "../lib/seo";
import { holidaysPhrase, nightsPhrase, timePhrase, upcomingHolidays, usePublicSettings } from "../lib/schedule";
import { ButtonLink, Container, Pending } from "../components/ui";

/** Service nights, start time and holidays from Admin → Settings, with the usual calendar until they load. */
function useSchedule() {
  const settings = usePublicSettings();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const nights = settings ? nightsPhrase(settings.serviceNights) : "";
  return {
    nights: nights || "Sunday to Thursday",
    start: settings ? timePhrase(settings.startTime) : "8 PM",
    holidays: settings ? upcomingHolidays(settings.holidays, today) : business.holidays,
  };
}

export function ResidentsPage() {
  useSeo({
    title: "For Residents: Trash Rules and Service Nights",
    description:
      "How doorstep valet trash works at your community: bag and tie trash, container out by 8 PM Sunday to Thursday. Report a missed pickup or other issue online.",
    path: "/residents",
  });

  const schedule = useSchedule();
  const nightsLabel = schedule.nights.charAt(0).toUpperCase() + schedule.nights.slice(1);
  const rules = [
    [<strong key="s">Bag it and tie it.</strong>, " Loose trash can't be collected."],
    [<strong key="s">Container out by {schedule.start},</strong>, ` ${nightsLabel}.`],
    [<strong key="s">Bags fit inside with the lid closed.</strong>, " Nothing next to the container or in the breezeway."],
    [<strong key="s">Break down boxes</strong>, " and take them to the trash area yourself."],
    [<strong key="s">No hazardous items, liquids or furniture</strong>, " at the door. Book a bulk pickup instead."],
    [<strong key="s">Bring the container in</strong>, <> by <Pending>{business.containerBringInBy}</Pending> the next morning.</>],
  ];

  return (
    <>
      <section className="bg-navy text-white">
        <Container className="flex flex-wrap items-end justify-between gap-6 pt-12 pb-14 sm:pt-16 sm:pb-16">
          <div className="min-w-0">
            <h1 className="mb-3 text-4xl font-bold sm:text-[52px]">For Residents</h1>
            <p className="m-0 max-w-[620px] text-lg leading-relaxed text-on-navy">
              Out by 8 PM, gone by morning. Here is how doorstep pickup works at your community.
            </p>
          </div>
          <ButtonLink to="/report" variant="light" className="w-full sm:w-auto">
            Report an Issue
          </ButtonLink>
        </Container>
      </section>

      <Container className="grid grid-cols-1 gap-10 py-14 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
        <div className="min-w-0">
          <h2 className="mb-6 text-[28px] font-bold text-navy sm:text-4xl">The rules, in plain language</h2>
          <ol className="m-0 flex list-none flex-col gap-4 p-0">
            {rules.map(([lead, rest], i) => (
              <li key={i} className="flex gap-4">
                <span
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-navy font-heading font-bold text-white"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <p className="m-0 pt-1 text-[17px] leading-relaxed">
                  {lead}
                  {rest}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-8 rounded-xl bg-surface p-6">
            <h3 className="mt-0 mb-2 text-xl">What happens if trash doesn't follow the rules?</h3>
            <p className="m-0 leading-relaxed text-muted">
              Our valet logs it with a photo of the trash and doorway and shares it with your property management office,
              which handles any notice. CBES never fines residents.
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="rounded-xl border border-line p-6">
            <h3 className="mt-0 mb-2 text-xl">Service nights</h3>
            <p className="mt-0 mb-2 font-bold">
              {nightsLabel}, from {schedule.start}
            </p>
            {schedule.holidays.length > 0 && (
              <p className="m-0 text-[15px] leading-relaxed text-muted">No service on {holidaysPhrase(schedule.holidays)}.</p>
            )}
          </div>
          <div className="rounded-xl border border-line p-6">
            <h3 className="mt-0 mb-2 text-xl">Bulk pickup</h3>
            <p className="mt-0 mb-3 leading-relaxed text-muted">
              Moving out or replacing furniture? We'll haul it away for a per-load rate.
            </p>
            <Link to="/report?type=bulk_pickup_request" className="font-bold">
              Book a bulk pickup
            </Link>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-line p-6">
            <div
              aria-hidden="true"
              className="flex h-16 w-16 flex-none items-center justify-center rounded-lg border-2 border-navy font-heading font-bold text-navy"
            >
              QR
            </div>
            <p className="m-0 leading-relaxed text-muted">
              Scan the QR code on your container to report an issue with your unit already filled in.
            </p>
          </div>
        </div>
      </Container>

      <section className="bg-surface">
        <Container className="flex flex-wrap items-center justify-between gap-6 py-12 sm:py-14">
          <div className="min-w-0">
            <h2 className="mb-2 text-[28px] font-bold text-navy sm:text-4xl">Something go wrong?</h2>
            <p className="m-0 text-[17px] text-muted">
              Missed pickup, trash in a hallway or a damaged container? We reply within 24 hours.
            </p>
          </div>
          <ButtonLink to="/report" className="w-full sm:w-auto">
            Report an Issue
          </ButtonLink>
        </Container>
      </section>
    </>
  );
}
