import type { ReactNode } from "react";

export const fieldClass =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-fg transition-colors duration-250 ease-ui placeholder:text-muted focus:border-focus focus:outline-none focus:ring-1 focus:ring-focus disabled:opacity-50 aria-invalid:border-danger";

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold">
        {label}
      </label>
      {children}
      {error && <p className="text-[10px] text-danger">{error}</p>}
    </div>
  );
}
