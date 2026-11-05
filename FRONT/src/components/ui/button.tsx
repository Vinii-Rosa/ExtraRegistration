import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "success" | "danger" | "ghost" | "icon";

const variants: Record<Variant, string> = {
  primary: "border border-transparent bg-primary text-primary-fg hover:bg-primary-hover px-4 py-2",
  success: "border border-transparent bg-success text-success-fg hover:bg-success-hover px-4 py-2",
  danger: "border border-transparent bg-danger text-danger-fg hover:bg-danger-hover px-4 py-2",
  ghost:
    "border border-border hover:bg-card-hover hover:border-accent px-4 py-2",
  icon: "p-2 hover:bg-card-hover",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({
  variant = "primary",
  type = "button",
  className = "",
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg text-xs font-semibold transition-colors duration-250 ease-ui focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
