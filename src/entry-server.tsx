// Build-time renderer used by scripts/prerender.mjs. Not shipped to browsers.
import { PassThrough } from "node:stream";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "./routes";
import { PRERENDERED_PATHS } from "./prerender-paths";
import { ssrHead } from "./lib/seo";
import { config } from "./config";

export { PRERENDERED_PATHS, config };

export function render(url: string): Promise<{ html: string; head: typeof ssrHead.current }> {
  ssrHead.current = null;
  const queryClient = new QueryClient();
  return new Promise((resolve, reject) => {
    let html = "";
    const sink = new PassThrough();
    sink.on("data", (chunk) => (html += chunk));
    sink.on("end", () => resolve({ html, head: ssrHead.current }));
    const stream = renderToPipeableStream(
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </QueryClientProvider>,
      {
        // Wait for lazy pages so the HTML contains the full page, not the Suspense fallback.
        onAllReady: () => stream.pipe(sink),
        onShellError: reject,
        onError: reject,
      },
    );
  });
}
