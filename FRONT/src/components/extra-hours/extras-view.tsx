"use client";

import {
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
import { PaginationBar } from "@/components/ui/pagination-bar";
import { Select } from "@/components/ui/select";
import { useExtrasPage } from "@/contexts/extras-page-context";
import type { ExtraHoursPage } from "@/types/extra-hours";
import { CloseExtraHourModal } from "./close-extra-hour-modal";
import { DeleteExtraHourModal } from "./delete-extra-hour-modal";
import { ExtraHourCard } from "./extra-hour-card";
import { ExportModal } from "./export-modal";
import { ExtraHourFormModal } from "./extra-hour-form-modal";

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
    <div className="flex flex-1 flex-col gap-6 md:min-h-0">
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
          id="filter-from"
          label="De"
          type="date"
          max={filters.to || undefined}
          value={filters.from}
          onChange={(e) => setFilter("from", e.target.value)}
        />
        <Input
          id="filter-to"
          label="Até"
          type="date"
          min={filters.from || undefined}
          value={filters.to}
          onChange={(e) => setFilter("to", e.target.value)}
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
          />
        )
      ) : (
        <div
          className={`-mx-2 -my-2 grid auto-rows-max content-start gap-4 px-2 py-2 transition-opacity duration-250 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))] md:min-h-0 md:flex-1 md:overflow-y-auto ${pending ? "opacity-60" : ""}`}
        >
          {data.extra_hours.map((extra) => (
            <ExtraHourCard key={extra.id} extra={extra} />
          ))}
        </div>
      )}

      {data.count > 0 && (
        <PaginationBar
          limit={limit}
          onLimitChange={setLimit}
          page={data.page}
          totalPages={data.total_pages}
          count={data.count}
          noun="extras"
          onPage={goToPage}
        />
      )}

      <ExtraHourFormModal />
      <CloseExtraHourModal />
      <DeleteExtraHourModal />
      <ExportModal />
    </div>
  );
}
