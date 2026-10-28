import { forwardRef, useEffect, useMemo, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import { ApiError, submitResidentReport } from "../lib/api";
import { compressPhoto } from "../lib/images";
import { DEFAULT_ISSUE_TYPES, usePublicSettings } from "../lib/schedule";
import {
  OTHER_COMMUNITY,
  PHOTO_LIMITS,
  residentReportSchema,
  type ResidentReport,
  type ResidentReportInput,
} from "../lib/schemas";
import { Choice, ChoiceGroup, FormAlert, TextArea, TextField } from "./fields";
import { useHydrated } from "./useHydrated";
import { TurnstileField, type TurnstileInstance } from "./TurnstileField";
import { turnstileRequired } from "../config";
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

/** A quiet, link-styled button for small in-form choices (swap the community, add or drop a phone number). */
const TextButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<"button">>(function TextButton(
  { className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cx(
        "inline-flex min-h-11 shrink-0 cursor-pointer items-center self-start bg-transparent px-0 text-sm font-semibold text-navy underline underline-offset-2 hover:text-navy-dark focus-visible:rounded focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
});

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

/** The ?type= from a link when it's on the form, else Missed pickup (or the first type). */
function presetIssueType(keys: string[], preset: string | null): string {
  if (preset && keys.includes(preset)) return preset;
  return keys.includes("missed_pickup") ? "missed_pickup" : keys[0];
}

export function ReportForm({ className }: { className?: string }) {
  const [params] = useSearchParams();
  const qrProperty = params.get("p") ?? "";
  const qrUnit = params.get("u") ?? "";
  const presetType = params.get("type");

  const settings = usePublicSettings();
  const issueTypes = settings?.issueTypes.length ? settings.issueTypes : DEFAULT_ISSUE_TYPES;
  // A string, so the form defaults below only recompute when the list itself changes.
  const keyList = issueTypes.map((t) => t.key).join(",");

  const defaults = useMemo<ResidentReportInput>(
    () => ({
      // Residents type their community; only a QR link carries a property slug. We don't list the communities we serve.
      propertySlug: qrProperty || OTHER_COMMUNITY,
      communityText: "",
      unitText: qrUnit ? `Unit ${qrUnit}` : "",
      unitCode: qrUnit,
      reporterName: "",
      reporterEmail: "",
      wantsCall: false,
      reporterPhone: "",
      issueType: presetIssueType(keyList.split(","), presetType),
      issueDate: todayIso(),
      description: "",
      source: qrProperty || qrUnit ? "qr" : "web",
    }),
    [qrProperty, qrUnit, presetType, keyList],
  );

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    setValue,
    setFocus,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResidentReportInput, unknown, ResidentReport>({
    resolver: zodResolver(residentReportSchema),
    defaultValues: defaults,
  });

  // Re-apply defaults once the saved issue types arrive so a ?type= link selects its option.
  // Keep any errors from a submit that beat the list, so they don't vanish.
  useEffect(() => {
    reset(defaults, { keepDirtyValues: true, keepErrors: true, keepIsSubmitted: true });
  }, [defaults, reset]);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoError, setPhotoError] = useState<string>();
  const [token, setToken] = useState("");
  const [verificationUnavailable, setVerificationUnavailable] = useState(false);
  const [formError, setFormError] = useState<string>();
  const [done, setDone] = useState<{ refNo: number; token: string }>();
  const turnstile = useRef<TurnstileInstance>(null);
  const hydrated = useHydrated();
  const browserVerified = !turnstileRequired || Boolean(token);
  const onVerificationToken = (value: string) => {
    setToken(value);
    setVerificationUnavailable(false);
  };

  const propertySlug = useWatch({ control, name: "propertySlug" });
  const typingCommunity = propertySlug === OTHER_COMMUNITY;

  // Swap the QR community for a typed one: the resident asked to change it, or the server didn't recognize the code.
  const focusCommunity = useRef(false);
  const typeCommunityInstead = (message?: string) => {
    setValue("propertySlug", OTHER_COMMUNITY, { shouldDirty: true });
    if (message) setError("communityText", { message });
    focusCommunity.current = true;
  };
  useEffect(() => {
    if (typingCommunity && focusCommunity.current && browserVerified) {
      focusCommunity.current = false;
      setFocus("communityText");
    }
  }, [typingCommunity, browserVerified, setFocus]);

  // "Can we call you?" opens a phone field; closing it drops the number so we never call someone who backed out.
  const wantsCall = useWatch({ control, name: "wantsCall" });
  const callToggle = useRef<HTMLButtonElement>(null);
  const callMoved = useRef(false);
  const setCall = (on: boolean) => {
    setValue("wantsCall", on, { shouldDirty: true });
    if (!on) {
      setValue("reporterPhone", "", { shouldDirty: true });
      clearErrors("reporterPhone");
    }
    callMoved.current = true;
  };
  useEffect(() => {
    if (!callMoved.current) return;
    callMoved.current = false;
    if (wantsCall) setFocus("reporterPhone");
    else callToggle.current?.focus();
  }, [wantsCall, setFocus]);

  const submitReport = async (data: ResidentReport) => {
    setFormError(undefined);
    setPhotoError(undefined);
    const turnstileToken = token;
    if (turnstileRequired && !turnstileToken) {
      setFormError("Please complete the browser check at the top of the form.");
      return;
    }
    try {
      // The hidden QR unit code only applies while the community and unit are still what the QR code filled in.
      const qrUnitUnchanged = Boolean(qrUnit) && data.propertySlug === qrProperty && data.unitText === `Unit ${qrUnit}`;
      const payload = qrUnitUnchanged ? data : { ...data, unitCode: undefined };
      const blobs = await Promise.all(photos.map((p) => compressPhoto(p.file)));
      const result = await submitResidentReport(payload, blobs, turnstileToken);
      photos.forEach((p) => URL.revokeObjectURL(p.url));
      setDone(result);
    } catch (err) {
      const e = err instanceof ApiError ? err : new ApiError("Something went wrong. Please try again.", 0);
      for (const [field, message] of Object.entries(e.fieldErrors)) {
        if (field === "photos") setPhotoError(message);
        else if (field === "propertySlug") typeCommunityInstead(message);
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
      onSubmit={onSubmit}
      aria-label="Report an issue"
      className={cx(
        "flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 sm:p-8",
        className,
      )}
    >
      {turnstileRequired && (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-tint p-4">
          <div role="status" aria-live="polite">
            <p className="m-0 font-semibold text-navy">
              {browserVerified ? "Browser verified" : verificationUnavailable ? "Browser check unavailable" : "Checking your browser…"}
            </p>
            <p className="mt-1 mb-0 text-sm text-muted">
              {browserVerified
                ? "You can now fill out and submit your report."
                : verificationUnavailable
                  ? "Please retry the check below. If it doesn't load, refresh this page or email office@cbenvironments.com."
                  : "Complete the check below to report an issue. This helps prevent automated spam."}
            </p>
          </div>
          <TurnstileField
            ref={turnstile}
            action="resident_report"
            armed={hydrated}
            onToken={onVerificationToken}
            onUnavailable={() => setVerificationUnavailable(true)}
          />
          <noscript>Enable JavaScript to complete the browser check, or email office@cbenvironments.com.</noscript>
        </div>
      )}
      <fieldset
        disabled={!hydrated || !browserVerified}
        className="m-0 grid min-w-0 grid-cols-1 gap-5 border-0 p-0 sm:grid-cols-2"
      >
        <legend className="sr-only">Report details</legend>
        {typingCommunity ? (
          <TextField
            label="Community"
            placeholder="Your apartment community's name"
            error={errors.communityText?.message}
            {...register("communityText")}
          />
        ) : (
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-sm font-semibold" id="community-label">
              Community
            </span>
            <div
              className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-line bg-tint px-3"
              aria-labelledby="community-label"
              role="group"
            >
              <span className="text-ink">Filled in from your QR code</span>
              <TextButton onClick={() => typeCommunityInstead()} className="self-center">
                Change
              </TextButton>
            </div>
          </div>
        )}
        <TextField
          label="Building and unit"
          placeholder="e.g. Bldg 4, Unit 412"
          error={errors.unitText?.message}
          {...register("unitText")}
        />
        <TextField label="Your name" autoComplete="name" error={errors.reporterName?.message} {...register("reporterName")} />
        <div className="flex min-w-0 flex-col">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            hint="We send your confirmation and status link here."
            error={errors.reporterEmail?.message}
            {...register("reporterEmail")}
          />
          {wantsCall ? (
            <div className="mt-3 flex flex-col">
              <TextField
                label="Phone number"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                hint="We only call about this report."
                error={errors.reporterPhone?.message}
                {...register("reporterPhone")}
              />
              <TextButton onClick={() => setCall(false)}>Don't call me</TextButton>
            </div>
          ) : (
            <TextButton ref={callToggle} onClick={() => setCall(true)}>
              Can we call you?
            </TextButton>
          )}
        </div>

        <ChoiceGroup legend="What happened?" error={errors.issueType?.message} className="sm:col-span-2">
          {issueTypes.map((t) => (
            <Choice key={t.key} type="radio" value={t.key} label={t.label} {...register("issueType")} />
          ))}
        </ChoiceGroup>

        <TextField
          label="Date of issue"
          type="date"
          // Set only in the browser: prerendered HTML would freeze the limit at the build date.
          max={hydrated ? todayIso() : undefined}
          error={errors.issueDate?.message}
          {...register("issueDate")}
        />

        <PhotoPicker photos={photos} onChange={setPhotos} error={photoError} />

        <TextArea
          label="Tell us more"
          className="sm:col-span-2"
          error={errors.description?.message}
          {...register("description")}
        />
      </fieldset>

      <div className="flex flex-col gap-4">
        {formError && <FormAlert>{formError}</FormAlert>}
        <Button type="submit" disabled={isSubmitting || !hydrated || !browserVerified} className="w-full sm:w-auto sm:self-start">
          {isSubmitting ? "Sending…" : "Submit report"}
        </Button>
      </div>
    </form>
  );
}
