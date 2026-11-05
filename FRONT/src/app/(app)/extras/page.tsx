import { connection } from "next/server";
import { Suspense } from "react";
import { ExtrasView } from "@/components/extra-hours/extras-view";
import { MonthTotalStrip } from "@/components/extra-hours/month-total-strip";
import { Skeleton } from "@/components/ui/skeleton";
import { ExtrasPageProvider } from "@/contexts/extras-page-context";
import { getExtraHours } from "@/lib/data/extra-hours";
import { getMonthlyTotals } from "@/lib/data/monthly-totals";
import { parseExtrasQuery } from "@/lib/extras-query";
import { currentMonthKey } from "@/lib/format";
import { requireSession } from "@/lib/session";

export default function ExtrasPage({ searchParams }: PageProps<"/extras">) {
  return (
    <Suspense fallback={<ExtrasSkeleton />}>
      <Extras searchParams={searchParams} />
    </Suspense>
  );
}

async function Extras({
  searchParams,
}: {
  searchParams: PageProps<"/extras">["searchParams"];
}) {
  const query = parseExtrasQuery(await searchParams);
  const { token, userId } = await requireSession();
  // O mês atual muda com o tempo: só pode ser lido na requisição
  await connection();

  const month =
    query.from?.slice(0, 7) ?? query.to?.slice(0, 7) ?? currentMonthKey();
  const [data, totals] = await Promise.all([
    getExtraHours(token, userId, query),
    getMonthlyTotals(token, userId),
  ]);
  const total = totals.find((t) => t.month === month)?.total ?? 0;

  return (
    <div className="flex flex-1 flex-col gap-6 md:min-h-0">
      <MonthTotalStrip month={month} total={total} />
      <ExtrasPageProvider>
        <ExtrasView data={data} />
      </ExtrasPageProvider>
    </div>
  );
}

function ExtrasSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando">
      <Skeleton className="h-16" />
      <Skeleton className="h-14" />
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}
