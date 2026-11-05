export type Project = {
  id: string;
  project_name: string;
  hourly_value: number;
  total_profit: number;
  createdAt: string;
};

export type ProjectInput = {
  id?: string;
  project_name: string;
  hourly_value: string;
};

export type ActionResult = { error?: string };
