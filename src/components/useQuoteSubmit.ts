import { useRef, useState } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError, submitQuote } from "../lib/api";
import type { Quote } from "../lib/schemas";
import { type TurnstileInstance } from "./TurnstileField";
import { turnstileRequired } from "../config";
import { resolveTurnstileToken } from "../lib/turnstile";

/** Shared submit flow for the quote and contact forms: Turnstile token, server field errors, success flag. */
export function useQuoteSubmit<T extends FieldValues>(setError: UseFormSetError<T>) {
  const turnstile = useRef<TurnstileInstance>(null);
  const [token, setToken] = useState("");
  const [formError, setFormError] = useState<string>();
  const [sent, setSent] = useState(false);

  const submit = async (data: Quote) => {
    setFormError(undefined);
    const turnstileToken = await resolveTurnstileToken(turnstile, token);
    if (turnstileRequired && !turnstileToken) {
      setFormError("Please complete the spam check above the button.");
      return;
    }
    try {
      await submitQuote(data, turnstileToken);
      setSent(true);
    } catch (err) {
      const e = err instanceof ApiError ? err : new ApiError("Something went wrong. Please try again.", 0);
      for (const [field, message] of Object.entries(e.fieldErrors)) setError(field as Path<T>, { message });
      setFormError(e.message);
      turnstile.current?.reset();
      setToken("");
    }
  };

  return { turnstile, setToken, formError, sent, submit };
}
