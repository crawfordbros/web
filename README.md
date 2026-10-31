# CB Environment Solutions · Web

The public website for **CB Environment Solutions**, a valet trash and property services company serving metro Atlanta. It introduces the company's services, helps residents report issues, and gives property managers a way to request a quote.

[Companion admin repository](https://github.com/crawfordbros/admin) · [MIT license](LICENSE)

## What it does

- **Company and service pages:** Home, services, about, resident information, FAQs, contact, and legal pages.
- **Resident issue reporting:** Validated forms, photo uploads with browser-side compression, and property/unit details prefilled from QR links.
- **Report tracking:** A private status link returned after a successful submission.
- **Quote and contact requests:** Form validation, submission feedback, and Cloudflare Turnstile verification.
- **Search and sharing:** Prerendered public pages, page-specific metadata, canonical URLs, Open Graph tags, and a sitemap.
- **Responsive presentation:** Mobile and desktop layouts, self-hosted fonts, and shared brand styles.

## Repository scope

This repository contains the public website frontend. The [admin repository](https://github.com/crawfordbros/admin) contains the authenticated admin dashboard, property portal, and Steward crew app.

The API, database, file storage, email delivery, and service integrations are maintained privately and are not included. You can run the website and its unit tests from this checkout; working submissions, report status, and live service settings require a compatible backend. Full browser tests also require the private API checkout.

## Stack

- **UI:** React 18, TypeScript, React Router 6, and Tailwind CSS 4.
- **Forms and data:** React Hook Form, Zod, and TanStack Query.
- **Spam protection:** Cloudflare Turnstile.
- **Build and hosting:** Vite 8, build-time prerendering, and Cloudflare Workers static assets.
- **Quality checks:** ESLint, Vitest, Testing Library, Playwright, and axe accessibility checks.

## Local development

Use **Node.js 22.12 or newer** and **pnpm 10.28.2**.

```bash
git clone https://github.com/crawfordbros/web.git
cd web
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:5173`. Development mode uses a Turnstile test site key automatically, so no production key is needed to start the site.

Cross-app development links use `test.cbenvironments.com`. To use those links locally, add `127.0.0.1 test.cbenvironments.com` to your hosts file. The companion admin app runs on port 5174.

### Environment and backend

| Setting | Purpose |
| --- | --- |
| `VITE_TURNSTILE_SITE_KEY` | Public widget key required for production builds. Development, tunnel, and staging modes use the configured test key instead. |
| [`src/config.ts`](src/config.ts) | Build-mode URLs, portal links, and shared business details. |
| [`vite.config.ts`](vite.config.ts) | Development ports, API proxy, build checks, and crawler policy. |

See [`.env.example`](.env.example) for the environment template. `VITE_*` values are included in the browser bundle; the matching Turnstile secret belongs on the backend. Local values go in the ignored `.env.local` file, and production values come from the build environment.

Development and preview servers proxy `/api/*` to the shared staging API. Connected submissions write staging data and may send staging email. The public checkout does not include a local backend; isolated browser tests use a separately provisioned API instead.

Maintainers with the existing Cloudflare Tunnel configuration can run `pnpm dev:tunnel` in both frontends, followed by `pnpm tunnel` in this repo, for the configured HTTPS test hostnames. The tunnel credentials and remote configuration are provisioned separately.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server on port 5173. |
| `pnpm dev:tunnel` | Start Vite with the configured HTTPS tunnel hostname. |
| `pnpm typecheck` | Check the TypeScript projects. |
| `pnpm lint` | Run ESLint. |
| `pnpm test` | Run unit and component tests. |
| `pnpm build:staging` | Build and prerender with staging configuration. |
| `pnpm build` | Build and prerender for production; requires a real Turnstile site key. |
| `pnpm preview` | Serve the built site on port 4173. |
| `pnpm test:e2e` | Run desktop and mobile browser tests; requires the private API. |

Production builds reject missing or known Turnstile test keys. For a local build without a production key, use:

```bash
pnpm build:staging
pnpm preview
```

### Browser tests

The Playwright configuration expects the private API at `../api`, or at the path supplied through `CBES_API_DIR`. It starts the API, applies local migrations and seed data, and starts an isolated frontend on port 5183. Its form tests use local D1/R2 storage rather than shared staging.

After provisioning that backend and its dependencies:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```

The suite covers page navigation, forms, and accessibility across desktop and mobile viewports. Unit and component tests run independently with `pnpm test`.

## Project layout

```text
src/
  site/              Public page components
  components/        Layout, forms, and shared UI
  lib/               API client, validation, SEO, images, and service calendar
  config.ts          Public configuration and business details
  routes.tsx         Browser routes
  entry-server.tsx   Build-time rendering entry point
  prerender-paths.ts Public routes rendered during the build
public/              Static assets, sitemap, and web manifest
scripts/             Prerendering, screenshots, and image generation
tests/e2e/           Playwright browser tests
```

## Rendering and integration

The build creates client assets, renders public routes to HTML, and writes the final site to `dist/`. React hydrates those pages in the browser. The temporary server bundle is removed after prerendering; production hosting serves static assets.

`/report?p=<property_slug>&u=<unit_code>` prefills the resident form from a property QR code. `/report/:token` loads report status in the browser and is excluded from prerendering. Production crawler rules exclude report-status, API, and authenticated app paths; non-production builds discourage indexing.

The frontend uses same-origin `/api/*` requests. In the project's hosting setup, separate routes serve the private API and the admin app's `/portal*`, `/admin*`, and `/steward*` paths. An alternative host needs equivalent API routing and application fallbacks. Changes to the request schemas in [`src/lib/schemas.ts`](src/lib/schemas.ts) must stay compatible with the private API.

## Deployment

[`wrangler.jsonc`](wrangler.jsonc) defines the project's Cloudflare staging and production routes. For maintainers with the corresponding Cloudflare access and build configuration:

```bash
pnpm exec wrangler login
pnpm deploy:staging
# Or, for a production release:
pnpm deploy:production
```

Each deployment command builds and prerenders before uploading. The API and admin app are deployed separately. Production form submissions require matching Turnstile configuration on the website and backend.

## License

[MIT](LICENSE) · Copyright © 2026 crawfordbros.
