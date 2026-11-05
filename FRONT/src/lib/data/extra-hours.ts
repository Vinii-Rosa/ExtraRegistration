import { cacheLife, cacheTag } from "next/cache";
import { tags } from "@/lib/cache-tags";
import { extraHourRoutes } from "@/lib/routes/extra-hours";
import type { ExtraHoursPage, ExtraHoursQuery } from "@/types/extra-hours";

async function getCachedExtraHours(
  token: string,
  userId: string,
  page: number,
  limit: number,
  month: string | undefined,
): Promise<ExtraHoursPage> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 120, expire: 300 });
  cacheTag(tags.extras(userId));
  return extraHourRoutes.list(token, { page, limit, month });
}

export async function getExtraHours(
  token: string,
  userId: string,
  query: ExtraHoursQuery,
): Promise<ExtraHoursPage> {
  const cacheable = !query.date && !query.hour && !query.total_value;
  return cacheable
    ? getCachedExtraHours(token, userId, query.page, query.limit, query.month)
    : extraHourRoutes.list(token, query);
}
