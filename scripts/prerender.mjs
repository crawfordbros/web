// Writes static HTML for each public page after `vite build` (client) and `vite build --ssr` (server).
// Pages hydrate in the browser; this only makes first paint fast and gives crawlers real content.
import { readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const dist = path.resolve("dist");
const serverEntry = pathToFileURL(path.resolve("dist-server/entry-server.js")).href;
const { render, PRERENDERED_PATHS } = await import(serverEntry);
// Preload the body and heading fonts so text doesn't repaint late when they arrive.
const fonts = readdirSync(path.join(dist, "assets")).filter((f) =>
  /^(open-sans-latin-400-normal|fira-sans-latin-700-normal)-.*\.woff2$/.test(f),
);
const fontPreloads = fonts
  .map((f) => `<link rel="preload" as="font" type="font/woff2" href="/assets/${f}" crossorigin />`)
  .join("\n    ");
const template = readFileSync(path.join(dist, "index.html"), "utf8").replace(
  "</head>",
  `    ${fontPreloads}\n  </head>`,
);

const escape = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setMeta(html, attr, key, content) {
  const re = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`);
  const tag = `<meta ${attr}="${key}" content="${escape(content)}" />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

for (const url of PRERENDERED_PATHS) {
  const { html, head } = await render(url);
  if (!head) throw new Error(`${url} did not call useSeo()`);

  let page = template.replace('<div id="root"></div>', `<div id="root" data-prerendered="${url}">${html}</div>`);
  page = page.replace(/<title>[^<]*<\/title>/, `<title>${escape(head.title)}</title>`);
  page = setMeta(page, "name", "description", head.description);
  page = setMeta(page, "property", "og:title", head.title);
  page = setMeta(page, "property", "og:description", head.description);
  page = setMeta(page, "property", "og:url", head.url);
  if (head.noindex) page = setMeta(page, "name", "robots", "noindex");
  page = page.replace("</head>", `    <link rel="canonical" href="${escape(head.url)}" />\n  </head>`);

  // "/" -> index.html, "/services" -> services.html (served at /services by Workers static assets).
  const file = url === "/" ? "index.html" : `${url.slice(1)}.html`;
  writeFileSync(path.join(dist, file), page);
  console.log(`prerendered ${url} -> dist/${file}`);
}

rmSync("dist-server", { recursive: true, force: true });
