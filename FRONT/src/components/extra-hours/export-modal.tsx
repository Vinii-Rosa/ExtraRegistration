"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useExtrasPage } from "@/contexts/extras-page-context";
import { useToast } from "@/contexts/toast-context";
import { currentMonthKey } from "@/lib/format";

async function readError(res: Response) {
  const body = await res.json().catch(() => null);
  return typeof body?.message === "string" ? body.message : `Erro ${res.status}`;
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportModal() {
  const { dialog, filters, closeDialog } = useExtrasPage();
  const toast = useToast();
  const [pending, startExport] = useTransition();
  const [month, setMonth] = useState<string>();

  const open = dialog?.kind === "export";
  const value = month ?? (filters.month || filters.date.slice(0, 7) || currentMonthKey());

  function close() {
    setMonth(undefined);
    closeDialog();
  }

  function submit() {
    if (!value) return;
    startExport(async () => {
      try {
        const res = await fetch(`/api/extra-hours/export?month=${value}`);
        if (!res.ok) return toast.error(await readError(res));
        saveBlob(await res.blob(), `extras-${value}.xlsx`);
        toast.success("Planilha exportada");
        close();
      } catch {
        toast.error("Não foi possível conectar ao servidor");
      }
    });
  }

  return (
    <Modal open={open} onClose={close} title="Exportar planilha">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="grid gap-4"
      >
        <p className="text-muted">Escolha o mês para gerar o arquivo .xlsx.</p>
        <Input
          id="export_month"
          label="Mês"
          type="month"
          value={value}
          onChange={(e) => setMonth(e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Button variant="danger" onClick={close}>
            Cancelar
          </Button>
          <Button variant="success" type="submit" disabled={pending || !value}>
            {pending ? "Exportando..." : "Exportar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
