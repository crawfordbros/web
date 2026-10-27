// Public, per-environment settings. Nothing secret belongs here: this ships to every browser.
// The build mode picks the block: `vite` = development, `vite build --mode staging`, `vite build` = production.

type SiteConfig = {
  /** Canonical origin for links and meta tags. */
  siteUrl: string;
  /** Origin of the cbes-admin app. Blank means it shares this site's origin (staging and production). */
  portalUrl: string;
  /** Cloudflare Turnstile site key. Blank skips the widget (local only; the API rejects forms without it elsewhere). */
  turnstileSiteKey: string;
};

const CONFIGS: Record<string, SiteConfig> = {
  development: {
    siteUrl: "http://test.cbenvironments.com:5173",
    portalUrl: "http://test.cbenvironments.com:5174",
    turnstileSiteKey: "",
  },
  staging: {
    siteUrl: "https://staging.cbenvironments.com",
    portalUrl: "",
    turnstileSiteKey: "REPLACE_WITH_TURNSTILE_SITE_KEY",
  },
  production: {
    siteUrl: "https://cbenvironments.com",
    portalUrl: "",
    turnstileSiteKey: "REPLACE_WITH_TURNSTILE_SITE_KEY",
  },
};

const base = CONFIGS[import.meta.env.MODE] ?? CONFIGS.development;

export const config: SiteConfig = {
  ...base,
  // Optional override from .env.local or the shell, e.g. VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA pnpm dev.
  // A blank value falls back to the mode's key, since Vite loads .env.local for production builds too.
  turnstileSiteKey: import.meta.env.VITE_TURNSTILE_SITE_KEY || base.turnstileSiteKey,
};

/** Forms must carry a Turnstile token when a site key is configured. */
export const turnstileRequired = Boolean(config.turnstileSiteKey);

export const portalLoginUrl = `${config.portalUrl}/portal/login`;

/** Business facts used across pages. Values in [brackets] are waiting on CBES (BUILD_BRIEF section 12). */
export const business = {
  phone: "(470) 585-2776",
  phoneHref: "tel:+14705852776",
  email: "office@cbenvironments.com",
  mailingAddress: "PO Box 645, Clarkston, GA 30021",
  counties: ["DeKalb", "Gwinnett", "Cobb", "Fulton", "South Fulton"],
  /** Shown on the home proof strip once set. Leave null until contracts are signed. */
  communitiesServed: null as number | null,
  containerBringInBy: "[10 AM]",
  holidays: ["New Year's Day", "Memorial Day", "July 4", "Labor Day", "Thanksgiving", "Christmas"],
};
