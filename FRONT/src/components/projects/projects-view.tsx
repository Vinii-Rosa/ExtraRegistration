"use client";

import { FolderKanban, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useProjects } from "@/contexts/projects-context";
import { useProjectsPage } from "@/contexts/projects-page-context";
import { timestampDateKey } from "@/lib/format";
import { DeleteProjectModal } from "./delete-project-modal";
import { ProjectCard } from "./project-card";
import { ProjectFormModal } from "./project-form-modal";
import { RecalculateModal } from "./recalculate-modal";

export function ProjectsView() {
  const { projects } = useProjects();
  const { filters, setFilter, clearFilters, openCreate } = useProjectsPage();

  const name = filters.name.trim().toLowerCase();
  const visible = projects.filter(
    (p) =>
      (!name || p.project_name.toLowerCase().includes(name)) &&
      (!filters.hourly || p.hourly_value === Number(filters.hourly)) &&
      (!filters.date || timestampDateKey(p.createdAt) === filters.date),
  );
  const filtering = Boolean(name || filters.hourly || filters.date);

  return (
    <div className="space-y-6">
      <div className="grid items-end gap-4 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
        <Input
          id="filter-name"
          label="Nome"
          placeholder="Buscar projeto"
          value={filters.name}
          onChange={(e) => setFilter("name", e.target.value)}
        />
        <Input
          id="filter-hourly"
          label="Valor/hora (R$)"
          type="number"
          min={1}
          step={1}
          value={filters.hourly}
          onChange={(e) => setFilter("hourly", e.target.value)}
        />
        <Input
          id="filter-date"
          label="Criado em"
          type="date"
          value={filters.date}
          onChange={(e) => setFilter("date", e.target.value)}
        />
        <Button variant="success" onClick={openCreate}>
          <Plus size={14} />
          Novo projeto
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Nenhum projeto ainda"
          description="Crie um projeto com o valor por hora para registrar suas horas extras."
          action={
            <Button variant="success" onClick={openCreate}>
              <Plus size={14} />
              Novo projeto
            </Button>
          }
        />
      ) : visible.length === 0 && filtering ? (
        <EmptyState
          icon={SearchX}
          title="Nenhum projeto encontrado"
          description="Nenhum projeto corresponde aos filtros."
          action={
            <Button variant="ghost" onClick={clearFilters}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectFormModal />
      <DeleteProjectModal />
      <RecalculateModal />
    </div>
  );
}
