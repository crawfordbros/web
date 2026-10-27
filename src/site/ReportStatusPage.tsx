import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { business } from "../config";
import { ApiError, getReportStatus, type ReportStatusResponse } from "../lib/api";
import { useSeo } from "../lib/seo";
import { Container } from "../components/ui";
import { cx } from "../components/styles";

const STEPS = ["Received", "In progress", "Resolved"] as const;

function stepIndex(status: ReportStatusResponse["status"]) {
  if (status === "resolved" || status === "closed") return 2;
  if (status === "assigned" || status === "in_progress") return 1;
  return 0;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function ReportStatusPage() {
  const { token = "" } = useParams();
  useSeo({ title: "Report status", description: "The status of your report to CB Environment Solutions.", path: "/report", noindex: true });

  const query = useQuery({
    queryKey: ["report-status", token],
    queryFn: () => getReportStatus(token),
    retry: (count, err) => !(err instanceof ApiError && err.status === 404) && count < 2,
  });

  return (
    <section className="bg-surface">
      <Container className="max-w-[760px] pt-10 pb-16 sm:pt-14 sm:pb-20">
        {query.isLoading && <p className="text-muted" role="status">Loading your report…</p>}

        {query.isError && (
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <h1 className="mt-0 mb-3 text-[28px] font-bold text-navy">
              {query.error instanceof ApiError && query.error.status === 404 ? "We couldn't find that report" : "Something went wrong"}
            </h1>
            <p className="mb-5 leading-relaxed text-muted">
              Check that you opened the full link from your confirmation email. You can also call us at{" "}
              <a href={business.phoneHref}>{business.phone}</a>.
            </p>
            <Link to="/report" className="font-bold">
              Report a new issue
            </Link>
          </div>
        )}

        {query.data && (
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <p className="mt-0 mb-1 text-sm font-semibold text-gold-text">Report #{query.data.refNo}</p>
            <h1 className="mt-0 mb-6 text-[28px] font-bold text-navy sm:text-4xl">{query.data.statusLabel}</h1>

            <ol className="mb-8 grid list-none grid-cols-3 gap-2 p-0" aria-label="Progress">
              {STEPS.map((label, i) => {
                const reached = i <= stepIndex(query.data.status);
                return (
                  <li key={label} aria-current={i === stepIndex(query.data.status) ? "step" : undefined}>
                    <div className={cx("mb-2 h-2 rounded-full", reached ? "bg-navy" : "bg-line")} />
                    <span className={cx("text-sm", reached ? "font-bold text-navy" : "text-muted")}>{label}</span>
                  </li>
                );
              })}
            </ol>

            <dl className="m-0 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ["What happened", query.data.issueLabel],
                ["Community", query.data.community],
                ["Building and unit", query.data.unit ?? "Not given"],
                ["Submitted", fmt(query.data.createdAt)],
                ["First reply", query.data.firstResponseAt ? fmt(query.data.firstResponseAt) : "Within 24 hours of submitting"],
                ...(query.data.resolvedAt ? [["Resolved", fmt(query.data.resolvedAt)]] : []),
              ].map(([term, value]) => (
                <div key={term} className="rounded-[10px] bg-surface p-4">
                  <dt className="text-[13px] text-muted">{term}</dt>
                  <dd className="mt-1 mb-0 font-semibold">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 mb-0 text-[15px] leading-relaxed text-muted">
              Questions about this report? Call <a href={business.phoneHref}>{business.phone}</a> or email{" "}
              <a href={`mailto:${business.email}?subject=Report%20%23${query.data.refNo}`}>{business.email}</a> with
              your report number.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}
