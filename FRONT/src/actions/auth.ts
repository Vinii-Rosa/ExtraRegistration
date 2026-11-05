"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api";
import { authRoutes } from "@/lib/routes/auth/login";
import { userRoutes } from "@/lib/routes/auth/users";
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

  // Só cria a conta: quem entra é o login
  redirect("/login?created=1");
}

export async function logoutAction() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  // Revoga o refresh token no banco da API; a sessão local é limpa mesmo se falhar
  await authRoutes.logout(refreshToken).catch(() => null);
  await clearSessionCookies();
  redirect("/login");
}
