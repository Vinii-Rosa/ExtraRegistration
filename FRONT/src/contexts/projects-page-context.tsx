"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Project } from "@/types/projects";

export type ProjectFilters = { name: string; hourly: string; date: string };

type Dialog =
  | { kind: "form"; project: Project | null }
  | { kind: "delete"; project: Project }
  | { kind: "recalculate"; project: Project }
  | null;

type ProjectsPageContextValue = {
  filters: ProjectFilters;
  setFilter: (key: keyof ProjectFilters, value: string) => void;
  clearFilters: () => void;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  dialog: Dialog;
  openCreate: () => void;
  openEdit: (project: Project) => void;
  openDelete: (project: Project) => void;
  openRecalculate: (project: Project) => void;
  closeDialog: () => void;
};

const emptyFilters: ProjectFilters = { name: "", hourly: "", date: "" };
const DEFAULT_LIMIT = 10;

const ProjectsPageContext = createContext<ProjectsPageContextValue | null>(
  null,
);

export function ProjectsPageProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [dialog, setDialog] = useState<Dialog>(null);

  const value = useMemo<ProjectsPageContextValue>(
    () => ({
      filters,
      setFilter: (key, v) => {
        setFilters((f) => ({ ...f, [key]: v }));
        setPage(1);
      },
      clearFilters: () => {
        setFilters(emptyFilters);
        setPage(1);
      },
      page,
      limit,
      setPage,
      setLimit: (next) => {
        setLimit(next);
        setPage(1);
      },
      dialog,
      openCreate: () => setDialog({ kind: "form", project: null }),
      openEdit: (project) => setDialog({ kind: "form", project }),
      openDelete: (project) => setDialog({ kind: "delete", project }),
      openRecalculate: (project) => setDialog({ kind: "recalculate", project }),
      closeDialog: () => setDialog(null),
    }),
    [filters, page, limit, dialog],
  );

  return (
    <ProjectsPageContext value={value}>{children}</ProjectsPageContext>
  );
}

export function useProjectsPage() {
  const ctx = useContext(ProjectsPageContext);
  if (!ctx) throw new Error("useProjectsPage fora do ProjectsPageProvider");
  return ctx;
}
