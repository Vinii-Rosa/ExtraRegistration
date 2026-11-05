import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Criar conta | Extra Hour" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Criar conta"
      description="Comece a registrar suas horas extras"
      footer={{ text: "Já tem conta?", href: "/login", link: "Entrar" }}
    >
      <RegisterForm />
    </AuthCard>
  );
}
