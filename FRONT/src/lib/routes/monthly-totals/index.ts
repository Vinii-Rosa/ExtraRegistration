import { api } from "@/lib/api";
import type { MonthlyTotal } from "@/types/extra-hours";

export const monthlyTotalRoutes = {
  async list(token: string): Promise<MonthlyTotal[]> {
    const { data } = await api<{ monthly_totals: MonthlyTotal[] }>(
      "/monthly-totals/monthly-totals",
      { token },
    );
    return data.monthly_totals;
  },
};
