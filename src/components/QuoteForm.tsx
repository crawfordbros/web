import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "react-router-dom";
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  SERVICES,
  SERVICE_LABELS,
  quoteSchema,
  type Quote,
  type QuoteInput,
} from "../lib/schemas";
import { business } from "../config";
import { Choice, ChoiceGroup, FormAlert, SelectField, TextArea, TextField } from "./fields";
import { useArmed } from "./useArmed";
import { useHydrated } from "./useHydrated";
import { TurnstileField } from "./TurnstileField";
import { useQuoteSubmit } from "./useQuoteSubmit";
import { Button } from "./ui";

function Section({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="m-0 grid min-w-0 grid-cols-1 gap-4 border-0 p-0 sm:grid-cols-2">
      <legend className="mb-4 flex items-center gap-3 p-0 font-heading text-xl font-bold text-navy">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-base text-white" aria-hidden="true">
          {step}
        </span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export function QuoteForm() {
  // Values typed into the home page quote starter arrive as navigation state.
  const starter = (useLocation().state ?? {}) as Partial<Record<"name" | "email" | "community" | "units", string>>;
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput, unknown, Quote>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      kind: "quote",
      fullName: starter.name ?? "",
      email: starter.email ?? "",
      communityName: starter.community ?? "",
      unitCount: starter.units ?? "",
      services: ["valet_trash", "pressure_washing"],
    },
  });
  const { turnstile, setToken, formError, sent, submit } = useQuoteSubmit(setError);
  const { armed, armProps } = useArmed();
  const hydrated = useHydrated();

  if (sent) {
    return (
      <div role="status" className="min-w-0 flex-[1_1_560px] rounded-2xl border border-line bg-white p-6 sm:p-9">
        <h2 className="mt-0 mb-3 text-[28px] font-bold text-navy">Thanks. We got your request.</h2>
        <p className="m-0 text-[17px] leading-relaxed text-muted">
          Nick or Nigel will reach out within 24 hours. Need us sooner? Call{" "}
          <a href={business.phoneHref}>{business.phone}</a>.
        </p>
      </div>
    );
  }

  return (
    <form
      id="quote-form"
      noValidate
      {...armProps}
      onSubmit={handleSubmit(submit)}
      aria-label="Request a quote"
      className="flex min-w-0 flex-[1_1_560px] flex-col gap-8 rounded-2xl border border-line bg-white p-5 sm:p-9"
    >
      <Section step={1} title="About you">
        <TextField label="Full name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
        <TextField label="Title" placeholder="Community Manager" optional autoComplete="organization-title" {...register("title")} />
        <TextField label="Management company" optional autoComplete="organization" {...register("company")} />
        <TextField label="Phone" type="tel" optional autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
        <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      </Section>

      <Section step={2} title="Your property">
        <TextField label="Community name" error={errors.communityName?.message} {...register("communityName")} />
        <TextField label="Number of units" type="number" inputMode="numeric" min={1} error={errors.unitCount?.message} {...register("unitCount")} />
        <TextField label="Address" optional autoComplete="street-address" className="sm:col-span-2" {...register("address")} />
        <SelectField label="Property type" optional {...register("propertyType", { setValueAs: (v) => v || undefined })}>
          <option value="">Select…</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {PROPERTY_TYPE_LABELS[t]}
            </option>
          ))}
        </SelectField>
        <TextField label="Desired start date" type="date" optional error={errors.desiredStart?.message} {...register("desiredStart")} />
      </Section>

      <Section step={3} title="Services">
        <ChoiceGroup legend="Services you're interested in" className="sm:col-span-2">
          {SERVICES.map((s) => (
            <Choice key={s} type="checkbox" value={s} label={SERVICE_LABELS[s]} {...register("services")} />
          ))}
        </ChoiceGroup>
        <TextField label="Current provider" optional className="sm:col-span-2" {...register("currentProvider")} />
        <TextArea label="Anything else we should know?" optional className="sm:col-span-2" {...register("notes")} />
      </Section>

      <div className="flex flex-col gap-4">
        <TurnstileField ref={turnstile} action="quote" armed={armed} onToken={setToken} />
        {formError && <FormAlert>{formError}</FormAlert>}
        <Button type="submit" disabled={isSubmitting || !hydrated} className="w-full sm:w-auto sm:self-start">
          {isSubmitting ? "Sending…" : "Request my quote"}
        </Button>
      </div>
    </form>
  );
}
