import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const API_DEV_URL = process.env.CBES_API_DEV_URL ?? "http://localhost:8787";

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
// /api is proxied to the cbes-api Worker running with `pnpm dev` in that repo.
export default defineConfig({
  plugins: [react(), tailwindcss(), robots()],
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: ["test.cbenvironments.com", "localhost"],
    proxy: { "/api": { target: API_DEV_URL } },
  },
  preview: {
    port: 4173,
    allowedHosts: ["test.cbenvironments.com", "localhost"],
    proxy: { "/api": { target: API_DEV_URL } },
  },
});
