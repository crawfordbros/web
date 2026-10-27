import { useState } from "react";

/**
 * Becomes true the first time someone focuses or touches the form. Used to load the Turnstile
 * script only when a visitor actually starts filling in a form, not on every page view.
 */
export function useArmed() {
  const [armed, setArmed] = useState(false);
  const arm = () => setArmed(true);
  return { armed, armProps: armed ? {} : { onFocusCapture: arm, onPointerDownCapture: arm } };
}
