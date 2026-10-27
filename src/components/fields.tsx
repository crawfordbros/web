import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./styles";

const control =
  "min-h-11 w-full rounded-lg border border-field bg-white px-3 text-base text-ink placeholder:text-muted/70 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/25 aria-[invalid=true]:border-danger";

type FieldShellProps = { label: string; error?: string; hint?: ReactNode; className?: string; optional?: boolean };

function FieldShell({
  id,
  label,
  error,
  hint,
  className,
  optional,
  children,
}: FieldShellProps & { id: string; children: ReactNode }) {
  return (
    <div className={cx("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="m-0 text-[13px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="m-0 text-[13px] font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

export const TextField = forwardRef<HTMLInputElement, FieldShellProps & ComponentProps<"input">>(function TextField(
  { label, error, hint, className, optional, id: idProp, ...props },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={className} optional={optional}>
      <input
        ref={ref}
        id={id}
        className={control}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...props}
      />
    </FieldShell>
  );
});

export const TextArea = forwardRef<HTMLTextAreaElement, FieldShellProps & ComponentProps<"textarea">>(
  function TextArea({ label, error, hint, className, optional, id: idProp, ...props }, ref) {
    const autoId = useId();
    const id = idProp ?? autoId;
    return (
      <FieldShell id={id} label={label} error={error} hint={hint} className={className} optional={optional}>
        <textarea
          ref={ref}
          id={id}
          rows={4}
          className={cx(control, "py-2.5")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          {...props}
        />
      </FieldShell>
    );
  },
);

export const SelectField = forwardRef<HTMLSelectElement, FieldShellProps & ComponentProps<"select">>(
  function SelectField({ label, error, hint, className, optional, id: idProp, children, ...props }, ref) {
    const autoId = useId();
    const id = idProp ?? autoId;
    return (
      <FieldShell id={id} label={label} error={error} hint={hint} className={className} optional={optional}>
        <select
          ref={ref}
          id={id}
          className={cx(control, "appearance-auto")}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, hint)}
          {...props}
        >
          {children}
        </select>
      </FieldShell>
    );
  },
);

/** Radio or checkbox group with large tap targets. */
export function ChoiceGroup({
  legend,
  error,
  className,
  columns = "sm:grid-cols-2",
  children,
}: {
  legend: string;
  error?: string;
  className?: string;
  columns?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <fieldset className={cx("m-0 min-w-0 border-0 p-0", className)} aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-2.5 p-0 text-sm font-semibold">{legend}</legend>
      <div className={cx("grid grid-cols-1 gap-2.5", columns)}>{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 mb-0 text-[13px] font-semibold text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}

export const Choice = forwardRef<HTMLInputElement, { label: string } & ComponentProps<"input">>(function Choice(
  { label, className, ...props },
  ref,
) {
  return (
    <label
      className={cx(
        "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line bg-white px-3.5 py-2.5 text-[15px] has-[:checked]:border-navy has-[:checked]:bg-tint has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gold",
        className,
      )}
    >
      <input ref={ref} className="h-5 w-5 flex-none accent-navy" {...props} />
      {label}
    </label>
  );
});

export function FormAlert({ tone = "error", children }: { tone?: "error" | "info"; children: ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cx(
        "rounded-lg border px-4 py-3 text-[15px]",
        tone === "error" ? "border-danger/30 bg-danger/5 text-danger" : "border-line bg-tint text-ink",
      )}
    >
      {children}
    </div>
  );
}
