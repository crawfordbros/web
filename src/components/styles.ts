export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export type Variant = "primary" | "light" | "outline-light" | "outline";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy-dark hover:text-white",
  light: "bg-white text-navy hover:bg-on-navy hover:text-navy",
  "outline-light": "border-2 border-gold-light text-white hover:bg-white/10 hover:text-white",
  outline: "border-2 border-navy text-navy hover:bg-tint",
};

export const buttonClass = (variant: Variant = "primary", className?: string) =>
  cx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-bold no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    className,
  );
