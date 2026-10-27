import { useEffect } from "react";
import { config } from "../config";

type Seo = {
  title: string;
  description: string;
  /** Path for the canonical URL, e.g. "/services". */
  path: string;
  noindex?: boolean;
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

export type HeadTags = { title: string; description: string; url: string; noindex: boolean };

/** Filled during build-time rendering so scripts/prerender.mjs can write each page's <head>. */
export const ssrHead: { current: HeadTags | null } = { current: null };

function recordSsrHead(tags: HeadTags) {
  ssrHead.current = tags;
}

function headTags({ title, description, path, noindex }: Seo): HeadTags {
  return {
    title: path === "/" ? title : `${title} | CB Environment Solutions`,
    description,
    url: `${config.siteUrl}${path}`,
    noindex: Boolean(noindex),
  };
}

/** Sets the page title, description, canonical link and Open Graph tags. */
export function useSeo({ title, description, path, noindex }: Seo) {
  if (typeof window === "undefined") recordSsrHead(headTags({ title, description, path, noindex }));

  useEffect(() => {
    const { title: fullTitle, url } = headTags({ title, description, path, noindex });
    document.title = fullTitle;
    setMeta("name", "description", description);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("name", "robots", noindex ? "noindex" : "index, follow");

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }, [title, description, path, noindex]);
}
