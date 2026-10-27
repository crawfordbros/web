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

export const config: SiteConfig = {
  ...base,
  // Staging and production builds refuse to start without it (vite.config.ts).
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY ?? "",
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
