import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLDivElement> & { interactive?: boolean };

export function Card({ interactive, className = "", ...props }: Props) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 shadow-sm transition-[border-color,transform,background-color] duration-250 ease-ui ${
        interactive
          ? "hover:-translate-y-0.5 hover:border-accent hover:bg-card-hover"
          : ""
      } ${className}`}
      {...props}
    />
  );
}
