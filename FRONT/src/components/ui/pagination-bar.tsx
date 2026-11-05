import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { Select } from "./select";

export const PAGE_SIZES = [10, 20, 50, 100];

type Props = {
  limit: number;
  onLimitChange: (limit: number) => void;
  page: number;
  totalPages: number;
  count: number;
  noun: string;
  onPage: (page: number) => void;
};

// Rodapé das listas: itens por página à esquerda, paginação à direita
export function PaginationBar({
  limit,
  onLimitChange,
  page,
  totalPages,
  count,
  noun,
  onPage,
}: Props) {
  return (
    <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
      <div className="w-32">
        <Select
          id="filter-limit"
          label="Por página"
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
        >
          {[...new Set([...PAGE_SIZES, limit])]
            .sort((a, b) => a - b)
            .map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
        </Select>
      </div>
      {totalPages > 1 && (
        <nav aria-label="Paginação" className="flex items-center gap-4">
          <Button
            variant="ghost"
            aria-label="Página anterior"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-muted">
            Página {page} de {totalPages} · {count} {noun}
          </span>
          <Button
            variant="ghost"
            aria-label="Próxima página"
            disabled={page >= totalPages}
            onClick={() => onPage(page + 1)}
          >
            <ChevronRight size={14} />
          </Button>
        </nav>
      )}
    </div>
  );
}
