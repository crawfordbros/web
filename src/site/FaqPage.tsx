import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { business } from "../config";
import { holidaysPhrase, useSchedule } from "../lib/schedule";
import { useSeo } from "../lib/seo";
import { Container, PageHero, Pending } from "../components/ui";

type Faq = { q: string; a: ReactNode };

// The two answers that name the service calendar read it from Admin → Settings.
function MissedPickup() {
  const { nights, start } = useSchedule();
  return (
    <>
      <Link to="/report">Report a missed pickup</Link> with your building and unit. We reply within 24 hours, and your
      report is shared with your property management team. First, check that your container was out by {start} on a
      service night ({nights}) and that bags were tied and inside the container.
    </>
  );
}

function Holidays() {
  const { holidays } = useSchedule();
  return (
    <>
      {holidays.length ? `There is no service on ${holidaysPhrase(holidays)}.` : "There are no holidays without service coming up."} Make-up nights and severe
      weather: <Pending>[holiday make-up and weather policy to come from CBES]</Pending>
    </>
  );
}

const RESIDENTS: Faq[] = [
  {
    q: "My trash wasn't picked up. What should I do?",
    a: <MissedPickup />,
  },
  {
    q: "Is there service on holidays or in bad weather?",
    a: <Holidays />,
  },
  {
    q: "How many bags can I put out, and how big?",
    a: (
      <>
        Bags must fit inside the container with the lid closed. Size and weight limits:{" "}
        <Pending>[bag size and weight limits to come from CBES]</Pending>
      </>
    ),
  },
  {
    q: "Something of mine was taken by mistake.",
    a: (
      <>
        <Link to="/report">Report it</Link> and choose "Item taken by mistake". Tell us what it was and when it was
        outside your door, and we'll follow up within 24 hours.
      </>
    ),
  },
  {
    q: "What happens if my trash doesn't follow the rules?",
    a: "Our valet logs it with a photo of the trash and doorway and shares it with your property management office, which handles any notice. CBES never contacts or fines residents about violations.",
  },
  {
    q: "How do I get rid of furniture or large items?",
    a: (
      <>
        Book a bulk pickup: <Link to="/report?type=bulk_pickup_request">request it here</Link>. We haul large items for a
        per-load rate. Please don't leave furniture at your door on service nights.
      </>
    ),
  },
];

const MANAGERS: Faq[] = [
  {
    q: "What contract options do you offer?",
    a: "12-month, 36-month and month-to-month agreements. Pricing is quoted per community based on unit count and services.",
  },
  {
    q: "Are you insured?",
    a: "Yes. CB Environment Solutions is licensed and insured, and our valets are trained, uniformed W-2 employees.",
  },
  {
    q: "How long does it take to start service?",
    a: (
      <>
        We supply branded CBES containers within 45 days. Your full start-up timeline is set with your quote:{" "}
        <Link to="/quote">request one here</Link>.
      </>
    ),
  },
  {
    q: "What reporting will my team get?",
    a: "Every Monday at 7 AM your management Director gets a report for the prior week: nights serviced, resident reports and how fast we replied, violations by type with photos, Overwatch units, and pressure washing.",
  },
  {
    q: "Who sees resident reports and violations?",
    a: "Resident reports are fully visible to your management team. Violations go only to your office, with a photo of the trash and doorway, never of people. You decide any notice to residents.",
  },
  {
    q: "What is the Overwatch program?",
    a: "Units with 3 or more violations in 30 days are flagged early so your team can step in before a small problem becomes a big one.",
  },
];

function FaqList({ id, title, items }: { id: string; title: string; items: Faq[] }) {
  return (
    <section aria-labelledby={id} className="min-w-0">
      <h2 id={id} className="mb-5 text-[26px] font-bold text-navy sm:text-[32px]">
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {items.map((f) => (
          <details key={f.q} className="group rounded-xl border border-line bg-white open:bg-surface">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
              {f.q}
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#272B84" strokeWidth="2.4" strokeLinecap="round" className="flex-none transition-transform group-open:rotate-180">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <div className="px-5 pb-5 leading-relaxed text-muted">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}

export function FaqPage() {
  useSeo({
    title: "FAQ",
    description:
      "Answers for residents (missed pickups, holidays, bulk items) and property managers (contracts, insurance, start-up, weekly reports).",
    path: "/faq",
  });

  return (
    <>
      <PageHero eyebrow="Questions and answers" title="Frequently asked questions">
        <p className="m-0">
          Can't find your answer? Email <a href={`mailto:${business.email}`} className="text-white">{business.email}</a> or{" "}
          <Link to="/contact" className="text-white">send us a message</Link>.
        </p>
      </PageHero>
      <Container className="grid grid-cols-1 gap-12 py-14 sm:py-20 lg:grid-cols-2">
        <FaqList id="faq-residents" title="Residents" items={RESIDENTS} />
        <FaqList id="faq-managers" title="Property managers" items={MANAGERS} />
      </Container>
    </>
  );
}
