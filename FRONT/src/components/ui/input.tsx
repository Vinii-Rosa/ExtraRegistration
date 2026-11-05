import type { InputHTMLAttributes } from "react";
import { Field, fieldClass } from "./field";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

export function Input({ label, error, className = "", ...props }: Props) {
  return (
    <Field label={label} htmlFor={props.id} error={error}>
      <input
        className={`${fieldClass} ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    </Field>
  );
}
