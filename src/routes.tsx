import { lazy, Suspense, type ComponentType } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./site/HomePage";

/** Lazy-load every page but Home so the first visit downloads only what it shows. */
function page(load: () => Promise<ComponentType>) {
  const Page = lazy(() => load().then((component) => ({ default: component })));
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <Page />
    </Suspense>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={page(() => import("./site/ServicesPage").then((m) => m.ServicesPage))} />
        <Route path="/about" element={page(() => import("./site/AboutPage").then((m) => m.AboutPage))} />
        <Route path="/residents" element={page(() => import("./site/ResidentsPage").then((m) => m.ResidentsPage))} />
        <Route path="/report" element={page(() => import("./site/ReportPage").then((m) => m.ReportPage))} />
        <Route
          path="/report/:token"
          element={page(() => import("./site/ReportStatusPage").then((m) => m.ReportStatusPage))}
        />
        <Route path="/quote" element={page(() => import("./site/QuotePage").then((m) => m.QuotePage))} />
        <Route path="/faq" element={page(() => import("./site/FaqPage").then((m) => m.FaqPage))} />
        <Route path="/contact" element={page(() => import("./site/ContactPage").then((m) => m.ContactPage))} />
        <Route path="/privacy" element={page(() => import("./site/LegalPages").then((m) => m.PrivacyPage))} />
        <Route path="/terms" element={page(() => import("./site/LegalPages").then((m) => m.TermsPage))} />
        <Route path="*" element={page(() => import("./site/NotFoundPage").then((m) => m.NotFoundPage))} />
      </Route>
    </Routes>
  );
}
