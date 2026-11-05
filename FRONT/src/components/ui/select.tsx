import type { SelectHTMLAttributes } from "react";
import { Field, fieldClass } from "./field";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  error?: string;
};

export function Select({
  label,
  error,
  className = "",
  children,
  ...props
}: Props) {
  return (
    <Field label={label} htmlFor={props.id} error={error}>
      <select
        className={`${fieldClass} ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}
