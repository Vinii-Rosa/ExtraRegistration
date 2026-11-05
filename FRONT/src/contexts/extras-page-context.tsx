"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";

export type ExtraFilters = {
  month: string;
  date: string;
  hour: string;
  total_value: string;
};

type ExtrasPageContextValue = {
  filters: ExtraFilters;
  page: number;
  pending: boolean;
  setFilter: (key: keyof ExtraFilters, value: string) => void;
  clearFilters: () => void;
  goToPage: (page: number) => void;
};

const ExtrasPageContext = createContext<ExtrasPageContextValue | null>(null);

export function ExtrasPageProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const value = useMemo<ExtrasPageContextValue>(() => {
    const navigate = (params: URLSearchParams) =>
      startTransition(() => {
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });

    const month = searchParams.get("month") ?? "";
    const date = month ? "" : (searchParams.get("date") ?? "");

    return {
      filters: {
        month,
        date,
        hour: searchParams.get("hour") ?? "",
        total_value: searchParams.get("total_value") ?? "",
      },
      page: Number(searchParams.get("page")) || 1,
      pending,
      setFilter: (key, v) => {
        const params = new URLSearchParams(searchParams);
        if (v) params.set(key, v);
        else params.delete(key);
        if (v && key === "month") params.delete("date");
        if (v && key === "date") params.delete("month");
        params.delete("page");
        navigate(params);
      },
      clearFilters: () => {
        const params = new URLSearchParams(searchParams);
        for (const key of ["month", "date", "hour", "total_value", "page"]) {
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
    };
  }, [searchParams, pathname, router, pending]);

  return <ExtrasPageContext value={value}>{children}</ExtrasPageContext>;
}

export function useExtrasPage() {
  const ctx = useContext(ExtrasPageContext);
  if (!ctx) throw new Error("useExtrasPage fora do ExtrasPageProvider");
  return ctx;
}
