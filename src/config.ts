// Public, per-environment settings. Nothing secret belongs here: this ships to every browser.
// The build mode picks the block: `vite` = development, `vite build --mode staging`, `vite build` = production.
// Keys come from .env.local locally or Render environment variables (see .env.example).

type SiteConfig = {
  /** Canonical origin for links and meta tags. */
  siteUrl: string;
  /** Origin of the cbes-admin app. Blank means it shares this site's origin (staging and production). */
  portalUrl: string;
  /** Cloudflare Turnstile site key. Blank skips the widget (local only; the API rejects forms without it elsewhere). */
  turnstileSiteKey: string;
};

type UrlConfig = Omit<SiteConfig, "turnstileSiteKey">;

const CONFIGS: Record<string, UrlConfig> = {
  development: {
    siteUrl: "http://test.cbenvironments.com:5173",
    portalUrl: "http://test.cbenvironments.com:5174",
  },
  tunnel: {
    siteUrl: "https://test.cbenvironments.com",
    portalUrl: "https://testadmin.cbenvironments.com",
  },
  staging: {
    siteUrl: "https://staging.cbenvironments.com",
    portalUrl: "",
  },
  production: {
    siteUrl: "https://cbenvironments.com",
    portalUrl: "",
  },
};

const base = CONFIGS[import.meta.env.MODE] ?? CONFIGS.development;

/** Cloudflare's documented always-pass site key. The staging API verifies it with the matching test secret. */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

/**
 * The test and staging hosts use the always-pass key so automated QA browsers get through.
 * Production uses VITE_TURNSTILE_SITE_KEY; production builds refuse to start without it (vite.config.ts).
 */
export function turnstileSiteKeyFor(mode: string, configured: string | undefined): string {
  return ["development", "tunnel", "staging"].includes(mode) ? TURNSTILE_TEST_SITE_KEY : (configured ?? "");
}

export const config: SiteConfig = {
  ...base,
  turnstileSiteKey: turnstileSiteKeyFor(import.meta.env.MODE, import.meta.env.VITE_TURNSTILE_SITE_KEY),
};

/** Forms must carry a Turnstile token when a site key is configured. */
export const turnstileRequired = Boolean(config.turnstileSiteKey);

export const portalLoginUrl = `${config.portalUrl}/portal/login`;

/** Business facts used across pages. Values in [brackets] are waiting on CBES (BUILD_BRIEF section 12). */
export const business = {
  email: "office@cbenvironments.com",
  mailingAddress: "PO Box 645, Clarkston, GA 30021",
  counties: ["DeKalb", "Gwinnett", "Cobb", "Fulton", "South Fulton"],
  /** Shown on the home proof strip once set. Leave null until contracts are signed. */
  communitiesServed: null as number | null,
  containerBringInBy: "[10 AM]",
  holidays: ["New Year's Day", "Memorial Day", "July 4", "Labor Day", "Thanksgiving", "Christmas"],
};
