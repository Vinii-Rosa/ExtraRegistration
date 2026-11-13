"use client";

import {
  CircleCheck,
  Clock,
  ExternalLink,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useTransition } from "react";
import { reopenExtraHourAction } from "@/actions/extra-hours";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useExtrasPage } from "@/contexts/extras-page-context";
import { useProjects } from "@/contexts/projects-context";
import { useToast } from "@/contexts/toast-context";
import {
  formatCurrency,
  formatDate,
  formatMinutes,
  formatTime,
} from "@/lib/format";
import type { ExtraHour } from "@/types/extra-hours";

export function ExtraHourCard({ extra }: { extra: ExtraHour }) {
  const { projectsById } = useProjects();
  const { openEdit, openClose, openDelete } = useExtrasPage();
  const toast = useToast();
  const [pending, startReopen] = useTransition();
  const open = extra.end_time === null;
  const project = projectsById[extra.project_id];

  function reopen() {
    startReopen(async () => {
      const result = await reopenExtraHourAction(extra.id);
      if (result.error) toast.error(result.error);
      else toast.success("Hora extra reaberta");
    });
  }

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
        <div className="flex shrink-0 items-center">
          {open && (
            <span className="mr-1 rounded-full bg-success px-2 py-0.5 text-[10px] font-semibold text-success-fg">
              Em aberto
            </span>
          )}
          <Button
            variant="icon"
            aria-label="Editar hora extra"
            onClick={() => openEdit(extra)}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="icon"
            aria-label="Excluir hora extra"
            onClick={() => openDelete(extra)}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3">
        <div>
          <dt className="text-[10px] text-muted uppercase">Data</dt>
          <dd className="font-semibold">{formatDate(extra.date)}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-muted uppercase">Valor</dt>
          <dd className="font-semibold">{formatCurrency(extra.total_value)}</dd>
        </div>
        <div>
          <dt className="text-[10px] text-muted uppercase">Duração</dt>
          <dd className="font-semibold">{formatMinutes(extra.total_minutes)}</dd>
        </div>
        <div className="col-span-3">
          <dt className="text-[10px] text-muted uppercase">Horário</dt>
          <dd className="flex items-center gap-1.5 font-semibold">
            <Clock size={12} />
            {formatTime(extra.start_time)} às {formatTime(extra.end_time)}
          </dd>
        </div>
      </dl>

      {extra.description && (
        <p className="line-clamp-3 whitespace-pre-line break-words text-muted">
          {extra.description}
        </p>
      )}

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

      {open ? (
        <Button variant="success" onClick={() => openClose(extra)}>
          <CircleCheck size={14} />
          Fechar
        </Button>
      ) : (
        <Button variant="ghost" onClick={reopen} disabled={pending}>
          <RotateCcw size={14} />
          {pending ? "Reabrindo..." : "Reabrir"}
        </Button>
      )}
    </Card>
  );
}
