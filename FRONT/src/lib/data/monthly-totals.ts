import { cacheLife, cacheTag } from "next/cache";
import { tags } from "@/lib/cache-tags";
import { monthlyTotalRoutes } from "@/lib/routes/monthly-totals";
import type { MonthlyTotal } from "@/types/extra-hours";

export async function getMonthlyTotals(
  token: string,
  userId: string,
): Promise<MonthlyTotal[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 600, expire: 900 });
  cacheTag(tags.monthly(userId));
  return monthlyTotalRoutes.list(token);
}
