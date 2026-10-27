# cbes-web

The public website for CB Environment Solutions: home, services, about, residents, report an issue, report status, quote, FAQ, contact, privacy and terms. Vite + React 18 + TypeScript + React Router + Tailwind, deployed as static assets on Cloudflare Workers. Public pages are prerendered to HTML at build time and hydrate in the browser.

| Environment | URL | Worker |
| --- | --- | --- |
| Local | http://test.cbenvironments.com:5173 | `vite` dev server |
| Staging | https://staging.cbenvironments.com | `cbes-web-staging` |
| Production | https://cbenvironments.com | `cbes-web` |

Sibling repos on the same hostnames:

| Repo | Answers | What |
| --- | --- | --- |
| `cbes-api` | `/api/*` | Cloudflare Worker + D1 + R2: report and quote submissions, report status |
| `cbes-admin` | `/portal*`, `/admin*` | Staff portal and admin dashboard, signed in with Clerk |
| `cbes-web` (this) | everything else | Public site |

## Local development

1. Point `test.cbenvironments.com` at your machine. Either add a DNS record in Cloudflare (`A test → 127.0.0.1`, DNS only, grey cloud) so it works for everyone, or add this line to `/etc/hosts` on your Mac:

   ```
   127.0.0.1 test.cbenvironments.com
   ```

2. Start the API (in `cbes-api`): `pnpm install && pnpm db:migrate:local && pnpm db:seed:local && pnpm dev`
3. Start this site:

   ```bash
   pnpm install
   pnpm dev
   ```

4. Open http://test.cbenvironments.com:5173 (`http://localhost:5173` works too). `/api` is proxied to the API on port 8787.

Locally the Turnstile widget is off and the API skips the check, and emails print in the API's console. To try the real widget locally, run with Cloudflare's always-pass test key: `VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA pnpm dev`.

## Configuration

Public, per-environment settings (site URL, portal URL, Turnstile site key) live in [`src/config.ts`](src/config.ts), picked by the Vite build mode. There are no secrets in this repo: every secret lives in the `cbes-api` Worker. Business facts (phone, counties, holidays) are in the same file; values in `[brackets]` are still waiting on CBES.

**Before the first staging or production deploy:** replace `REPLACE_WITH_TURNSTILE_SITE_KEY` in `src/config.ts` with the site key from Cloudflare dashboard > Turnstile (widget for `cbenvironments.com`, also add `staging.cbenvironments.com` and `test.cbenvironments.com` as hostnames).

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm test                      # Vitest + Testing Library (forms, image helper)
pnpm test:e2e                  # Playwright, desktop 1440 px and Pixel 7, against dev + the real cbes-api (../api)
```

Test the prerendered production build the same way:

```bash
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA pnpm build && pnpm preview
E2E_BASE_URL=http://localhost:4173 pnpm test:e2e
```

`node scripts/screenshots.mjs` saves full-page screenshots of every page at 1440, 768 and 390 px for design review. `node scripts/generate-images.mjs` regenerates the Open Graph image and app icons from the logo.

## Deploy

```bash
pnpm wrangler login
pnpm deploy:staging        # build --mode staging, then wrangler deploy --env staging
pnpm deploy:production
```

DNS (Cloudflare zone `cbenvironments.com`): proxied (orange cloud) records for `@`, `www` and `staging`; an `AAAA` record pointing to `100::` is enough because Workers routes answer them. Add a redirect rule from `www.cbenvironments.com/*` to `https://cbenvironments.com/$1`.

All three workers use routes, so the most specific pattern wins: `/api/*` goes to `cbes-api`, `/portal*` and `/admin*` to `cbes-admin`, everything else here. Staging builds serve `robots.txt` with `Disallow: /`; production allows crawling and lists `sitemap.xml`.

## How pages are built

- Brand tokens (`navy`, `gold-text`, ...) are Tailwind theme colors in `src/index.css`. Fonts are self-hosted (Fira Sans, Open Sans).
- Photo slots are `<Placeholder label="...">` until real photos arrive.
- `src/lib/schemas.ts` is a copy of `cbes-api/src/shared/schemas.ts` (the source of truth). Change both together.
- `/report?p=<property_slug>&u=<unit_code>` pre-fills the report form from container QR codes. `/report/<token>` is the resident's private status page (not prerendered; renders in the browser).
- Forms load the Turnstile script only once someone starts filling them in, keep the submit button disabled until the page has hydrated, and wait up to 10 s for a Turnstile token on submit.

## Phase 1 results (Oct 27, 2026)

- Lighthouse mobile, production build: Performance 93–99, Accessibility 100, Best Practices 100, SEO 100 on every public page.
- Playwright: 35/35 on desktop and mobile, including axe (no serious or critical issues) on every page.
