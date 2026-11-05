import type { ExtraHoursQuery } from "@/types/extra-hours";

export const DEFAULT_LIMIT = 10;

type Raw = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) || undefined;

function positiveInt(value: string | undefined, fallback: number, max: number) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? Math.min(n, max) : fallback;
}

export function parseExtrasQuery(raw: Raw): ExtraHoursQuery {
  const month = first(raw.month);
  const date = month ? undefined : first(raw.date);
  const hour = first(raw.hour);
  const total = first(raw.total_value);

  return {
    page: positiveInt(first(raw.page), 1, Number.MAX_SAFE_INTEGER),
    limit: positiveInt(first(raw.limit), DEFAULT_LIMIT, 100),
    month,
    date,
    hour: hour && Number.isInteger(Number(hour)) ? hour : undefined,
    total_value: total && Number.isInteger(Number(total)) ? total : undefined,
  };
}
