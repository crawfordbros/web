// Full-page screenshots of every public page at the three widths in BUILD_BRIEF Phase 1.
// Usage: node scripts/screenshots.mjs [baseUrl] [outDir]   (dev servers for web and api running)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:5173";
const out = process.argv[3] ?? "screenshots";
const pages = ["/", "/services", "/about", "/residents", "/report", "/quote", "/faq", "/contact", "/privacy", "/terms"];
const widths = [1440, 768, 390];

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  for (const path of pages) {
    await page.goto(base + path, { waitUntil: "networkidle" });
    const name = path === "/" ? "home" : path.slice(1);
    await page.screenshot({ path: `${out}/${name}-${width}.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 0) console.log(`horizontal overflow ${overflow}px on ${path} at ${width}`);
  }
  await context.close();
}
await browser.close();
console.log(`saved to ${out}/`);
