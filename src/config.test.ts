import { describe, expect, it } from "vitest";
import { TURNSTILE_TEST_SITE_KEY, turnstileSiteKeyFor } from "./config";

describe("turnstileSiteKeyFor", () => {
  it.each(["development", "tunnel", "staging"])("uses Cloudflare's always-pass test key in %s", (mode) => {
    expect(turnstileSiteKeyFor(mode, "0x4AAAAreal")).toBe(TURNSTILE_TEST_SITE_KEY);
    expect(TURNSTILE_TEST_SITE_KEY).toBe("1x00000000000000000000AA");
  });

  it.each(["production", "e2e", "test"])("uses the configured key in %s", (mode) => {
    expect(turnstileSiteKeyFor(mode, "0x4AAAAreal")).toBe("0x4AAAAreal");
    expect(turnstileSiteKeyFor(mode, undefined)).toBe("");
  });
});
