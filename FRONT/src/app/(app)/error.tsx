"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <EmptyState
      icon={TriangleAlert}
      title="Algo deu errado"
      description="Não foi possível carregar esta tela. Tente novamente."
      action={<Button onClick={() => retry()}>Tentar novamente</Button>}
    />
  );
}
