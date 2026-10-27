import type { ReactNode } from "react";
import { business } from "../config";
import { useSeo } from "../lib/seo";
import { Container, PageHero } from "../components/ui";

function DraftNotice() {
  return (
    <div role="note" className="mb-8 rounded-xl border-2 border-dashed border-gold bg-surface p-5 font-semibold text-gold-text">
      Draft placeholder. This text is not final and must be replaced after attorney review.
    </div>
  );
}

function Legal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <PageHero title={title} />
      <Container className="max-w-[820px] py-12 sm:py-16">
        <DraftNotice />
        <div className="flex flex-col gap-4 text-[17px] leading-relaxed [&_h2]:mt-6 [&_h2]:mb-0 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-navy [&_p]:m-0">
          {children}
        </div>
      </Container>
    </>
  );
}

export function PrivacyPage() {
  useSeo({ title: "Privacy Policy", description: "How CB Environment Solutions handles information you share with us.", path: "/privacy" });
  return (
    <Legal title="Privacy Policy">
      <p>
        CB Environment Solutions LLC ("CBES") collects the information you give us through this website: quote and
        contact requests (name, title, company, phone, email and property details) and resident reports (community,
        building and unit, name, phone or email, a description and optional photos).
      </p>
      <h2>How we use it</h2>
      <p>
        We use quote and contact requests to respond to you. We use resident reports to resolve the issue, and we share
        them with the management team of the community you live in. We send email confirmations about your request or
        report.
      </p>
      <h2>Service providers</h2>
      <p>
        We use service providers to run this website, store data and send email, including Cloudflare (hosting, storage
        and spam protection) and Resend (email).
      </p>
      <h2>Contact</h2>
      <p>
        Questions about your information: {business.email}, {business.phone}, {business.mailingAddress}.
      </p>
    </Legal>
  );
}

export function TermsPage() {
  useSeo({ title: "Terms of Use", description: "Terms for using the CB Environment Solutions website.", path: "/terms" });
  return (
    <Legal title="Terms of Use">
      <p>
        This website is operated by CB Environment Solutions LLC. By using it you agree to provide accurate information
        in any form you submit and not to misuse the site.
      </p>
      <h2>Quotes</h2>
      <p>
        Pricing is quoted per community. Submitting a quote request does not create a contract; services are governed by
        a separate written agreement with your property.
      </p>
      <h2>Resident reports</h2>
      <p>
        Reports you submit are shared with your community's management team. CBES replies within 24 hours but does not
        guarantee a particular outcome.
      </p>
      <h2>Contact</h2>
      <p>
        {business.email}, {business.phone}, {business.mailingAddress}.
      </p>
    </Legal>
  );
}
