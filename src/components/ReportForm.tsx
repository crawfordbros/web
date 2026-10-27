import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { ApiError, getProperties, submitResidentReport } from "../lib/api";
import { compressPhoto } from "../lib/images";
import {
  ISSUE_TYPES,
  ISSUE_TYPE_LABELS,
  OTHER_COMMUNITY,
  PHOTO_LIMITS,
  residentReportSchema,
  type IssueType,
  type ResidentReport,
  type ResidentReportInput,
} from "../lib/schemas";
import { Choice, ChoiceGroup, FormAlert, SelectField, TextArea, TextField } from "./fields";
import { useArmed } from "./useArmed";
import { useHydrated } from "./useHydrated";
import { TurnstileField, type TurnstileInstance } from "./TurnstileField";
import { turnstileRequired } from "../config";
import { resolveTurnstileToken } from "../lib/turnstile";
import { Button } from "./ui";
import { cx } from "./styles";

type Photo = { file: File; url: string };

function todayIso() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function PhotoPicker({ photos, onChange, error }: { photos: Photo[]; onChange: (p: Photo[]) => void; error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>();

  const add = (files: FileList | null) => {
    if (!files) return;
    const room = PHOTO_LIMITS.maxCount - photos.length;
    const picked = Array.from(files).filter((f) => f.type.startsWith("image/"));
    setMessage(picked.length > room ? `You can add up to ${PHOTO_LIMITS.maxCount} photos.` : undefined);
    onChange([...photos, ...picked.slice(0, room).map((file) => ({ file, url: URL.createObjectURL(file) }))]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (i: number) => {
    URL.revokeObjectURL(photos[i].url);
    onChange(photos.filter((_, j) => j !== i));
    setMessage(undefined);
  };

  const shown = error ?? message;
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:col-span-2">
      <span className="text-sm font-semibold" id="photos-label">
        Photos <span className="font-normal text-muted">(optional, up to {PHOTO_LIMITS.maxCount})</span>
      </span>
      <div className="flex flex-wrap items-center gap-3">
        {photos.map((p, i) => (
          <div key={p.url} className="relative">
            <img src={p.url} alt={`Photo ${i + 1}`} className="h-20 w-20 rounded-lg border border-line object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white"
              aria-label={`Remove photo ${i + 1}`}
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        ))}
        {photos.length < PHOTO_LIMITS.maxCount && (
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-2 border-navy bg-white px-5 font-bold text-navy hover:bg-tint has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold">
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8a2 2 0 012-2h2l2-2h6l2 2h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            Add photos
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              aria-labelledby="photos-label"
              onChange={(e) => add(e.target.files)}
            />
          </label>
        )}
      </div>
      {shown && <p className="m-0 text-[13px] font-semibold text-danger">{shown}</p>}
    </div>
  );
}

function Submitted({ refNo, token }: { refNo: number; token: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);
  return (
    <div className="rounded-2xl border border-line bg-white p-6 sm:p-8" role="status">
      <h3 ref={headingRef} tabIndex={-1} className="mt-0 mb-3 text-2xl text-navy outline-none">
        Thanks. We got your report #{refNo}.
      </h3>
      <p className="mb-5 leading-relaxed text-muted">
        CB Environment Solutions replies within 24 hours. Your report is also shared with your property management
        team. Save the link below to check its status any time.
      </p>
      <Link
        to={`/report/${token}`}
        className="inline-flex min-h-11 items-center rounded-lg bg-navy px-6 font-bold text-white no-underline hover:bg-navy-dark hover:text-white"
      >
        Check your report status
      </Link>
    </div>
  );
}

export function ReportForm({ className }: { className?: string }) {
  const [params] = useSearchParams();
  const qrProperty = params.get("p") ?? "";
  const qrUnit = params.get("u") ?? "";
  const presetType = params.get("type");

  const properties = useQuery({ queryKey: ["properties"], queryFn: getProperties, staleTime: 5 * 60_000 });

  const defaults = useMemo<ResidentReportInput>(
    () => ({
      propertySlug: qrProperty,
      communityText: "",
      unitText: qrUnit ? `Unit ${qrUnit}` : "",
      unitCode: qrUnit,
      reporterName: "",
      reporterContact: "",
      issueType: (ISSUE_TYPES as readonly string[]).includes(presetType ?? "") ? (presetType as IssueType) : "missed_pickup",
      issueDate: todayIso(),
      description: "",
      source: qrProperty || qrUnit ? "qr" : "web",
    }),
    [qrProperty, qrUnit, presetType],
  );

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResidentReportInput, unknown, ResidentReport>({
    resolver: zodResolver(residentReportSchema),
    defaultValues: defaults,
  });

  // Re-apply defaults once the community list arrives so a QR pre-fill selects its option.
  useEffect(() => {
    if (properties.data) reset(defaults, { keepDirtyValues: true });
  }, [properties.data, defaults, reset]);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState<string>();
  const [token, setToken] = useState("");
  const [formError, setFormError] = useState<string>();
  const [done, setDone] = useState<{ refNo: number; token: string }>();
  const turnstile = useRef<TurnstileInstance>(null);
  const { armed, armProps } = useArmed();
  const hydrated = useHydrated();

  const propertySlug = useWatch({ control, name: "propertySlug" });
  const issueType = useWatch({ control, name: "issueType" });

  const submitReport = async (data: ResidentReport) => {
    setFormError(undefined);
    setPhotoError(undefined);
    const turnstileToken = await resolveTurnstileToken(turnstile, token);
    if (turnstileRequired && !turnstileToken) {
      setFormError("Please complete the spam check above the Submit button.");
      return;
    }
    try {
      const blobs = await Promise.all(photos.map((p) => compressPhoto(p.file)));
      const result = await submitResidentReport(data, blobs, turnstileToken);
      photos.forEach((p) => URL.revokeObjectURL(p.url));
      setDone(result);
    } catch (err) {
      const e = err instanceof ApiError ? err : new ApiError("Something went wrong. Please try again.", 0);
      for (const [field, message] of Object.entries(e.fieldErrors)) {
        if (field === "photos") setPhotoError(message);
        else setError(field as keyof ResidentReportInput, { message });
      }
      setFormError(e.message);
      turnstile.current?.reset();
      setToken("");
    }
  };
  const onSubmit = (e: React.FormEvent) => handleSubmit(submitReport)(e);

  if (done) return <Submitted {...done} />;

  return (
    <form
      noValidate
      {...armProps}
      onSubmit={onSubmit}
      aria-label="Report an issue"
      className={cx(
        "grid grid-cols-1 gap-5 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2 sm:p-8",
        className,
      )}
    >
      <SelectField label="Community" error={errors.propertySlug?.message} {...register("propertySlug")}>
        <option value="">{properties.isLoading ? "Loading communities…" : "Select…"}</option>
        {properties.data?.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.name}
          </option>
        ))}
        <option value={OTHER_COMMUNITY}>My community isn't listed</option>
      </SelectField>
      {propertySlug === OTHER_COMMUNITY && (
        <TextField
          label="Community name"
          placeholder="Type your community name"
          error={errors.communityText?.message}
          {...register("communityText")}
        />
      )}
      <TextField
        label="Building and unit"
        placeholder="e.g. Bldg 4, Unit 412"
        error={errors.unitText?.message}
        {...register("unitText")}
      />
      <TextField label="Your name" autoComplete="name" error={errors.reporterName?.message} {...register("reporterName")} />
      <TextField
        label="Phone or email"
        autoComplete="email"
        inputMode="email"
        hint="We send your confirmation and status link here."
        error={errors.reporterContact?.message}
        {...register("reporterContact")}
      />

      <ChoiceGroup legend="What happened?" error={errors.issueType?.message} className="sm:col-span-2">
        {ISSUE_TYPES.map((t) => (
          <Choice key={t} type="radio" value={t} label={ISSUE_TYPE_LABELS[t]} {...register("issueType")} />
        ))}
      </ChoiceGroup>

      <TextField
        label="Date of issue"
        type="date"
        max={todayIso()}
        error={errors.issueDate?.message}
        {...register("issueDate")}
      />

      <PhotoPicker photos={photos} onChange={setPhotos} error={photoError} />

      <TextArea
        label="Tell us more"
        optional={issueType !== "other"}
        className="sm:col-span-2"
        error={errors.description?.message}
        {...register("description")}
      />

      <div className="flex flex-col gap-4 sm:col-span-2">
        <TurnstileField ref={turnstile} armed={armed} onToken={setToken} />
        {formError && <FormAlert>{formError}</FormAlert>}
        <Button type="submit" disabled={isSubmitting || !hydrated} className="w-full sm:w-auto sm:justify-self-start">
          {isSubmitting ? "Sending…" : "Submit report"}
        </Button>
      </div>
    </form>
  );
}
