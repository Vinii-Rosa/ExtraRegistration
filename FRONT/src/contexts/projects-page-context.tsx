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
  | null;

type ProjectsPageContextValue = {
  filters: ProjectFilters;
  setFilter: (key: keyof ProjectFilters, value: string) => void;
  clearFilters: () => void;
  dialog: Dialog;
  openCreate: () => void;
  openEdit: (project: Project) => void;
  openDelete: (project: Project) => void;
  closeDialog: () => void;
};

const emptyFilters: ProjectFilters = { name: "", hourly: "", date: "" };

const ProjectsPageContext = createContext<ProjectsPageContextValue | null>(
  null,
);

export function ProjectsPageProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState(emptyFilters);
  const [dialog, setDialog] = useState<Dialog>(null);

  const value = useMemo<ProjectsPageContextValue>(
    () => ({
      filters,
      setFilter: (key, v) => setFilters((f) => ({ ...f, [key]: v })),
      clearFilters: () => setFilters(emptyFilters),
      dialog,
      openCreate: () => setDialog({ kind: "form", project: null }),
      openEdit: (project) => setDialog({ kind: "form", project }),
      openDelete: (project) => setDialog({ kind: "delete", project }),
      closeDialog: () => setDialog(null),
    }),
    [filters, dialog],
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
