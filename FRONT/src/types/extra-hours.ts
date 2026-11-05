export type ExtraHour = {
  id: string;
  project_id: string;
  date: string;
  card_name: string | null;
  card_link: string | null;
  start_time: string;
  end_time: string | null;
  total_value: number | null;
};

export type ExtraHoursPage = {
  extra_hours: ExtraHour[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
};

export type ExtraHoursQuery = {
  page: number;
  limit: number;
  month?: string;
  date?: string;
  hour?: string;
  total_value?: string;
};

export type MonthlyTotal = { month: string; total: number };

export type ExtraHourInput = {
  id?: string;
  project_id: string;
  date: string;
  start_time: string;
  end_time: string;
  card_name: string;
  card_link: string;
};
