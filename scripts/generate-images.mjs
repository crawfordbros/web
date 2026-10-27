// Regenerates public/og-image.png and the app icons from the logo.
// Run: node scripts/generate-images.mjs  (needs `pnpm exec playwright install chromium` once)
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";

const logo = `data:image/png;base64,${readFileSync("public/logo-gold-on-navy.png").toString("base64")}`;
const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(
  `<link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@700&family=Open+Sans:wght@600&display=swap" rel="stylesheet">
<body style="margin:0;width:1200px;height:630px;background:#272B84;display:flex;align-items:center;gap:56px;padding:0 80px;box-sizing:border-box;font-family:'Open Sans',sans-serif;color:#fff">
<img src="${logo}" style="height:300px">
<div><p style="margin:0 0 16px;font-size:22px;letter-spacing:.18em;font-weight:600;color:#C8BBA5">AIMING FOR EXCELLENCE</p>
<h1 style="margin:0 0 20px;font-family:'Fira Sans',sans-serif;font-size:64px;line-height:1.05">Valet trash, managed the right way.</h1>
<p style="margin:0;font-size:26px;color:#E6E7F2">Metro Atlanta apartment communities</p></div></body>`,
  { waitUntil: "networkidle" },
);
await page.screenshot({ path: "public/og-image.png" });

for (const [size, file, pad] of [
  [180, "apple-touch-icon.png", 18],
  [192, "icon-192.png", 20],
  [512, "icon-512.png", 56],
]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<body style="margin:0;width:${size}px;height:${size}px;background:#272B84;display:flex;align-items:center;justify-content:center"><img src="${logo}" style="width:${size - pad * 2}px"></body>`,
  );
  await page.screenshot({ path: `public/${file}` });
}
await browser.close();
