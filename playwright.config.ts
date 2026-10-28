import { defineConfig, devices } from "@playwright/test";

// Form-submission tests use isolated local D1/R2, never the shared staging API.
// Use a separate frontend port so a running test/tunnel server cannot be reused accidentally.
const apiDir = process.env.CBES_API_DIR ?? "../api";
// For built pages, start `pnpm preview --mode e2e --host 127.0.0.1 --port 4183` first.
const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:5183";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: `pnpm --dir ${apiDir} db:migrate:local && pnpm --dir ${apiDir} db:seed:local && pnpm --dir ${apiDir} dev`,
      url: "http://localhost:8787/api/health",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    ...(!process.env.E2E_BASE_URL ? [{
      command: "pnpm dev --mode e2e --host 127.0.0.1 --port 5183",
      url: "http://127.0.0.1:5183",
      reuseExistingServer: false,
      timeout: 60_000,
    }] : []),
  ],
});
