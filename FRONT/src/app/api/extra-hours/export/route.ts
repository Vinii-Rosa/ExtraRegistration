import { NextResponse, type NextRequest } from "next/server";
import { ApiError } from "@/lib/api";
import { isMonthKey } from "@/lib/format";
import { extraHourRoutes } from "@/lib/routes/extra-hours";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const month = request.nextUrl.searchParams.get("month") ?? "";
  if (!isMonthKey(month)) {
    return NextResponse.json({ message: "Mês inválido" }, { status: 400 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await extraHourRoutes.exportMonth(session.token, month);
  } catch (error) {
    const message =
      error instanceof ApiError ? error.message : "Não foi possível conectar ao servidor";
    return NextResponse.json({ message }, { status: 502 });
  }

  if (!upstream.ok) {
    const body = await upstream.json().catch(() => null);
    const message =
      typeof body?.message === "string" ? body.message : `Erro ${upstream.status}`;
    return NextResponse.json({ message }, { status: upstream.status });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type":
        upstream.headers.get("Content-Type") ??
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="extras-${month}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
