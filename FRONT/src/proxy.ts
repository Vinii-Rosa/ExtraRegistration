import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  isFresh,
} from "@/lib/tokens";
import { ApiError } from "@/lib/api";
import { authRoutes } from "@/lib/routes/auth/login";

const PUBLIC_PATHS = ["/login", "/cadastro"];

function withAccess(res: NextResponse, access: string) {
  res.cookies.set(ACCESS_COOKIE, access, accessCookieOptions);
  return res;
}

type RefreshResult =
  | { status: "ok"; access: string }
  | { status: "invalid" }
  | { status: "unavailable" };

async function refresh(refreshToken: string): Promise<RefreshResult> {
  try {
    return { status: "ok", access: await authRoutes.refresh(refreshToken) };
  } catch (error) {
    return error instanceof ApiError && error.status === 401
      ? { status: "invalid" }
      : { status: "unavailable" };
  }
}

function clearTokens(res: NextResponse) {
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isApi = pathname.startsWith("/api/");

  let authenticated = isFresh(request.cookies.get(ACCESS_COOKIE)?.value);
  let renewed: string | null = null;

  if (!authenticated) {
    const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
    if (refreshToken) {
      const result = await refresh(refreshToken);
      if (result.status === "ok") {
        renewed = result.access;
        authenticated = true;
        // Os Server Components desta mesma requisição precisam já enxergar o token novo
        request.cookies.set(ACCESS_COOKIE, renewed);
      } else if (result.status === "invalid") {
        const res = isPublic
          ? NextResponse.next()
          : isApi
            ? NextResponse.json({ message: "Sessão expirada" }, { status: 401 })
            : NextResponse.redirect(new URL("/login", request.url));
        return clearTokens(res);
      }
    }
  }

  let response: NextResponse;
  if (authenticated && isPublic) {
    response = NextResponse.redirect(new URL("/extras", request.url));
  } else if (!authenticated && !isPublic) {
    response = isApi
      ? NextResponse.json({ message: "Não autenticado" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
  } else {
    response = NextResponse.next({ request });
  }

  return renewed ? withAccess(response, renewed) : response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
