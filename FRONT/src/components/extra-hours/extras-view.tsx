"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Ellipsis,
  FileSpreadsheet,
  Plus,
  SearchX,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Menu, MenuItem } from "@/components/ui/menu";
import { Select } from "@/components/ui/select";
import { useExtrasPage } from "@/contexts/extras-page-context";
import type { ExtraHoursPage } from "@/types/extra-hours";
import { CloseExtraHourModal } from "./close-extra-hour-modal";
import { DeleteExtraHourModal } from "./delete-extra-hour-modal";
import { ExtraHourCard } from "./extra-hour-card";
import { ExportModal } from "./export-modal";
import { ExtraHourFormModal } from "./extra-hour-form-modal";

const LIMITS = [10, 20, 50, 100];
const HOURS = Array.from({ length: 24 }, (_, h) => String(h));

export function ExtrasView({ data }: { data: ExtraHoursPage }) {
  const { filters, pending, setFilter, clearFilters, goToPage, limit, setLimit, openCreate, openExport } =
    useExtrasPage();
  const [totalDraft, setTotalDraft] = useState<string | null>(null);
  const filtering = Object.values(filters).some(Boolean);

  const commitTotal = () => {
    if (totalDraft !== null && totalDraft !== filters.total_value) {
      setFilter("total_value", totalDraft);
    }
    setTotalDraft(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Menu label="Mais ações" trigger={<Ellipsis size={16} />}>
          <MenuItem onClick={openExport}>
            <FileSpreadsheet size={14} />
            Exportar planilha
          </MenuItem>
        </Menu>
      </div>

      <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto]">
        <Input
          id="filter-month"
          label="Mês"
          type="month"
          value={filters.month}
          onChange={(e) => setFilter("month", e.target.value)}
        />
        <Input
          id="filter-date"
          label="Data"
          type="date"
          value={filters.date}
          onChange={(e) => setFilter("date", e.target.value)}
        />
        <Select
          id="filter-hour"
          label="Hora de início"
          value={filters.hour}
          onChange={(e) => setFilter("hour", e.target.value)}
        >
          <option value="">Todas</option>
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {h.padStart(2, "0")}h
            </option>
          ))}
        </Select>
        <Input
          id="filter-total"
          label="Valor (R$)"
          type="number"
          min={0}
          step={1}
          value={totalDraft ?? filters.total_value}
          onChange={(e) => setTotalDraft(e.target.value)}
          onBlur={commitTotal}
          onKeyDown={(e) => e.key === "Enter" && commitTotal()}
        />
        <Button variant="ghost" onClick={clearFilters} disabled={!filtering}>
          Limpar
        </Button>
        <Button variant="success" onClick={openCreate}>
          <Plus size={14} />
          Novo extra
        </Button>
      </div>

      {data.count === 0 ? (
        filtering ? (
          <EmptyState
            icon={SearchX}
            title="Nenhum extra encontrado"
            description="Nenhuma hora extra corresponde aos filtros."
            action={
              <Button variant="ghost" onClick={clearFilters}>
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Clock}
            title="Nenhuma hora extra ainda"
            description="Suas horas extras registradas aparecem aqui."
            action={
              <Button variant="success" onClick={openCreate}>
                <Plus size={14} />
                Novo extra
              </Button>
            }
          />
        )
      ) : (
        <div
          className={`grid gap-4 transition-opacity duration-250 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] ${pending ? "opacity-60" : ""}`}
        >
          {data.extra_hours.map((extra) => (
            <ExtraHourCard key={extra.id} extra={extra} />
          ))}
        </div>
      )}

      {data.count > 0 && (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="w-32">
            <Select
              id="filter-limit"
              label="Por página"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
            >
              {[...new Set([...LIMITS, limit])]
                .sort((a, b) => a - b)
                .map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
            </Select>
          </div>
          {data.total_pages > 1 && (
            <nav
              aria-label="Paginação"
              className="flex items-center gap-4"
            >
              <Button
                variant="ghost"
                aria-label="Página anterior"
                disabled={data.page <= 1}
                onClick={() => goToPage(data.page - 1)}
              >
                <ChevronLeft size={14} />
              </Button>
              <span className="text-muted">
                Página {data.page} de {data.total_pages} · {data.count} extras
              </span>
              <Button
                variant="ghost"
                aria-label="Próxima página"
                disabled={data.page >= data.total_pages}
                onClick={() => goToPage(data.page + 1)}
              >
                <ChevronRight size={14} />
              </Button>
            </nav>
          )}
        </div>
      )}

      <ExtraHourFormModal />
      <CloseExtraHourModal />
      <DeleteExtraHourModal />
      <ExportModal />
    </div>
  );
}
