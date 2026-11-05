import { api } from "@/lib/api";

export const userRoutes = {
  async create(name: string, email: string, password: string) {
    await api("/users/user/create", {
      method: "POST",
      body: { name, email, password },
    });
  },
};
