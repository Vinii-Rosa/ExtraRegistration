"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";

type Props = {
  label: string;
  trigger: ReactNode;
  children: ReactNode;
};

export function Menu({ label, trigger, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function listenToDismiss() {
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }

  useEffect(() => {
    if (open) return listenToDismiss();
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="icon"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </Button>
      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className="absolute right-0 z-40 mt-2 w-48 rounded-xl border border-border bg-card p-1 shadow-sm animate-[fade-up_250ms_var(--ease-ui)]"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors duration-250 ease-ui hover:bg-card-hover focus-visible:bg-card-hover focus-visible:outline-none ${className}`}
      {...props}
    />
  );
}
