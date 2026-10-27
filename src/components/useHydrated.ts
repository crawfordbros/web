import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * False in prerendered HTML and during hydration, true once React owns the page. Forms keep their
 * submit button disabled until then: a native submit before hydration would put the fields
 * (including residents' contact details) into the URL as a GET query.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
