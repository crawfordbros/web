import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Production builds require a real Turnstile site key from .env.local locally or Render environment variables.
 * Other builds use Cloudflare's always-pass test key (src/config.ts).
 */
function requireTurnstileKey(): Plugin {
  return {
    name: "cbes-require-turnstile-key",
    apply: "build",
    configResolved(config) {
      if (config.mode !== "production") return;
      const key = config.env.VITE_TURNSTILE_SITE_KEY;
      if (!key) {
        throw new Error(
          "Build stopped: set VITE_TURNSTILE_SITE_KEY in Render's Environment settings, or .env.local for local builds (see .env.example).",
        );
      }
      // Cloudflare's test site keys start 1x, 2x or 3x followed by zeros; production forms would never verify.
      if (/^[123]x0{20}/.test(key)) {
        throw new Error("Build stopped: VITE_TURNSTILE_SITE_KEY is a Cloudflare test key. Production needs the real widget's site key.");
      }
    },
  };
}

/** Production allows crawling; every other build (staging, local) is noindex. */
function robots(): Plugin {
  let mode = "development";
  return {
    name: "cbes-robots",
    configResolved(config) {
      mode = config.mode;
    },
    generateBundle() {
      const source =
        mode === "production"
          ? "User-agent: *\nAllow: /\nDisallow: /portal\nDisallow: /admin\nDisallow: /report/\n\nSitemap: https://cbenvironments.com/sitemap.xml\n"
          : "User-agent: *\nDisallow: /\n";
      this.emitFile({ type: "asset", fileName: "robots.txt", source });
    },
  };
}

// Local development: http://test.cbenvironments.com:5173 (see README for the DNS or hosts entry).
// Test and local previews share staging. Only isolated E2E tests use a local Worker.
// Production /api requests are routed to the production Worker by Cloudflare.
export default defineConfig(({ mode }) => ({
  // Refuse to ship forms that can never pass the spam check.
  plugins: [react(), tailwindcss(), robots(), requireTurnstileKey()],
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ["test.cbenvironments.com", "localhost"],
    ws: mode === "tunnel" ? { protocol: "wss", host: "test.cbenvironments.com", clientPort: 443 } : undefined,
    proxy: { "/api": { target: mode === "e2e" ? "http://127.0.0.1:8787" : "https://staging-api.cbenvironments.com", changeOrigin: true } },
  },
  preview: {
    port: 4173,
    allowedHosts: ["test.cbenvironments.com", "localhost"],
    proxy: { "/api": { target: mode === "e2e" ? "http://127.0.0.1:8787" : "https://staging-api.cbenvironments.com", changeOrigin: true } },
  },
}));
