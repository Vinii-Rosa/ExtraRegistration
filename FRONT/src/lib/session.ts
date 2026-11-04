import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  readUser,
  refreshCookieOptions,
  type TokenUser,
  type Tokens,
} from "./tokens";

export type Session = TokenUser & { token: string };

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const user = token ? readUser(token) : null;
  return token && user ? { ...user, token } : null;
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function setSessionCookies({ access, refresh }: Tokens) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, access, accessCookieOptions);
  store.set(REFRESH_COOKIE, refresh, refreshCookieOptions);
}

export async function clearSessionCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}
