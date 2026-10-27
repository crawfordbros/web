import { useSeo } from "../lib/seo";
import { ButtonLink, Container } from "../components/ui";

export function NotFoundPage() {
  useSeo({ title: "Page not found", description: "This page doesn't exist.", path: "/404", noindex: true });
  return (
    <Container className="max-w-[720px] py-20 text-center">
      <p className="mb-2 font-heading text-6xl font-bold text-gold">404</p>
      <h1 className="mb-4 text-3xl font-bold text-navy">We couldn't find that page</h1>
      <p className="mb-8 text-muted">It may have moved. Try one of these instead.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink to="/">Home</ButtonLink>
        <ButtonLink to="/report" variant="outline">
          Report an Issue
        </ButtonLink>
        <ButtonLink to="/quote" variant="outline">
          Get a Quote
        </ButtonLink>
      </div>
    </Container>
  );
}
