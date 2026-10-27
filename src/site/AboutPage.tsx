import { business } from "../config";
import { useSeo } from "../lib/seo";
import { Container, Eyebrow, Placeholder, ShieldIcon } from "../components/ui";

const LEADERS = [
  {
    name: "Nick Crawford",
    role: "CEO and Co-Founder",
    bio: "3 years in the valet trash industry and 10+ years in quality assurance as a Senior QA Engineer. Nick brings a tester's eye for detail to every route and report, and leads sales, clients and the CBES vision.",
  },
  {
    name: "Nigel Crawford",
    role: "Co-Founder and VP of Operations",
    bio: "10 years in apartment maintenance. Nigel runs the nightly valet teams, quality checks and pressure washing, and knows what your maintenance team deals with every day.",
  },
];

const VALUES = [
  ["Reliable", "On time, every scheduled night."],
  ["Thorough", "Every door, every building."],
  ["Respectful", "Quiet, courteous and fair to residents."],
  ["Honest", "We report problems, including our own."],
];

export function AboutPage() {
  useSeo({
    title: "About the Crawford Brothers",
    description:
      "CB Environment Solutions was founded by brothers Nick and Nigel Crawford to run valet trash the right way for Atlanta apartment communities.",
    path: "/about",
  });

  return (
    <>
      <section className="bg-navy text-white">
        <Container className="flex flex-wrap items-center gap-10 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:gap-12">
          <div className="min-w-0 flex-[1_1_560px]">
            <Eyebrow onNavy>Our story</Eyebrow>
            <h1 className="mb-5 text-4xl leading-tight font-bold sm:text-5xl">Two brothers who saw how it should be done.</h1>
            <p className="mb-4 text-lg leading-relaxed text-on-navy">
              Nick and Nigel Crawford spent years inside the valet trash industry, and saw how much a well-run amenity
              could mean to residents and property teams alike. They knew it could be a true highlight of community
              living.
            </p>
            <p className="m-0 text-lg leading-relaxed text-on-navy">
              They started CB Environment Solutions to run it the right way: owners on the route, every report answered,
              and every property treated like home. Aiming for excellence, every time.
            </p>
          </div>
          <div className="flex min-w-0 flex-[1_1_280px] justify-center">
            <div className="rounded-2xl bg-white p-6 sm:p-8">
              <img
                src="/crawford-brothers-archer.webp"
                alt="Crawford Brothers archer mark, Aiming for Excellence"
                width={480}
                height={517}
                className="h-auto w-full max-w-[260px]"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface">
        <Container className="py-16 sm:py-20">
          <h2 className="mb-8 text-[28px] font-bold text-navy sm:text-4xl">Leadership</h2>
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
            {LEADERS.map((l) => (
              <article key={l.name} className="overflow-hidden rounded-2xl border border-line bg-white">
                <Placeholder className="aspect-[16/10] rounded-none border-0 border-b-2" label={l.name} />
                <div className="p-6 sm:p-7">
                  <h3 className="m-0 text-2xl">{l.name}</h3>
                  <p className="mt-1 mb-3 font-semibold text-gold-text">{l.role}</p>
                  <p className="m-0 leading-relaxed text-muted">{l.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <Container className="flex flex-wrap gap-10 py-16 sm:py-20 lg:gap-12">
        <div className="min-w-0 flex-[1_1_480px]">
          <h2 className="mb-6 text-[28px] font-bold text-navy sm:text-4xl">What we stand for</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {VALUES.map(([title, body]) => (
              <div key={title} className="rounded-xl border border-line p-5">
                <p className="mt-0 mb-1 font-heading text-xl font-bold text-navy">{title}</p>
                <p className="m-0 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-[1_1_400px] rounded-2xl bg-navy p-6 text-white sm:p-8">
          <h2 className="mt-0 mb-3 text-2xl font-bold sm:text-[28px]">Where we work</h2>
          <p className="mb-4 text-on-navy">Based in Clarkston, serving apartment communities across metro Atlanta.</p>
          <ul className="mb-6 flex list-none flex-wrap gap-2 p-0">
            {[...business.counties, "and more"].map((c) => (
              <li key={c} className="rounded-full border border-gold-light px-3.5 py-1.5 text-[15px] font-semibold">
                {c}
              </li>
            ))}
          </ul>
          <p className="m-0 inline-flex items-center gap-2 font-semibold text-gold-light">
            <ShieldIcon className="h-5 w-5" />
            Licensed, insured and ready to work.
          </p>
        </div>
      </Container>
    </>
  );
}
