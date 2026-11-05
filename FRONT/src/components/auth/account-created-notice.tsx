"use client";

import { CircleCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function AccountCreatedNotice() {
  const created = useSearchParams().get("created");
  if (!created) return null;

  return (
    <p
      role="status"
      className="flex items-center gap-2 rounded-lg border border-success px-3 py-2 text-fg"
    >
      <CircleCheck size={14} className="shrink-0 text-success" aria-hidden />
      Conta criada! Entre com seu email e senha.
    </p>
  );
}
