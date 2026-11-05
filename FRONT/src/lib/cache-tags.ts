export const tags = {
  projects: (userId: string) => `projects:${userId}`,
  extras: (userId: string) => `extras:${userId}`,
  monthly: (userId: string) => `monthly:${userId}`,
};

export type Write =
  | "project"
  | "extra"
  | "recalculate";

// Cada escrita invalida estas tags (total_profit do projeto muda com os extras)
export function tagsToInvalidate(write: Write, userId: string) {
  switch (write) {
    case "project":
      return [tags.projects(userId)];
    case "extra":
    case "recalculate":
      return [tags.extras(userId), tags.monthly(userId), tags.projects(userId)];
  }
}
