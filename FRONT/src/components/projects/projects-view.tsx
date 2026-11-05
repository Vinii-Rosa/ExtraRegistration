"use client";

import { FolderKanban, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useProjects } from "@/contexts/projects-context";
import { useProjectsPage } from "@/contexts/projects-page-context";
import { timestampDateKey } from "@/lib/format";
import { DeleteProjectModal } from "./delete-project-modal";
import { ProjectCard } from "./project-card";
import { ProjectFormModal } from "./project-form-modal";
import { RecalculateModal } from "./recalculate-modal";

export function ProjectsView() {
  const { projects } = useProjects();
  const {
    filters,
    setFilter,
    clearFilters,
    openCreate,
    page,
    limit,
    setPage,
    setLimit,
  } = useProjectsPage();

  const name = filters.name.trim().toLowerCase();
  const visible = projects.filter(
    (p) =>
      (!name || p.project_name.toLowerCase().includes(name)) &&
      (!filters.hourly || p.hourly_value === Number(filters.hourly)) &&
      (!filters.date || timestampDateKey(p.createdAt) === filters.date),
  );
  const filtering = Boolean(name || filters.hourly || filters.date);

  const totalPages = Math.max(1, Math.ceil(visible.length / limit));
  const currentPage = Math.min(page, totalPages);
  const pageItems = visible.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  return (
    <div className="flex flex-1 flex-col gap-6 md:min-h-0">
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
        <div className="-mx-2 -my-2 grid auto-rows-max content-start gap-4 px-2 py-2 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] md:min-h-0 md:flex-1 md:overflow-y-auto">
          {pageItems.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {visible.length > 0 && (
        <PaginationBar
          limit={limit}
          onLimitChange={setLimit}
          page={currentPage}
          totalPages={totalPages}
          count={visible.length}
          noun="projetos"
          onPage={setPage}
        />
      )}

      <ProjectFormModal />
      <DeleteProjectModal />
      <RecalculateModal />
    </div>
  );
}
