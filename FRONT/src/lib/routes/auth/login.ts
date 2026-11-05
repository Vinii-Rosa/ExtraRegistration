import { api, ApiError } from "@/lib/api";
import { REFRESH_COOKIE, readRefreshCookie, type Tokens } from "@/lib/tokens";

const refreshCookie = (refreshToken: string) => ({
  Cookie: `${REFRESH_COOKIE}=${refreshToken}`,
});

export const authRoutes = {
  async login(email: string, password: string): Promise<Tokens> {
    const { data, headers } = await api<{ token: string }>("/login/login", {
      method: "POST",
      body: { email, password },
    });
    const refresh = readRefreshCookie(headers);
    if (!refresh) throw new ApiError(502, "Resposta inválida do servidor");
    return { access: data.token, refresh };
  },

  async refresh(refreshToken: string): Promise<string> {
    const { data } = await api<{ token: string }>("/login/refresh", {
      method: "POST",
      headers: refreshCookie(refreshToken),
    });
    return data.token;
  },

  async logout(refreshToken?: string) {
    await api("/login/logout", {
      method: "POST",
      headers: refreshToken ? refreshCookie(refreshToken) : {},
    });
  },
};
