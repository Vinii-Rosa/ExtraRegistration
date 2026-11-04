"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { authRoutes, userRoutes } from "@/lib/routes";
import { clearSessionCookies, setSessionCookies } from "@/lib/session";
import { REFRESH_COOKIE } from "@/lib/tokens";
import type { AuthFormState } from "@/types/auth";

const field = (data: FormData, key: string) =>
  String(data.get(key) ?? "").trim();

const messageOf = (error: unknown) =>
  error instanceof ApiError ? error.message : "Erro inesperado. Tente novamente";

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = field(formData, "email");
  const password = String(formData.get("password") ?? "");
  const values = { email };

  if (!email) return { error: "Informe o email", values };
  if (!password) return { error: "Informe a senha", values };

  try {
    await setSessionCookies(await authRoutes.login(email, password));
  } catch (error) {
    return { error: messageOf(error), values };
  }

  redirect("/extras");
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = field(formData, "name");
  const email = field(formData, "email");
  const password = String(formData.get("password") ?? "");
  const values = { name, email };

  if (!name) return { error: "Informe o nome", values };
  if (!email) return { error: "Informe o email", values };
  if (!password) return { error: "Informe a senha", values };

  try {
    await userRoutes.create(name, email, password);
  } catch (error) {
    return { error: messageOf(error), values };
  }

  try {
    await setSessionCookies(await authRoutes.login(email, password));
  } catch {
    return {
      error: "Conta criada, mas não foi possível entrar. Faça login",
      values,
    };
  }

  redirect("/extras");
}

export async function logoutAction() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  // Revoga o refresh token no banco da API; a sessão local é limpa mesmo se falhar
  await authRoutes.logout(refreshToken).catch(() => null);
  await clearSessionCookies();
  redirect("/login");
}
