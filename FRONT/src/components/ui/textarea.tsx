import type { TextareaHTMLAttributes } from "react";
import { Field, fieldClass } from "./field";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  error?: string;
};

export function Textarea({ label, error, className = "", ...props }: Props) {
  return (
    <Field label={label} htmlFor={props.id} error={error}>
      <textarea
        className={`${fieldClass} ${className}`}
        aria-invalid={error ? true : undefined}
        {...props}
      />
    </Field>
  );
}
