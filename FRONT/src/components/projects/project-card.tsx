"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectsPage } from "@/contexts/projects-page-context";
import { formatCurrency, formatTimestamp } from "@/lib/format";
import type { Project } from "@/types/projects";

export function ProjectCard({ project }: { project: Project }) {
  const { openEdit, openDelete } = useProjectsPage();

  return (
    <Card interactive className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="min-w-0 truncate text-sm font-bold tracking-tight">
          {project.project_name}
        </h2>
        <div className="flex shrink-0 items-center">
          <Button
            variant="icon"
            aria-label={`Editar ${project.project_name}`}
            onClick={() => openEdit(project)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="icon"
            aria-label={`Excluir ${project.project_name}`}
            onClick={() => openDelete(project)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-[10px] text-muted uppercase">Valor/hora</dt>
          <dd className="font-semibold">{formatCurrency(project.hourly_value)}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-muted uppercase">Total ganho</dt>
          <dd className="font-semibold">{formatCurrency(project.total_profit)}</dd>
        </div>
      </dl>

      <p className="text-[10px] text-muted">
        Criado em {formatTimestamp(project.createdAt)}
      </p>
    </Card>
  );
}
