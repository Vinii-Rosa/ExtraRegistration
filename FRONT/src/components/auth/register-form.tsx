"use client";

import { useActionState } from "react";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuthFormState } from "@/types/auth";

const initial: AuthFormState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);

  return (
    <form action={action} className="grid gap-4">
      <Input
        id="name"
        name="name"
        label="Nome"
        autoComplete="name"
        defaultValue={state.values?.name}
        required
      />
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        autoComplete="email"
        defaultValue={state.values?.email}
        required
      />
      <Input
        id="password"
        name="password"
        type="password"
        label="Senha"
        autoComplete="new-password"
        required
      />
      {state.error && (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="success" disabled={pending}>
        {pending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
