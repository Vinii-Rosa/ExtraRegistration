"use client";

import { useTransition } from "react";
import { deleteExtraHourAction } from "@/actions/extra-hours";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useExtrasPage } from "@/contexts/extras-page-context";
import { useToast } from "@/contexts/toast-context";
import { formatDate } from "@/lib/format";

export function DeleteExtraHourModal() {
  const { dialog, closeDialog } = useExtrasPage();
  const toast = useToast();
  const [pending, startDelete] = useTransition();

  const open = dialog?.kind === "delete";
  const extra = open ? dialog.extra : null;

  function confirm() {
    if (!extra) return;
    startDelete(async () => {
      const result = await deleteExtraHourAction(extra.id);
      if (result.error) toast.error(result.error);
      else toast.success("Hora extra excluída");
      closeDialog();
    });
  }

  return (
    <Modal open={open} onClose={closeDialog} title="Excluir hora extra?">
      <p className="text-muted">
        {extra &&
          `${extra.card_name || "Hora extra"} de ${formatDate(extra.date)} será excluída. `}
        Esta ação não pode ser desfeita.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="danger" onClick={closeDialog}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={confirm} disabled={pending}>
          {pending ? "Excluindo..." : "Excluir"}
        </Button>
      </div>
    </Modal>
  );
}
