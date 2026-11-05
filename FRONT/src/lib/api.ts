export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

export function baseUrl() {
  const url = process.env.API_URL;
  if (!url) throw new Error("API_URL não definida. Configure em .env.local");
  return url.replace(/\/$/, "");
}

export async function api<T = unknown>(
  path: string,
  { method = "GET", body, token, headers }: Options = {},
): Promise<{ data: T; headers: Headers }> {
  let res: Response;
  try {
    res = await fetch(`${baseUrl()}${path}`, {
      method,
      cache: "no-store",
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar ao servidor");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      typeof data?.message === "string" ? data.message : `Erro ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return { data: data as T, headers: res.headers };
}
