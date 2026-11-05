"use client";

import { useState, useTransition } from "react";
import { saveProjectAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useProjectsPage } from "@/contexts/projects-page-context";
import { useToast } from "@/contexts/toast-context";

export function ProjectFormModal() {
  const { dialog, closeDialog } = useProjectsPage();
  const toast = useToast();
  const [pending, startSave] = useTransition();
  const [error, setError] = useState<string>();

  const open = dialog?.kind === "form";
  const project = open ? dialog.project : null;

  function close() {
    setError(undefined);
    closeDialog();
  }

  function submit(formData: FormData) {
    startSave(async () => {
      const result = await saveProjectAction({
        id: project?.id,
        project_name: String(formData.get("project_name") ?? ""),
        hourly_value: String(formData.get("hourly_value") ?? ""),
      });
      if (result.error) return setError(result.error);
      toast.success(project ? "Projeto atualizado" : "Projeto criado");
      close();
    });
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={project ? "Editar projeto" : "Novo projeto"}
    >
      <form action={submit} className="grid gap-4">
        <Input
          id="project_name"
          name="project_name"
          label="Nome"
          defaultValue={project?.project_name}
          autoComplete="off"
          required
        />
        <Input
          id="hourly_value"
          name="hourly_value"
          label="Valor por hora (R$)"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          defaultValue={project?.hourly_value}
          required
        />
        {error && (
          <p role="alert" className="text-[10px] text-danger">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="ghost" onClick={close}>
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
