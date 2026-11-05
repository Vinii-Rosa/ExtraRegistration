"use client";

import { useState, useTransition } from "react";
import { closeExtraHourAction } from "@/actions/extra-hours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useExtrasPage } from "@/contexts/extras-page-context";
import { useToast } from "@/contexts/toast-context";
import { formatTime } from "@/lib/format";

export function CloseExtraHourModal() {
  const { dialog, closeDialog } = useExtrasPage();
  const toast = useToast();
  const [pending, startClose] = useTransition();
  const [error, setError] = useState<string>();

  const open = dialog?.kind === "close";
  const extra = open ? dialog.extra : null;

  function close() {
    setError(undefined);
    closeDialog();
  }

  function submit(formData: FormData) {
    if (!extra) return;
    startClose(async () => {
      const result = await closeExtraHourAction(
        extra.id,
        String(formData.get("end_time") ?? ""),
      );
      if (result.error) return setError(result.error);
      toast.success("Hora extra fechada");
      close();
    });
  }

  return (
    <Modal open={open} onClose={close} title="Fechar hora extra">
      <form action={submit} className="grid gap-4">
        {extra && (
          <p className="text-muted">
            Iniciada às {formatTime(extra.start_time)}. Informe a hora de fim.
          </p>
        )}
        <Input id="close_end_time" name="end_time" label="Fim" type="time" required />
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
            {pending ? "Fechando..." : "Fechar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
