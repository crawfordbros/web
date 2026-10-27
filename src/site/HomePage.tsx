import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { business } from "../config";
import { useSeo } from "../lib/seo";
import { TextField } from "../components/fields";
import { useHydrated } from "../components/useHydrated";
import { Button, ButtonLink, CheckItem, Container, Eyebrow, Placeholder, SectionTitle, ShieldIcon } from "../components/ui";

const SERVICES = [
  {
    title: "Doorstep Valet Trash",
    body: "Bagged trash out by 8 PM, gone by morning. Five nights a week in branded CBES containers.",
    icon: (
      <>
        <path d="M4 21V5a2 2 0 012-2h7l5 5v13" />
        <path d="M2 21h20" />
        <circle cx="14.5" cy="13" r="0.8" />
      </>
    ),
  },
  {
    title: "Bulk Trash Removal",
    body: "Furniture and large items hauled away at a per-load rate. Residents and managers book online.",
    icon: (
      <>
        <path d="M1 16V6h13v10" />
        <path d="M14 9h4l3 4v3h-7" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </>
    ),
  },
  {
    title: "Annual Spot Pressure Washing",
    body: "Once a year we wash the trash area outside every door and the dumpster corrals. Not just clean, pristine.",
    icon: (
      <>
        <path d="M3 10h8v4H3z" />
        <path d="M11 12h4" />
        <path d="M15 12l6-4M15 12l6 0M15 12l6 4" />
        <path d="M5 14v6" />
      </>
    ),
  },
];

const STEPS = [
  ["Residents set out trash", "Bagged and tied, in the CBES container, by 8 PM."],
  ["Our team arrives", "Uniformed valets led by an Area Lead clock in on site."],
  ["Door-to-door pickup", "Every door, every building. Issues logged with a photo."],
  ["To the compactor", "Trash goes to your on-site dumpster; we check the area before leaving."],
  ["Closed out and reported", "The night rolls into your Monday report."],
];

function ProofStrip() {
  const stats = [
    ["24 hrs", "Reply to every resident report"],
    ["5 nights", "Sunday to Thursday, from 8 PM"],
    ["Every Monday", "Service report to your management Director"],
    ...(business.communitiesServed ? [[String(business.communitiesServed), "Communities served"]] : []),
  ];
  return (
    <section aria-label="What you can count on" className="border-b border-line bg-surface">
      <Container className="grid grid-cols-1 gap-6 py-8 text-center sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        {stats.map(([value, label]) => (
          <div key={label}>
            <p className="m-0 font-heading text-[34px] font-bold text-navy sm:text-[40px]">{value}</p>
            <p className="mt-1 mb-0 text-[15px] text-muted">{label}</p>
          </div>
        ))}
      </Container>
    </section>
  );
}

/** Short form that carries what was typed over to the full quote form. */
function QuoteStarter() {
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const [values, setValues] = useState({ name: "", community: "", email: "", units: "" });
  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Navigation state, not the query string: contact details must not land in URLs, history or logs.
    navigate({ pathname: "/quote", hash: "#quote-form" }, { state: values });
  };

  return (
    <form
      onSubmit={onSubmit}
      aria-label="Start a quote"
      className="grid min-w-0 flex-[1_1_460px] grid-cols-1 gap-4 rounded-2xl bg-white p-5 text-ink sm:grid-cols-2 sm:p-7"
    >
      <TextField label="Name" autoComplete="name" value={values.name} onChange={set("name")} />
      <TextField label="Community name" value={values.community} onChange={set("community")} />
      <TextField label="Email" type="email" autoComplete="email" value={values.email} onChange={set("email")} />
      <TextField label="Number of units" inputMode="numeric" value={values.units} onChange={set("units")} />
      <Button type="submit" disabled={!hydrated} className="sm:col-span-2">
        Request a Quote
      </Button>
    </form>
  );
}

