import { Suspense } from "react";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/session";

// Provisória: a tela de extras entra na fase 5, dentro do shell da fase 3
export default function ExtrasPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
      <Suspense fallback={null}>
        <Account />
      </Suspense>
    </main>
  );
}

async function Account() {
  const { email } = await requireSession();
  return (
    <>
      <p>
        Sessão ativa: <strong>{email}</strong>
      </p>
      <form action={logoutAction}>
        <Button type="submit" variant="ghost">
          Sair
        </Button>
      </form>
    </>
  );
}
