"use client";

import { useState, useTransition } from "react";
import { saveExtraHourAction } from "@/actions/extra-hours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useExtrasPage } from "@/contexts/extras-page-context";
import { useProjects } from "@/contexts/projects-context";
import { useToast } from "@/contexts/toast-context";
import { todayKey } from "@/lib/format";

export function ExtraHourFormModal() {
  const { dialog, closeDialog } = useExtrasPage();
  const { projects } = useProjects();
  const toast = useToast();
  const [pending, startSave] = useTransition();
  const [error, setError] = useState<string>();

  const open = dialog?.kind === "form";
  const extra = open ? dialog.extra : null;

  function close() {
    setError(undefined);
    closeDialog();
  }

  function submit(formData: FormData) {
    const field = (name: string) => String(formData.get(name) ?? "");
    startSave(async () => {
      const result = await saveExtraHourAction({
        id: extra?.id,
        project_id: field("project_id"),
        date: field("date"),
        start_time: field("start_time"),
        end_time: field("end_time"),
        card_name: field("card_name"),
        card_link: field("card_link"),
      });
      if (result.error) return setError(result.error);
      toast.success(extra ? "Hora extra atualizada" : "Hora extra criada");
      close();
    });
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={extra ? "Editar hora extra" : "Nova hora extra"}
    >
      <form action={submit} className="grid gap-4">
        <Select
          id="project_id"
          name="project_id"
          label="Projeto"
          defaultValue={extra?.project_id ?? ""}
          required
        >
          <option value="" disabled>
            Selecione
          </option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.project_name}
            </option>
          ))}
        </Select>
        <Input
          id="date"
          name="date"
          label="Data"
          type="date"
          defaultValue={extra ? extra.date.slice(0, 10) : todayKey()}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="start_time"
            name="start_time"
            label="Início"
            type="time"
            defaultValue={extra?.start_time.slice(0, 5)}
            required
          />
          <Input
            id="end_time"
            name="end_time"
            label="Fim (opcional)"
            type="time"
            defaultValue={extra?.end_time?.slice(0, 5)}
          />
        </div>
        <Input
          id="card_name"
          name="card_name"
          label="Nome do card (opcional)"
          defaultValue={extra?.card_name ?? ""}
          autoComplete="off"
        />
        <Input
          id="card_link"
          name="card_link"
          label="Link do card (opcional)"
          type="url"
          defaultValue={extra?.card_link ?? ""}
          autoComplete="off"
        />
        {error && (
          <p role="alert" className="text-[10px] text-danger">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="danger" onClick={close}>
            Cancelar
          </Button>
          <Button variant="success" type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
