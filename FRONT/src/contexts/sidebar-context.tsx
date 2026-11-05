"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type SidebarContextValue = {
  open: boolean;
  toggle: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

// O estado visual vive em data-sidebar no <html> (definido por script antes da hidratação)
const readOpen = () => document.documentElement.dataset.sidebar !== "closed";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const open = useSyncExternalStore(subscribe, readOpen, () => true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => {
    const next = readOpen() ? "closed" : "open";
    document.documentElement.dataset.sidebar = next;
    try {
      localStorage.setItem("sidebar", next);
    } catch {}
    listeners.forEach((listener) => listener());
  }, []);

  const value = useMemo(
    () => ({ open, toggle, mobileOpen, setMobileOpen }),
    [open, toggle, mobileOpen],
  );
  return <SidebarContext value={value}>{children}</SidebarContext>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar fora do SidebarProvider");
  return ctx;
}
