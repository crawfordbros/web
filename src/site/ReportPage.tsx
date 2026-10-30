import { Link } from "react-router-dom";
import { business } from "../config";
import { useSeo } from "../lib/seo";
import { ReportForm } from "../components/ReportForm";
import { Container } from "../components/ui";

/** Standalone report form. QR codes on containers link here as /report?p=<property>&u=<unit>. */
export function ReportPage() {
  useSeo({
    title: "Report an Issue",
    description:
      "Report a missed pickup, trash in a hallway, a damaged container or request a bulk pickup. CB Environment Solutions replies within 24 hours.",
    path: "/report",
  });

  return (
    <section className="bg-surface">
      <Container className="max-w-[880px] pt-10 pb-14 sm:pt-14 sm:pb-20">
        <h1 className="mb-2 text-[32px] font-bold text-navy sm:text-[44px]">Report an Issue</h1>
        <p className="mb-8 text-[17px] leading-relaxed text-muted">
          We reply within 24 hours. Your issue is also shared with your property management team. Prefer email?{" "}
          <a href={`mailto:${business.email}`} className="font-semibold whitespace-nowrap">
            {business.email}
          </a>
          . See the <Link to="/residents">trash rules and service nights</Link>.
        </p>
        <ReportForm />
      </Container>
    </section>
  );
}
