"use client";

import { useRef, useState, useTransition } from "react";
import {
  listProjectExtrasAction,
  recalculateProjectAction,
} from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useProjectsPage } from "@/contexts/projects-page-context";
import { useToast } from "@/contexts/toast-context";
import {
  currentMonthKey,
  formatCurrency,
  formatDate,
  formatTime,
} from "@/lib/format";
import type { ExtraHour } from "@/types/extra-hours";
import type { RecalculateInput } from "@/types/projects";

type Scope = "none" | "selected" | "month" | "all";

const options: { value: Scope; label: string; hint: string }[] = [
  { value: "none", label: "Nenhum", hint: "Só os próximos extras usam o novo valor" },
  { value: "selected", label: "Selecionados", hint: "Escolha quais extras recalcular" },
  { value: "month", label: "Um mês", hint: "Todos os extras fechados do mês" },
  { value: "all", label: "Tudo", hint: "Todos os extras fechados do projeto" },
];

export function RecalculateModal() {
  const { dialog, closeDialog } = useProjectsPage();
  const toast = useToast();
  const [saving, startSave] = useTransition();
  const [loading, startLoad] = useTransition();
  const [scope, setScope] = useState<Scope>("none");
  const [month, setMonth] = useState(currentMonthKey);
  const [filterMonth, setFilterMonth] = useState("");
  const [extras, setExtras] = useState<ExtraHour[]>();
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>();
  const request = useRef(0);

  const open = dialog?.kind === "recalculate";
  const project = open ? dialog.project : null;

  function close() {
    request.current++;
    setScope("none");
    setMonth(currentMonthKey());
    setFilterMonth("");
    setExtras(undefined);
    setPicked(new Set());
    setError(undefined);
    closeDialog();
  }

  function loadExtras(forMonth: string) {
    if (!project) return;
    const id = ++request.current;
    setError(undefined);
    startLoad(async () => {
      const result = await listProjectExtrasAction(project.id, forMonth);
      if (id !== request.current) return;
      if (result.error) return setError(result.error);
      setExtras(result.extras);
      setPicked(new Set());
    });
  }

  function chooseScope(next: Scope) {
    setScope(next);
    setError(undefined);
    if (next === "selected" && !extras) loadExtras(filterMonth);
  }

  function changeFilterMonth(value: string) {
    setFilterMonth(value);
    loadExtras(value);
  }

  function toggle(id: string) {
    setPicked((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setPicked(
      picked.size === extras?.length
        ? new Set()
        : new Set(extras?.map((e) => e.id)),
    );
  }

  function submit() {
    if (!project) return;
    if (scope === "none") return close();

    const input: RecalculateInput =
      scope === "all"
        ? { scope }
        : scope === "month"
          ? { scope, month }
          : { scope, extra_hour_ids: [...picked] };

    startSave(async () => {
      const result = await recalculateProjectAction(project.id, input);
      if (result.error) return setError(result.error);
      toast.success("Extras recalculados");
      close();
    });
  }

  const busy = saving || (scope === "selected" && loading);

  return (
    <Modal open={open} onClose={close} title="Recalcular extras?">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="grid gap-4"
      >
        {project && (
          <p className="text-muted">
            O valor por hora de &quot;{project.project_name}&quot; agora é{" "}
            {formatCurrency(project.hourly_value)}. Os extras já lançados
            mantêm o valor antigo até serem recalculados.
          </p>
        )}

        <fieldset className="grid gap-2">
          <legend className="sr-only">Quais extras recalcular</legend>
          {options.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2 transition-colors duration-250 ease-ui hover:bg-card-hover has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-focus ${
                scope === option.value ? "border-focus" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="scope"
                value={option.value}
                checked={scope === option.value}
                onChange={() => chooseScope(option.value)}
                className="mt-0.5 accent-[var(--primary)]"
              />
              <span>
                <span className="block font-semibold">{option.label}</span>
                <span className="block text-[10px] text-muted">
                  {option.hint}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        {scope === "month" && (
          <Input
            id="recalculate_month"
            label="Mês"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          />
        )}

        {scope === "selected" && (
          <div className="grid gap-3">
            <Input
              id="recalculate_filter_month"
              label="Filtrar por mês (opcional)"
              type="month"
              value={filterMonth}
              onChange={(e) => changeFilterMonth(e.target.value)}
            />

            {loading || !extras ? (
              <p className="text-muted" role="status">
                {error ? "" : "Carregando extras..."}
              </p>
            ) : extras.length === 0 ? (
              <p className="text-muted">Nenhum extra fechado encontrado.</p>
            ) : (
              <div className="grid gap-2">
                <label className="flex cursor-pointer items-center gap-3 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={picked.size === extras.length}
                    onChange={toggleAll}
                    className="accent-[var(--primary)]"
                  />
                  Selecionar todos ({extras.length})
                </label>
                <ul className="grid max-h-56 gap-1 overflow-y-auto rounded-lg border border-border p-1">
                  {extras.map((extra) => (
                    <li key={extra.id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 transition-colors duration-250 ease-ui hover:bg-card-hover">
                        <input
                          type="checkbox"
                          checked={picked.has(extra.id)}
                          onChange={() => toggle(extra.id)}
                          className="accent-[var(--primary)]"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">
                            {extra.card_name || "Sem nome"}
                          </span>
                          <span className="block text-[10px] text-muted">
                            {formatDate(extra.date)} ·{" "}
                            {formatTime(extra.start_time)} às{" "}
                            {formatTime(extra.end_time)}
                          </span>
                        </span>
                        <span className="shrink-0 text-muted">
                          {formatCurrency(extra.total_value)}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <p role="alert" className="text-[10px] text-danger">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button variant="danger" onClick={close}>
            Cancelar
          </Button>
          <Button
            variant="success"
            type="submit"
            disabled={busy || (scope === "selected" && picked.size === 0)}
          >
            {saving
              ? "Recalculando..."
              : scope === "none"
                ? "Concluir"
                : "Recalcular"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
