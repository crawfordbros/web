import type { RefObject } from "react";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { turnstileRequired } from "../config";

const WAIT_MS = 10_000;

/**
 * Returns a Turnstile token for a submit. When the visitor submits before the widget has finished
 * (fast typing, autofill), waits up to 10 seconds for it instead of failing straight away.
 * Returns "" when Turnstile is off (local) or no token arrived in time.
 */
export async function resolveTurnstileToken(ref: RefObject<TurnstileInstance | null>, current: string): Promise<string> {
  if (!turnstileRequired || current) return current;
  const deadline = Date.now() + WAIT_MS;
  // The widget mounts on first interaction with the form, so its instance may appear a moment later.
  while (!ref.current && Date.now() < deadline) await new Promise((r) => setTimeout(r, 100));
  if (!ref.current) return "";
  try {
    return await ref.current.getResponsePromise(Math.max(0, deadline - Date.now()));
  } catch {
    return "";
  }
}
