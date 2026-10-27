import { useSeo } from "../lib/seo";
import { ButtonLink, Container, Eyebrow, PageHero, Placeholder } from "../components/ui";

const FACTS = [
  ["Service nights", "Sunday to Thursday"],
  ["Containers out by", "8:00 PM"],
  ["Containers", "Supplied by CBES within 45 days"],
  ["Reporting", "Every Monday, 7 AM"],
];

const ADD_ONS = [
  [
    "Bulk Trash Removal",
    "Furniture and large items hauled to a permitted facility at a per-load rate. Residents book online; managers can order for vacant units.",
  ],
  ["Apartment Trash-Outs", "Move-out and vacant unit clean-outs so your make-ready team can start sooner."],
  ["Nightly Lot Cleanup", "Litter pickup across parking lots and common areas on service nights."],
];

export function ServicesPage() {
  useSeo({
    title: "Services: Valet Trash, Bulk Removal, Pressure Washing",
    description:
      "Doorstep valet trash Sunday to Thursday, annual spot pressure washing, bulk trash removal, trash-outs and lot cleanup for metro Atlanta apartments.",
    path: "/services",
  });

  return (
    <>
      <PageHero eyebrow="Trash valet · Bulk trash removal · Pressure washing" title="Services">
        <p className="m-0">
          Everything around your community's trash, from the doorstep to the dumpster corral, handled by one
          accountable local team.
        </p>
      </PageHero>

      <Container className="flex flex-wrap items-center gap-10 py-16 sm:py-20 lg:gap-12">
        <div className="min-w-0 flex-[1_1_520px]">
          <Eyebrow>Core service</Eyebrow>
          <h2 className="mb-4 text-[28px] font-bold text-navy sm:text-4xl">Doorstep Valet Trash</h2>
          <p className="mb-5 text-[17px] leading-relaxed text-muted">
            Residents set bagged, tied trash in a CBES container by 8 PM. Our valets carry it to your on-site dumpster or
            compactor and check the area before they leave.
          </p>
          <dl className="m-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FACTS.map(([term, value]) => (
              <div key={term} className="rounded-[10px] bg-surface p-4">
                <dt className="text-[13px] text-muted">{term}</dt>
                <dd className="mt-1 mb-0 text-[17px] font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Placeholder className="aspect-[4/3] min-w-0 flex-[1_1_400px]" label="branded CBES container at a breezeway door" />
      </Container>

      <section className="bg-surface">
        <Container className="flex flex-wrap-reverse items-center gap-10 py-16 sm:py-20 lg:gap-12">
          <div className="grid min-w-0 flex-[1_1_400px] grid-cols-2 gap-3">
            <Placeholder className="aspect-square rounded-xl p-3 text-sm" label="Before" />
            <Placeholder className="aspect-square rounded-xl p-3 text-sm" label="After" />
          </div>
          <div className="min-w-0 flex-[1_1_480px]">
            <Eyebrow>Included once a year</Eyebrow>
            <h2 className="mb-4 text-[28px] font-bold text-navy sm:text-4xl">Annual Spot Pressure Washing</h2>
            <p className="mb-4 text-[17px] leading-relaxed text-muted">
              Once a year we pressure-wash the container area outside every door and your dumpster corrals, with before
              and after photos in your weekly report. Not just clean, pristine.
            </p>
            <p className="m-0 text-[17px] leading-relaxed text-muted">
              Need breezeways, stairwells or sidewalks done too? Full-service washing is quoted per project. Wash water
              never goes into storm drains.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        <h2 className="mb-8 text-[28px] font-bold text-navy sm:text-4xl">Add-on services</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {ADD_ONS.map(([title, body]) => (
            <div key={title} className="rounded-xl border border-line p-6 sm:p-7">
              <h3 className="mt-0 mb-2.5 text-xl">{title}</h3>
              <p className="m-0 leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-navy p-6 text-white sm:p-10">
          <div>
            <h2 className="mt-0 mb-2 text-2xl font-bold sm:text-[28px]">Pricing is quoted per community</h2>
            <p className="m-0 text-on-navy">Tell us your unit count and services. We reply within 24 hours.</p>
          </div>
          <ButtonLink to="/quote" variant="light" className="w-full sm:w-auto">
            Get a Quote
          </ButtonLink>
        </div>
      </Container>
    </>
  );
}
