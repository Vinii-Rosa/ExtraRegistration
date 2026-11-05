import { cacheLife, cacheTag } from "next/cache";
import { tags } from "@/lib/cache-tags";
import { projectRoutes } from "@/lib/routes/projects";
import type { Project } from "@/types/projects";

// O token entra na chave do cache: só quem tem aquele token acerta a entrada
export async function getProjects(
  token: string,
  userId: string,
): Promise<Project[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 600, expire: 900 });
  cacheTag(tags.projects(userId));
  return projectRoutes.list(token);
}
