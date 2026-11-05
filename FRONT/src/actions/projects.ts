"use server";

import { updateTag } from "next/cache";
import { ApiError } from "@/lib/api";
import { authed } from "@/lib/authed";
import { tagsToInvalidate } from "@/lib/cache-tags";
import { extraHourRoutes } from "@/lib/routes/extra-hours";
import { projectRoutes } from "@/lib/routes/projects";
import { isMonthKey } from "@/lib/format";
import type { ExtraHour } from "@/types/extra-hours";
import type {
  ActionResult,
  ProjectInput,
  RecalculateInput,
} from "@/types/projects";

const messageOf = (error: unknown) =>
  error instanceof ApiError ? error.message : "Erro inesperado. Tente novamente";

// Só inteiro positivo: a API rejeita decimais
function parseHourlyValue(raw: string) {
  const text = raw.trim();
  return /^\d+$/.test(text) && Number(text) > 0 ? Number(text) : null;
}

export async function saveProjectAction({
  id,
  project_name,
  hourly_value,
}: ProjectInput): Promise<ActionResult> {
  const name = project_name.trim();
  const value = parseHourlyValue(hourly_value);

  if (!name) return { error: "Informe o nome do projeto" };
  if (value === null) return { error: "Valor por hora deve ser um número inteiro" };

  try {
    await authed(async ({ token, userId }) => {
      const body = { project_name: name, hourly_value: value };
      if (id) await projectRoutes.update(token, id, body);
      else await projectRoutes.create(token, body);
      tagsToInvalidate("project", userId).forEach(updateTag);
    });
  } catch (error) {
    return { error: messageOf(error) };
  }
  return {};
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    await authed(async ({ token, userId }) => {
      await projectRoutes.remove(token, id);
      tagsToInvalidate("project", userId).forEach(updateTag);
    });
  } catch (error) {
    return { error: messageOf(error) };
  }
  return {};
}

export async function recalculateProjectAction(
  id: string,
  input: RecalculateInput,
): Promise<ActionResult> {
  if (input.scope === "month" && !isMonthKey(input.month))
    return { error: "Informe o mês" };
  if (input.scope === "selected" && input.extra_hour_ids.length === 0)
    return { error: "Selecione ao menos uma hora extra" };

  try {
    await authed(async ({ token, userId }) => {
      await projectRoutes.recalculate(token, id, input);
      tagsToInvalidate("recalculate", userId).forEach(updateTag);
    });
  } catch (error) {
    return { error: messageOf(error) };
  }
  return {};
}

const PAGE_SIZE = 100;
const MAX_PAGES = 50;

export async function listProjectExtrasAction(
  projectId: string,
  month: string,
): Promise<{ error?: string; extras?: ExtraHour[] }> {
  if (month && !isMonthKey(month)) return { error: "Mês inválido" };

  try {
    const extras = await authed(async ({ token }) => {
      const found: ExtraHour[] = [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const data = await extraHourRoutes.list(token, {
          page,
          limit: PAGE_SIZE,
          month: month || undefined,
        });
        found.push(
          ...data.extra_hours.filter(
            (e) => e.project_id === projectId && e.end_time !== null,
          ),
        );
        if (page >= data.total_pages) break;
      }
      return found;
    });
    return { extras };
  } catch (error) {
    return { error: messageOf(error) };
  }
}
