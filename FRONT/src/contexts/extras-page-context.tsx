"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { DEFAULT_LIMIT } from "@/lib/extras-query";
import type { ExtraHour } from "@/types/extra-hours";

export type ExtraFilters = {
  from: string;
  to: string;
  hour: string;
  total_value: string;
};

type Dialog =
  | { kind: "form"; extra: ExtraHour | null }
  | { kind: "close"; extra: ExtraHour }
  | { kind: "delete"; extra: ExtraHour }
  | { kind: "export" }
  | null;

type ExtrasPageContextValue = {
  filters: ExtraFilters;
  page: number;
  limit: number;
  pending: boolean;
  setFilter: (key: keyof ExtraFilters, value: string) => void;
  clearFilters: () => void;
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;
  dialog: Dialog;
  openCreate: () => void;
  openEdit: (extra: ExtraHour) => void;
  openClose: (extra: ExtraHour) => void;
  openDelete: (extra: ExtraHour) => void;
  openExport: () => void;
  closeDialog: () => void;
};

const ExtrasPageContext = createContext<ExtrasPageContextValue | null>(null);

export function ExtrasPageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<Dialog>(null);

  const value = useMemo<ExtrasPageContextValue>(() => {
    const navigate = (params: URLSearchParams) =>
      startTransition(() => {
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });

    return {
      filters: {
        from: searchParams.get("from") ?? "",
        to: searchParams.get("to") ?? "",
        hour: searchParams.get("hour") ?? "",
        total_value: searchParams.get("total_value") ?? "",
      },
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || DEFAULT_LIMIT,
      pending,
      setFilter: (key, v) => {
        const params = new URLSearchParams(searchParams);
        if (v) params.set(key, v);
        else params.delete(key);
        params.delete("page");
        navigate(params);
      },
      clearFilters: () => {
        const params = new URLSearchParams(searchParams);
        for (const key of ["from", "to", "hour", "total_value", "page"]) {
          params.delete(key);
        }
        navigate(params);
      },
      goToPage: (next) => {
        const params = new URLSearchParams(searchParams);
        if (next > 1) params.set("page", String(next));
        else params.delete("page");
        navigate(params);
      },
      setLimit: (next) => {
        const params = new URLSearchParams(searchParams);
        if (next === DEFAULT_LIMIT) params.delete("limit");
        else params.set("limit", String(next));
        params.delete("page");
        navigate(params);
      },
      dialog,
      openCreate: () => setDialog({ kind: "form", extra: null }),
      openEdit: (extra) => setDialog({ kind: "form", extra }),
      openClose: (extra) => setDialog({ kind: "close", extra }),
      openDelete: (extra) => setDialog({ kind: "delete", extra }),
      openExport: () => setDialog({ kind: "export" }),
      closeDialog: () => setDialog(null),
    };
  }, [searchParams, pathname, router, pending, dialog]);

  return <ExtrasPageContext value={value}>{children}</ExtrasPageContext>;
}

export function useExtrasPage() {
  const ctx = useContext(ExtrasPageContext);
  if (!ctx) throw new Error("useExtrasPage fora do ExtrasPageProvider");
  return ctx;
}
