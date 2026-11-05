import { api } from "@/lib/api";
import type { ExtraHoursPage, ExtraHoursQuery } from "@/types/extra-hours";

function toApiDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export const extraHourRoutes = {
  async list(token: string, query: ExtraHoursQuery): Promise<ExtraHoursPage> {
    const params = new URLSearchParams({
      page: String(query.page),
      limit: String(query.limit),
    });
    if (query.month) params.set("month", query.month);
    if (query.date) params.set("date", toApiDate(query.date));
    if (query.hour) params.set("hour", query.hour);
    if (query.total_value) params.set("total_value", query.total_value);

    const { data } = await api<ExtraHoursPage>(
      `/extra-hours/extra-hours?${params}`,
      { token },
    );
    return data;
  },
};
