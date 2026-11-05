"use client";

import type { HTMLAttributes, MouseEvent } from "react";

type Props = HTMLAttributes<HTMLDivElement> & { interactive?: boolean };

export function Card({
  interactive,
  className = "",
  children,
  onMouseMove,
  ...props
}: Props) {
  const follow = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
    onMouseMove?.(e);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-[border-color,transform,background-color] duration-250 ease-ui ${
        interactive
          ? "group hover:-translate-y-0.5 hover:border-accent hover:bg-card-hover"
          : ""
      } ${className}`}
      onMouseMove={interactive ? follow : onMouseMove}
      {...props}
    >
      {interactive && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 ease-ui group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), var(--spotlight), transparent 70%)",
          }}
        />
      )}
      {children}
    </div>
  );
}