export function HomePage() {
  useSeo({
    title: "Valet Trash for Atlanta Apartments | CB Environment Solutions",
    description:
      "Doorstep valet trash, bulk removal and pressure washing for metro Atlanta apartment communities. Every resident report answered within 24 hours.",
    path: "/",
  });

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-white">
        <svg
          aria-hidden="true"
          viewBox="0 0 600 400"
          className="pointer-events-none absolute -top-10 -right-16 h-[420px] w-[620px] opacity-[0.18]"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="28"
          strokeLinecap="round"
        >
          <path d="M40 360C140 200 60 80 200 60s160 120 260 40 120-60 120-60" />
          <path d="M120 400c60-80 200-60 240-140s-20-120 60-160" />
        </svg>
        <Container className="relative flex flex-wrap items-center gap-10 pt-14 pb-16 sm:pt-[88px] sm:pb-[104px] lg:gap-12">
          <div className="min-w-0 flex-[1_1_520px]">
            <Eyebrow onNavy>Aiming for excellence</Eyebrow>
            <h1 className="mb-5 text-[40px] leading-[1.08] font-bold sm:text-5xl lg:text-[56px]">
              Valet trash, managed the right way.
            </h1>
            <p className="mb-8 max-w-[560px] text-lg leading-relaxed text-on-navy sm:text-[19px]">
              Doorstep pickup, bulk removal and pressure washing for Atlanta apartment communities, run by brothers who
              know the business from the inside.
            </p>
            <div className="mb-7 flex flex-wrap gap-3">
              <ButtonLink to="/quote" variant="light" className="px-7 py-4">
                Get a Quote
              </ButtonLink>
              <ButtonLink to="/report" variant="outline-light" className="px-[26px] py-3.5">
                Report an Issue
              </ButtonLink>
            </div>
            <p className="m-0 inline-flex items-center gap-2 rounded-full bg-gold-text px-4 py-2 text-sm font-semibold text-white">
              <ShieldIcon className="h-4 w-4" />
              Licensed, insured and ready to work
            </p>
          </div>
          <div className="min-w-0 flex-[1_1_420px]">
            <Placeholder
              onNavy
              className="aspect-[4/3]"
              label="CBES valet in uniform collecting a container at an apartment door"
            />
          </div>
        </Container>
      </section>

      <ProofStrip />

      <Container className="pt-16 pb-12 sm:pt-24 sm:pb-16">
        <Eyebrow>Services</Eyebrow>
        <SectionTitle className="mb-10">One local vendor for your trash areas</SectionTitle>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div key={s.title} className="flex flex-col gap-3 rounded-xl border border-line p-6 sm:p-8">
              <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#272B84" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {s.icon}
              </svg>
              <h3 className="m-0 text-[22px] text-ink">{s.title}</h3>
              <p className="m-0 leading-relaxed text-muted">{s.body}</p>
              <Link to="/services" className="mt-auto pt-1 text-[15px] font-bold">
                Learn more<span className="sr-only"> about {s.title}</span>
              </Link>
            </div>
          ))}
        </div>
      </Container>

      <section id="how" className="bg-surface">
        <Container className="py-16 sm:py-[88px]">
          <Eyebrow>How a service night works</Eyebrow>
          <SectionTitle className="mb-10">Out by 8 PM. Gone by morning. Reported by Monday.</SectionTitle>
          <ol className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="rounded-xl border-t-4 border-navy bg-white p-6">
                <p className="mt-0 mb-2 font-heading text-[28px] font-bold text-gold" aria-hidden="true">
                  {i + 1}
                </p>
                <p className="mt-0 mb-1.5 text-[17px] font-bold">{title}</p>
                <p className="m-0 text-[15px] leading-normal text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Container className="flex flex-wrap items-center gap-12 py-16 sm:py-24 lg:gap-14">
        <div className="min-w-0 flex-[1_1_460px]">
          <Eyebrow>Why CBES</Eyebrow>
          <SectionTitle className="mb-6">Accountability you can see</SectionTitle>
          <ul className="m-0 flex list-none flex-col gap-[18px] p-0">
            <CheckItem>
              <strong>Owner-managed.</strong> Nick and Nigel are on the routes, not behind a call center.
            </CheckItem>
            <CheckItem>
              <strong>Every report answered within 24 hours,</strong> and fully visible to your management team.
            </CheckItem>
            <CheckItem>
              <strong>Overwatch program.</strong> Units with 3 or more violations in 30 days are flagged early.
            </CheckItem>
            <CheckItem>
              <strong>Fair to residents.</strong> Violations go to your office with a photo; you decide any notice.
            </CheckItem>
            <CheckItem>
              <strong>Trained, uniformed W-2 valets</strong> and branded containers we supply.
            </CheckItem>
          </ul>
        </div>
        <figure className="m-0 min-w-0 flex-[1_1_460px] rounded-2xl border border-line bg-white p-5 shadow-[0_12px_32px_rgba(39,43,132,0.10)] sm:p-6">
          <figcaption className="mb-1 text-[13px] text-muted">Weekly report preview (sample layout)</figcaption>
          <p className="mt-0 mb-5 font-heading text-xl font-bold text-navy">[Community name] · Week of [date]</p>
          <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
            {[
              ["5 / 5", "Nights serviced"],
              ["[ ]", "Reports resolved"],
              ["[ ]", "Overwatch units"],
            ].map(([v, l]) => (
              <div key={l} className="rounded-[10px] bg-tint p-3 sm:p-3.5">
                <p className="m-0 text-xl font-bold text-navy sm:text-2xl">{v}</p>
                <p className="mt-0.5 mb-0 text-xs text-muted sm:text-[13px]">{l}</p>
              </div>
            ))}
          </div>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-sm">
            <li className="flex justify-between gap-3 border-b border-[#EEEEF4] pb-2">
              <span>Bldg 4 · Unit [ ] · Trash not tied</span>
              <span className="font-semibold text-success">Logged</span>
            </li>
            <li className="flex justify-between gap-3 border-b border-[#EEEEF4] pb-2">
              <span>Resident report · Missed pickup</span>
              <span className="font-semibold text-success">Resolved</span>
            </li>
            <li className="flex justify-between gap-3">
              <span>Spot pressure washing · Bldg 2</span>
              <span className="font-semibold text-muted">Scheduled</span>
            </li>
          </ul>
        </figure>
      </Container>

      <section className="bg-surface">
        <Container className="flex flex-wrap items-center gap-10 py-16 sm:py-[88px] lg:gap-12">
          <Placeholder className="aspect-[4/3] min-w-0 flex-[1_1_380px]" label="Nick and Nigel Crawford" />
          <div className="min-w-0 flex-[1_1_520px]">
            <Eyebrow>The Crawford brothers</Eyebrow>
            <h2 className="mb-5 text-[28px] leading-tight font-bold text-navy sm:text-4xl">
              We saw how poor management let residents down. So we built a better company.
            </h2>
            <p className="mb-6 text-[17px] leading-relaxed text-muted">
              Nick brings 3 years in the valet trash industry and 10+ years in quality assurance. Nigel brings 10 years
              in apartment maintenance. Together they run every community like home.
            </p>
            <Link to="/about" className="font-bold">
              Our story
            </Link>
          </div>
        </Container>
      </section>

      <section className="bg-navy text-white">
        <Container className="flex flex-wrap items-start gap-10 py-16 sm:py-[88px] lg:gap-12">
          <div className="min-w-0 flex-[1_1_420px]">
            <h2 className="mb-4 text-[28px] leading-tight font-bold sm:text-4xl lg:text-[40px]">
              Aiming for excellence. Let's talk about your community.
            </h2>
            <p className="mb-6 text-[17px] leading-relaxed text-on-navy">
              Tell us about your property and Nick or Nigel will reach out within 24 hours.
            </p>
            <p className="m-0 leading-loose">
              <a href={business.phoneHref} className="text-white hover:text-gold-light">
                {business.phone}
              </a>
              <br />
              <a href={`mailto:${business.email}`} className="text-white hover:text-gold-light">
                {business.email}
              </a>
            </p>
          </div>
          <QuoteStarter />
        </Container>
      </section>
    </>
  );
}
