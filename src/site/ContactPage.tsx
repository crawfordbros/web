import { Link } from "react-router-dom";
import { business } from "../config";
import { useSeo } from "../lib/seo";
import { ContactForm } from "../components/ContactForm";
import { Container, PageHero } from "../components/ui";

export function ContactPage() {
  useSeo({
    title: "Contact",
    description: "Email office@cbenvironments.com or send us a message. CB Environment Solutions, PO Box 645, Clarkston, GA 30021.",
    path: "/contact",
  });

  return (
    <>
      <PageHero title="Contact us">
        <p className="m-0">We reply within 24 hours.</p>
      </PageHero>
      <Container className="grid grid-cols-1 gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_1.5fr] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-5">
          <div className="rounded-xl border border-line p-6">
            <h2 className="mt-0 mb-3 text-xl font-bold text-navy">Email</h2>
            <p className="m-0 text-[17px] leading-loose">
              <a href={`mailto:${business.email}`} className="font-semibold">{business.email}</a>
            </p>
          </div>
          <div className="rounded-xl border border-line p-6">
            <h2 className="mt-0 mb-3 text-xl font-bold text-navy">Mailing address</h2>
            <p className="m-0 leading-relaxed">
              CB Environment Solutions LLC
              <br />
              {business.mailingAddress}
            </p>
          </div>
          <div className="rounded-xl bg-surface p-6 leading-relaxed">
            <p className="m-0">
              <strong>Resident with a trash issue?</strong> <Link to="/report">Report it here</Link> so it reaches your
              community's team. <strong>Property manager?</strong> <Link to="/quote">Request a quote</Link>.
            </p>
          </div>
        </div>
        <ContactForm />
      </Container>
    </>
  );
}
