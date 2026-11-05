"use client";

import { Clock, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useProjects } from "@/contexts/projects-context";
import { formatCurrency, formatDate, formatTime } from "@/lib/format";
import type { ExtraHour } from "@/types/extra-hours";

export function ExtraHourCard({ extra }: { extra: ExtraHour }) {
  const { projectsById } = useProjects();
  const open = extra.end_time === null;
  const project = projectsById[extra.project_id];

  return (
    <Card
      interactive
      className={`flex flex-col gap-3 ${open ? "border-success" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold tracking-tight">
            {extra.card_name || "Sem nome"}
          </h2>
          <p className="truncate text-muted">
            {project?.project_name ?? "Projeto removido"}
          </p>
        </div>
        {open && (
          <span className="shrink-0 rounded-full bg-success px-2 py-0.5 text-[10px] font-semibold text-success-fg">
            Em aberto
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-[10px] text-muted uppercase">Data</dt>
          <dd className="font-semibold">{formatDate(extra.date)}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-muted uppercase">Valor</dt>
          <dd className="font-semibold">{formatCurrency(extra.total_value)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[10px] text-muted uppercase">Horário</dt>
          <dd className="flex items-center gap-1.5 font-semibold">
            <Clock size={12} />
            {formatTime(extra.start_time)} às {formatTime(extra.end_time)}
          </dd>
        </div>
      </dl>

      {extra.card_link && (
        <a
          href={extra.card_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 truncate text-[10px] text-muted underline hover:text-fg"
        >
          <ExternalLink size={12} className="shrink-0" />
          <span className="truncate">{extra.card_link}</span>
        </a>
      )}
    </Card>
  );
}
