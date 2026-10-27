import type { ComponentProps, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";
import { buttonClass, cx, type Variant } from "./styles";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("mx-auto w-full max-w-[1200px] px-4 sm:px-6", className)}>{children}</div>;
}

/** Small uppercase label above section headings. */
export function Eyebrow({ children, onNavy }: { children: ReactNode; onNavy?: boolean }) {
  return (
    <p
      className={cx(
        "mb-2 text-[13px] font-bold tracking-[0.18em] uppercase",
        onNavy ? "text-gold-light" : "text-gold-text",
      )}
    >
      {children}
    </p>
  );
}

export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cx("text-[28px] leading-tight font-bold text-navy sm:text-4xl lg:text-[40px]", className)}>
      {children}
    </h2>
  );
}

export function ButtonLink({ variant, className, ...props }: LinkProps & { variant?: Variant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Button({ variant, className, ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

/** Labeled photo slot. Swap for a real <img> when CBES supplies photos. */
export function Placeholder({
  label,
  className,
  onNavy,
}: {
  label: string;
  className?: string;
  onNavy?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label={`Photo placeholder: ${label}`}
      className={cx(
        "flex items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center text-[15px]",
        onNavy ? "border-[#8E91C9] bg-navy-soft text-on-navy" : "border-[#A9ABC9] bg-[#ECECF4] text-muted",
        className,
      )}
    >
      Photo: {label}
    </div>
  );
}

/** Copy still waiting on CBES. Visibly marked so it is not mistaken for a final answer. */
export function Pending({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-dashed border-gold px-1.5 py-0.5 text-gold-text" title="Waiting on CBES">
      {children}
    </span>
  );
}

export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <CheckIcon className="mt-0.5 h-6 w-6 flex-none text-navy" />
      <p className="m-0 text-[17px] leading-relaxed">{children}</p>
    </li>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </svg>
  );
}

export function PageHero({
  eyebrow,
  title,
  children,
  aside,
}: {
  eyebrow?: string;
  title: string;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="bg-navy text-white">
      <Container className="flex flex-wrap items-end justify-between gap-6 pt-12 pb-14 sm:pt-16 sm:pb-20">
        <div className="max-w-[720px] min-w-0">
          {eyebrow && <Eyebrow onNavy>{eyebrow}</Eyebrow>}
          <h1 className="mb-4 text-4xl leading-tight font-bold sm:text-[52px]">{title}</h1>
          {children && <div className="text-lg leading-relaxed text-on-navy sm:text-[19px]">{children}</div>}
        </div>
        {aside}
      </Container>
    </section>
  );
}
