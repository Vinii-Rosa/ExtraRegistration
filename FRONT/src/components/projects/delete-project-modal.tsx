"use client";

import { useTransition } from "react";
import { deleteProjectAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useProjectsPage } from "@/contexts/projects-page-context";
import { useToast } from "@/contexts/toast-context";

export function DeleteProjectModal() {
  const { dialog, closeDialog } = useProjectsPage();
  const toast = useToast();
  const [pending, startDelete] = useTransition();

  const open = dialog?.kind === "delete";
  const project = open ? dialog.project : null;

  function confirm() {
    if (!project) return;
    startDelete(async () => {
      const result = await deleteProjectAction(project.id);
      if (result.error) toast.error(result.error);
      else toast.success("Projeto excluído");
      closeDialog();
    });
  }

  return (
    <Modal open={open} onClose={closeDialog} title="Excluir projeto?">
      <p className="text-muted">
        {project && `"${project.project_name}" será excluído. `}
        Esta ação não pode ser desfeita.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="ghost" onClick={closeDialog}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={confirm} disabled={pending}>
          {pending ? "Excluindo..." : "Excluir"}
        </Button>
      </div>
    </Modal>
  );
}
