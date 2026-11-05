import { api } from "@/lib/api";
import type { ExtraHoursPage, ExtraHoursQuery } from "@/types/extra-hours";

export type ExtraHourBody = {
  project_id?: string;
  date?: string;
  start_time?: string;
  end_time?: string | null;
  card_name?: string | null;
  card_link?: string | null;
};

function toApiDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

const toApiBody = ({ date, ...rest }: ExtraHourBody) => ({
  ...rest,
  ...(date && { date: toApiDate(date) }),
});

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

  async create(token: string, body: ExtraHourBody) {
    await api("/extra-hours/extra-hour/create", {
      method: "POST",
      body: toApiBody(body),
      token,
    });
  },

  async update(token: string, id: string, body: ExtraHourBody) {
    await api(`/extra-hours/update-extra-hour/${id}`, {
      method: "PUT",
      body: toApiBody(body),
      token,
    });
  },

  async remove(token: string, id: string) {
    await api(`/extra-hours/delete-extra-hour/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
