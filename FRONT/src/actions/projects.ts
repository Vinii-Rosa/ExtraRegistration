"use server";

import { updateTag } from "next/cache";
import { ApiError } from "@/lib/api";
import { authed } from "@/lib/authed";
import { tagsToInvalidate } from "@/lib/cache-tags";
import { projectRoutes } from "@/lib/routes/projects";
import type { ActionResult, ProjectInput } from "@/types/projects";

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
