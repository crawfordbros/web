import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import "@fontsource/fira-sans/latin-600.css";
import "@fontsource/fira-sans/latin-700.css";
import "@fontsource/open-sans/latin-400.css";
import "@fontsource/open-sans/latin-600.css";
import "@fontsource/open-sans/latin-700.css";
import "./index.css";
import { App } from "./App";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Prerendered pages hydrate; other routes (e.g. /report/:token) arrive with an empty root and render fresh.
if (root.hasChildNodes()) hydrateRoot(root, app);
else createRoot(root).render(app);
