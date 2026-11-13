"use server";

import { updateTag } from "next/cache";
import { ApiError } from "@/lib/api";
import { authed } from "@/lib/authed";
import { tagsToInvalidate } from "@/lib/cache-tags";
import {
  extraHourRoutes,
  type ExtraHourBody,
} from "@/lib/routes/extra-hours";
import type { ExtraHourInput } from "@/types/extra-hours";
import type { ActionResult } from "@/types/projects";

const messageOf = (error: unknown) =>
  error instanceof ApiError ? error.message : "Erro inesperado. Tente novamente";

async function write(run: (token: string) => Promise<void>) {
  try {
    await authed(async ({ token, userId }) => {
      await run(token);
      tagsToInvalidate("extra", userId).forEach(updateTag);
    });
  } catch (error) {
    return { error: messageOf(error) };
  }
  return {};
}

export async function saveExtraHourAction(
  input: ExtraHourInput,
): Promise<ActionResult> {
  if (!input.project_id) return { error: "Selecione o projeto" };
  if (!input.date) return { error: "Informe a data" };
  if (!input.start_time) return { error: "Informe a hora de início" };

  const body: ExtraHourBody = {
    project_id: input.project_id,
    date: input.date,
    start_time: input.start_time,
    end_time: input.end_time || null,
    card_name: input.card_name.trim() || null,
    card_link: input.card_link.trim() || null,
    description: input.description.trim() || null,
  };

  return write(async (token) => {
    if (input.id) await extraHourRoutes.update(token, input.id, body);
    else await extraHourRoutes.create(token, body);
  });
}

export async function closeExtraHourAction(
  id: string,
  endTime: string,
): Promise<ActionResult> {
  if (!endTime) return { error: "Informe a hora de fim" };
  return write((token) =>
    extraHourRoutes.update(token, id, { end_time: endTime }),
  );
}

export async function reopenExtraHourAction(id: string): Promise<ActionResult> {
  return write((token) => extraHourRoutes.update(token, id, { end_time: null }));
}

export async function deleteExtraHourAction(id: string): Promise<ActionResult> {
  return write((token) => extraHourRoutes.remove(token, id));
}
