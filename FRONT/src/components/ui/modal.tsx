"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./button";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="modal-title"
      className="m-auto w-full max-w-md rounded-xl border border-border bg-card p-0 text-fg shadow-sm backdrop:bg-black/50 open:animate-[fade-up_250ms_var(--ease-ui)]"
    >
      {open && (
        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 id="modal-title" className="text-sm font-bold tracking-tight">
              {title}
            </h2>
            <Button variant="icon" aria-label="Fechar" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
