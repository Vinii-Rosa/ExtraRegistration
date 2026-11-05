"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Project } from "@/types/projects";

type ProjectsContextValue = {
  projects: Project[];
  projectsById: Record<string, Project>;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({
  projects,
  children,
}: {
  projects: Project[];
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      projects,
      projectsById: Object.fromEntries(projects.map((p) => [p.id, p])),
    }),
    [projects],
  );

  return <ProjectsContext value={value}>{children}</ProjectsContext>;
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects fora do ProjectsProvider");
  return ctx;
}
