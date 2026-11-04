import { api, ApiError } from "./api";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;
const REFRESH_MARGIN = 30;

export type Tokens = { access: string; refresh: string };
export type TokenUser = { userId: string; email: string };

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export const accessCookieOptions = cookieOptions(ACCESS_MAX_AGE);
export const refreshCookieOptions = cookieOptions(REFRESH_MAX_AGE);

type JwtPayload = { user_id?: string; email?: string; exp?: number };

export function decodeJwt(token: string): JwtPayload | null {
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function readUser(token: string): TokenUser | null {
  const payload = decodeJwt(token);
  if (!payload?.user_id || !payload.email) return null;
  return { userId: payload.user_id, email: payload.email };
}

export function isFresh(token: string | undefined, now = Date.now()) {
  if (!token) return false;
  const exp = decodeJwt(token)?.exp;
  return typeof exp === "number" && exp * 1000 - now > REFRESH_MARGIN * 1000;
}

export function readRefreshCookie(headers: Headers) {
  const line = headers
    .getSetCookie()
    .find((c) => c.startsWith(`${REFRESH_COOKIE}=`));
  const value = line?.slice(REFRESH_COOKIE.length + 1).split(";")[0];
  return value || null;
}

export async function loginRequest(
  email: string,
  password: string,
): Promise<Tokens> {
  const { data, headers } = await api<{ token: string }>("/login/login", {
    method: "POST",
    body: { email, password },
  });
  const refresh = readRefreshCookie(headers);
  if (!refresh) throw new ApiError(502, "Resposta inválida do servidor");
  return { access: data.token, refresh };
}

export type RefreshResult =
  | { status: "ok"; tokens: Tokens }
  | { status: "invalid" }
  | { status: "unavailable" };

export async function refreshRequest(
  refreshToken: string,
): Promise<RefreshResult> {
  try {
    const { data, headers } = await api<{ token: string }>("/login/refresh", {
      method: "POST",
      headers: { Cookie: `${REFRESH_COOKIE}=${refreshToken}` },
    });
    const refresh = readRefreshCookie(headers);
    if (!refresh) return { status: "unavailable" };
    return { status: "ok", tokens: { access: data.token, refresh } };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { status: "invalid" };
    }
    return { status: "unavailable" };
  }
}
