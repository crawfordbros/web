// Request schemas shared by the API and the website forms.
// Copied from cbes-api/src/shared/schemas.ts, which is the source of truth. cbes-web keeps this
// identical copy in src/lib/schemas.ts. Change both together.
import { z } from "zod";

export const ISSUE_TYPES = [
  "missed_pickup",
  "trash_in_hallway",
  "container_damaged_missing",
  "spill_mess",
  "item_taken",
  "valet_conduct_noise",
  "bulk_pickup_request",
  "other",
] as const;
export type IssueType = (typeof ISSUE_TYPES)[number];

/**
 * An issue type key. The list lives in the issue_types table (Settings → Resident issue types), so
 * the API checks the key exists; ISSUE_TYPES above are the original eight.
 */
export const issueTypeKey = (message: string) =>
  z.string({ error: message }).trim().min(1, message).max(60, message).regex(/^[a-z0-9_]+$/, message);

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  missed_pickup: "Missed pickup",
  trash_in_hallway: "Trash in hallway",
  container_damaged_missing: "Container damaged or missing",
  spill_mess: "Spill or mess",
  item_taken: "Item taken by mistake",
  valet_conduct_noise: "Valet conduct or noise",
  bulk_pickup_request: "Bulk pickup request",
  other: "Other",
};

export const SERVICES = [
  "valet_trash",
  "bulk_trash",
  "pressure_washing",
  "trash_outs",
  "lot_cleanup",
  "full_pressure_washing",
] as const;
export type Service = (typeof SERVICES)[number];

export const SERVICE_LABELS: Record<Service, string> = {
  valet_trash: "Doorstep valet trash",
  bulk_trash: "Bulk trash removal",
  pressure_washing: "Annual spot pressure washing",
  trash_outs: "Apartment trash-outs",
  lot_cleanup: "Nightly lot cleanup",
  full_pressure_washing: "Full-service pressure washing",
};

export const PROPERTY_TYPES = ["garden", "mid_rise", "high_rise"] as const;
export const PROPERTY_TYPE_LABELS: Record<(typeof PROPERTY_TYPES)[number], string> = {
  garden: "Garden",
  mid_rise: "Mid-rise",
  high_rise: "High-rise",
};

export const REPORT_STATUS_LABELS = {
  new: "Received",
  assigned: "Assigned",
  in_progress: "In progress",
  resolved: "Resolved",
  closed: "Closed",
} as const;
export type ReportStatus = keyof typeof REPORT_STATUS_LABELS;

/** Value used in the community picker when the resident's community is not listed. */
export const OTHER_COMMUNITY = "other";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return /^[\d\s().+-]+$/.test(value) && digits.length >= 10 && digits.length <= 15;
}

function isEmailOrPhone(value: string): boolean {
  return EMAIL_RE.test(value) || isPhone(value);
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const isoDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => v === undefined || /^\d{4}-\d{2}-\d{2}$/.test(v), "Use the date picker");

export const residentReportSchema = z
  .object({
    propertySlug: z.string().trim().min(1, "Choose your community").max(80),
    communityText: optionalText(120),
    unitText: z.string().trim().min(1, "Enter your building and unit").max(60),
    unitCode: optionalText(20),
    reporterName: z.string().trim().min(1, "Enter your name").max(100),
    reporterEmail: z.string().trim().min(1, "Enter your email").max(120).regex(EMAIL_RE, "Enter a valid email"),
    /** Set when the resident opened "Can we call you?"; the phone number is then required. */
    wantsCall: z.boolean().optional().default(false),
    reporterPhone: optionalText(30),
    issueType: issueTypeKey("Choose what happened"),
    issueDate: z
      .string()
      .trim()
      .min(1, "Enter the date it happened")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker"),
    description: z.string().trim().min(1, "Tell us what happened").max(2000),
    source: z.enum(["web", "qr"]).optional().default("web"),
  })
  .superRefine((v, ctx) => {
    if (v.propertySlug === OTHER_COMMUNITY && !v.communityText) {
      ctx.addIssue({ code: "custom", path: ["communityText"], message: "Type your community name" });
    }
    if (v.wantsCall && !v.reporterPhone) {
      ctx.addIssue({ code: "custom", path: ["reporterPhone"], message: "Enter your phone number" });
    } else if (v.wantsCall && v.reporterPhone && !isPhone(v.reporterPhone)) {
      ctx.addIssue({ code: "custom", path: ["reporterPhone"], message: "Enter a valid phone number" });
    }
  });
export type ResidentReportInput = z.input<typeof residentReportSchema>;
export type ResidentReport = z.output<typeof residentReportSchema>;

const unitCount = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number({ error: "Enter a number" }).int("Enter a whole number").min(1).max(20000).optional(),
);

export const quoteSchema = z
  .object({
    kind: z.enum(["quote", "contact"]),
    fullName: z.string().trim().min(1, "Enter your name").max(100),
    title: optionalText(100),
    company: optionalText(150),
    phone: optionalText(30).refine((v) => v === undefined || isEmailOrPhone(v), "Enter a valid phone number"),
    email: z.string().trim().regex(EMAIL_RE, "Enter a valid email").max(150),
    communityName: optionalText(150),
    unitCount,
    address: optionalText(250),
    propertyType: z.enum(PROPERTY_TYPES).optional(),
    desiredStart: isoDate,
    services: z.array(z.enum(SERVICES)).max(SERVICES.length).optional().default([]),
    currentProvider: optionalText(150),
    notes: optionalText(4000),
  })
  .superRefine((v, ctx) => {
    if (v.kind === "quote") {
      if (!v.communityName) ctx.addIssue({ code: "custom", path: ["communityName"], message: "Enter the community name" });
      if (v.unitCount === undefined) ctx.addIssue({ code: "custom", path: ["unitCount"], message: "Enter the number of units" });
    } else if (!v.notes) {
      ctx.addIssue({ code: "custom", path: ["notes"], message: "Enter a message" });
    }
  });
export type QuoteInput = z.input<typeof quoteSchema>;
export type Quote = z.output<typeof quoteSchema>;

export const PHOTO_LIMITS = { maxCount: 3, maxBytes: 10 * 1024 * 1024 } as const;
