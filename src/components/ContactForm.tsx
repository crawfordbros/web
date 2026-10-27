import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteSchema, type Quote, type QuoteInput } from "../lib/schemas";
import { FormAlert, TextArea, TextField } from "./fields";
import { useArmed } from "./useArmed";
import { useHydrated } from "./useHydrated";
import { TurnstileField } from "./TurnstileField";
import { useQuoteSubmit } from "./useQuoteSubmit";
import { Button } from "./ui";

/** Short contact form. Posts to the quote endpoint with kind "contact". */
export function ContactForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput, unknown, Quote>({
    resolver: zodResolver(quoteSchema),
    defaultValues: { kind: "contact", fullName: "", email: "", phone: "", notes: "" },
  });
  const { turnstile, setToken, formError, sent, submit } = useQuoteSubmit(setError);
  const { armed, armProps } = useArmed();
  const hydrated = useHydrated();

  if (sent) {
    return (
      <div role="status" className="rounded-2xl border border-line bg-white p-6 sm:p-8">
        <h2 className="mt-0 mb-2 text-2xl font-bold text-navy">We got your message.</h2>
        <p className="m-0 text-muted">Nick or Nigel will reach out within 24 hours.</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      {...armProps}
      onSubmit={handleSubmit(submit)}
      aria-label="Contact us"
      className="grid grid-cols-1 gap-4 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2 sm:p-8"
    >
      <TextField label="Name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
      <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <TextField label="Phone" type="tel" optional autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
      <TextField label="Company or community" optional autoComplete="organization" {...register("company")} />
      <TextArea label="Message" className="sm:col-span-2" error={errors.notes?.message} {...register("notes")} />
      <div className="flex flex-col gap-4 sm:col-span-2">
        <TurnstileField ref={turnstile} armed={armed} onToken={setToken} />
        {formError && <FormAlert>{formError}</FormAlert>}
        <Button type="submit" disabled={isSubmitting || !hydrated} className="w-full sm:w-auto sm:self-start">
          {isSubmitting ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
