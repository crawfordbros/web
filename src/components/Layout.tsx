import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { business, portalLoginUrl } from "../config";
import { Container } from "./ui";
import { cx } from "./styles";

type NavItem = { label: string; to: string; accent?: boolean; external?: boolean };

const NAV: NavItem[] = [
  { label: "Services", to: "/services" },
  { label: "How It Works", to: "/#how" },
  { label: "About", to: "/about" },
  { label: "Residents", to: "/residents" },
  { label: "Report an Issue", to: "/report", accent: true },
  { label: "Portal Login", to: portalLoginUrl, external: true },
];

function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/logo-gold-on-navy.webp"
      alt="CB Environment Solutions"
      width={240}
      height={183}
      className={cx("w-auto", className)}
    />
  );
}

function NavItemLink({ item, className, onClick }: { item: NavItem; className: string; onClick?: () => void }) {
  if (item.external) {
    return (
      <a href={item.to} className={className} onClick={onClick}>
        {item.label}
      </a>
    );
  }
  return (
    <NavLink to={item.to} className={className} onClick={onClick}>
      {item.label}
    </NavLink>
  );
}

function Header() {
  const location = useLocation();
  // The menu belongs to the page it was opened on, so any navigation closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === location.key;
  const setOpen = (value: boolean | ((v: boolean) => boolean)) =>
    setOpenOn((typeof value === "function" ? value(open) : value) ? location.key : null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenOn(null);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const linkBase = "no-underline font-semibold";
  return (
    <header className="relative z-40 bg-navy text-white">
      <a
        href="#main"
        className="sr-only rounded-lg bg-white px-4 py-2 font-bold text-navy focus:not-sr-only focus:absolute focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <Container className="flex items-center justify-between gap-4 py-2.5 lg:py-3.5">
        <Link to="/" className="flex items-center" aria-label="CB Environment Solutions home">
          <Logo className="h-12 lg:h-16" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-6 text-[15px] lg:flex">
          {NAV.map((item) => (
            <NavItemLink
              key={item.label}
              item={item}
              className={cx(linkBase, item.accent ? "text-gold-light hover:text-white" : "text-white hover:text-gold-light")}
            />
          ))}
          <Link
            to="/quote"
            className="rounded-lg bg-white px-5 py-3 font-bold text-navy no-underline hover:bg-on-navy hover:text-navy"
          >
            Get a Quote
          </Link>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className="-mr-2 flex h-12 w-12 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </Container>

      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full border-t border-navy-soft bg-navy shadow-xl lg:hidden"
      >
        <nav aria-label="Mobile">
          <ul className="m-0 list-none px-4 py-2">
            {NAV.map((item) => (
              <li key={item.label} className="border-b border-navy-soft last:border-0">
                <NavItemLink
                  item={item}
                  onClick={() => setOpen(false)}
                  className={cx(
                    linkBase,
                    "flex min-h-14 items-center text-lg",
                    item.accent ? "text-gold-light hover:text-white" : "text-white hover:text-gold-light",
                  )}
                />
              </li>
            ))}
          </ul>
          <div className="px-4 pb-5">
            <Link
              to="/quote"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-center rounded-lg bg-white text-lg font-bold text-navy no-underline"
            >
              Get a Quote
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

/** Fixed bottom bar on phones: the two actions people come to the site for. */
function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-soft bg-navy-dark px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2.5">
        <Link
          to="/quote"
          className="flex min-h-12 items-center justify-center rounded-lg bg-white text-[15px] font-bold text-navy no-underline"
        >
          Get a Quote
        </Link>
        <Link
          to="/report"
          className="flex min-h-12 items-center justify-center rounded-lg border-2 border-gold-light text-[15px] font-bold text-white no-underline hover:text-white"
        >
          Report an Issue
        </Link>
      </div>
    </div>
  );
}

function Footer() {
  const link = "text-white underline-offset-4 hover:text-gold-light";
  return (
    <footer className="bg-navy-dark pb-24 text-on-navy md:pb-0">
      <Container className="flex flex-wrap justify-between gap-10 pt-12 pb-8">
        <div className="flex-[1_1_260px]">
          <Logo className="h-[72px]" />
          <p className="mt-4 mb-0 text-[15px] font-semibold text-gold-light">Aiming for Excellence · Matt. 6:33</p>
        </div>
        <nav aria-label="Footer" className="flex flex-[1_1_180px] flex-col gap-1 text-[15px]">
          <Link to="/services" className={cx(link, "py-1.5")}>Services</Link>
          <Link to="/about" className={cx(link, "py-1.5")}>About</Link>
          <Link to="/residents" className={cx(link, "py-1.5")}>Residents</Link>
          <Link to="/faq" className={cx(link, "py-1.5")}>FAQ</Link>
          <Link to="/quote" className={cx(link, "py-1.5")}>Get a Quote</Link>
          <Link to="/contact" className={cx(link, "py-1.5")}>Contact</Link>
          <a href={portalLoginUrl} className={cx(link, "py-1.5")}>Portal Login</a>
        </nav>
        <div className="flex-[1_1_220px] text-[15px] leading-relaxed">
          <p className="mt-0 mb-2 font-bold text-white">Serving metro Atlanta</p>
          <p className="m-0">{business.counties.slice(0, -1).join(", ")} and {business.counties.at(-1)}, and more</p>
        </div>
        <div className="flex-[1_1_220px] text-[15px] leading-relaxed">
          <p className="mt-0 mb-2 font-bold text-white">Contact</p>
          <p className="m-0">
            <a href={`mailto:${business.email}`} className={link}>{business.email}</a>
            <br />
            {business.mailingAddress}
          </p>
        </div>
      </Container>
      <Container className="flex flex-wrap justify-between gap-3 border-t border-navy-soft pt-4 pb-8 text-[13px]">
        <span>© {__BUILD_YEAR__} CB Environment Solutions LLC</span>
        <span>
          <Link to="/privacy" className="text-on-navy hover:text-white">Privacy</Link> ·{" "}
          <Link to="/terms" className="text-on-navy hover:text-white">Terms</Link>
        </span>
      </Container>
    </footer>
  );
}

/** Scrolls to the top on navigation, or to the #hash target when there is one. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // Wait a frame so lazily loaded pages have rendered the target.
      const id = decodeURIComponent(hash.slice(1));
      let tries = 0;
      const tick = () => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView();
        else if (tries++ < 20) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

export function Layout() {
  return (
    <>
      <ScrollManager />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
      <MobileActionBar />
    </>
  );
}
