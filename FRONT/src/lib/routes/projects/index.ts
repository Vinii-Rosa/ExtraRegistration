import { api } from "@/lib/api";
import type { Project } from "@/types/projects";

type ProjectBody = { project_name: string; hourly_value: number };

export const projectRoutes = {
  async list(token: string): Promise<Project[]> {
    const { data } = await api<{ projects: Project[] }>("/projects/projects", {
      token,
    });
    return data.projects;
  },

  async create(token: string, body: ProjectBody) {
    await api("/projects/project/create", { method: "POST", body, token });
  },

  async update(token: string, id: string, body: ProjectBody) {
    await api(`/projects/update-project/${id}`, {
      method: "PUT",
      body,
      token,
    });
  },

  async remove(token: string, id: string) {
    await api(`/projects/delete-project/${id}`, { method: "DELETE", token });
  },
};
