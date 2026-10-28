import type { QuoteInput, ReportStatus, ResidentReportInput } from "./schemas";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
  }
}

const NETWORK_ERROR = "We couldn't reach the server. Check your connection and try again, or email office@cbenvironments.com.";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new ApiError(NETWORK_ERROR, 0);
  }
  const body = (await res.json().catch(() => ({}))) as { error?: string; fieldErrors?: Record<string, string> };
  if (!res.ok) {
    throw new ApiError(body.error ?? "Something went wrong. Please try again.", res.status, body.fieldErrors);
  }
  return body as T;
}

export type PropertyOption = { name: string; slug: string };

export function getProperties() {
  return request<{ properties: PropertyOption[] }>("/api/properties").then((r) => r.properties);
}

export function submitResidentReport(data: ResidentReportInput, photos: Blob[], turnstileToken: string) {
  const form = new FormData();
  form.set("data", JSON.stringify(data));
  form.set("turnstileToken", turnstileToken);
  photos.forEach((p, i) => form.append("photos", p, `photo-${i + 1}.${p.type === "image/jpeg" ? "jpg" : "img"}`));
  return request<{ refNo: number; token: string }>("/api/resident-reports", { method: "POST", body: form });
}

export type ReportStatusResponse = {
  refNo: number;
  status: ReportStatus;
  statusLabel: string;
  issueType: string;
  issueLabel: string;
  community: string;
  unit: string | null;
  createdAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
};

export type Day = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";
/** What CBES sets in Admin → Settings: the report form's issue types and the service calendar. */
export type PublicSettings = {
  issueTypes: { key: string; label: string; labelEs: string | null }[];
  serviceNights: Day[];
  startTime: string;
  holidays: { date: string; name: string }[];
};

export function getPublicSettings() {
  return request<PublicSettings>("/api/settings/public");
}

export function getReportStatus(token: string) {
  return request<ReportStatusResponse>(`/api/resident-reports/${encodeURIComponent(token)}`);
}

export function submitQuote(data: QuoteInput, turnstileToken: string) {
  return request<{ ok: true }>("/api/quotes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, turnstileToken }),
  });
}
