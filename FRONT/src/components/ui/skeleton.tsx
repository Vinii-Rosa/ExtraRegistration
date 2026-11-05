import type { HTMLAttributes } from "react";

export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={`animate-[skeleton_1.5s_ease-in-out_infinite] rounded-lg bg-card-hover ${className}`}
      {...props}
    />
  );
}
