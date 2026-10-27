import { business } from "../config";
import { useSeo } from "../lib/seo";
import { QuoteForm } from "../components/QuoteForm";
import { CheckItem, Container, Eyebrow } from "../components/ui";

export function QuotePage() {
  useSeo({
    title: "Get a Quote",
    description:
      "Request a valet trash quote for your Atlanta apartment community. Nick or Nigel will reach out within 24 hours with a quote built for your unit count.",
    path: "/quote",
  });

  return (
    <div className="bg-surface">
      <Container className="flex flex-wrap items-start gap-10 py-12 sm:py-16 lg:gap-12">
        <div className="min-w-0 flex-[1_1_340px]">
          <Eyebrow>Get a quote</Eyebrow>
          <h1 className="mb-4 text-[34px] leading-tight font-bold text-navy sm:text-[44px]">Let's talk about your community.</h1>
          <p className="mb-6 text-[17px] leading-relaxed text-muted">
            Tell us a little about your property. Nick or Nigel will reach out within 24 hours with a quote built for
            your unit count and services.
          </p>
          <ul className="mb-8 flex list-none flex-col gap-3 p-0">
            <CheckItem>Containers supplied by CBES</CheckItem>
            <CheckItem>Weekly report every Monday</CheckItem>
            <CheckItem>12-month, 36-month and month-to-month options</CheckItem>
            <CheckItem>Licensed and insured</CheckItem>
          </ul>
          <div className="rounded-xl bg-navy p-6 leading-loose text-white">
            <p className="m-0 font-bold">Prefer to call?</p>
            <p className="m-0">
              <a href={business.phoneHref} className="text-white hover:text-gold-light">
                {business.phone}
              </a>
              <br />
              <a href={`mailto:${business.email}`} className="text-white hover:text-gold-light">
                {business.email}
              </a>
            </p>
          </div>
        </div>
        <QuoteForm />
      </Container>
    </div>
  );
}
