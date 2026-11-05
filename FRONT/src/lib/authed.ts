import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "./api";
import { authRoutes } from "./routes/auth/login";
import {
  clearSessionCookies,
  requireSession,
  setSessionCookies,
  type Session,
} from "./session";
import { REFRESH_COOKIE } from "./tokens";

// Em 401 renova o token e repete uma vez; sem refresh válido, vai para o login
export async function authed<T>(run: (session: Session) => Promise<T>) {
  const session = await requireSession();
  try {
    return await run(session);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
  }

  const refresh = (await cookies()).get(REFRESH_COOKIE)?.value;
  const access = refresh
    ? await authRoutes.refresh(refresh).catch(() => null)
    : null;

  if (!refresh || !access) {
    await clearSessionCookies();
    redirect("/login");
  }

  await setSessionCookies({ access, refresh });
  return run({ ...session, token: access });
}
