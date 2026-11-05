import { Clock, FolderKanban, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavSection = { title: string; items: NavItem[] };

export const navSections: NavSection[] = [
  {
    title: "Geral",
    items: [
      { href: "/extras", label: "Extras", icon: Clock },
      { href: "/projetos", label: "Projetos", icon: FolderKanban },
    ],
  },
];

export function titleOf(pathname: string) {
  const items = navSections.flatMap((s) => s.items);
  return items.find((i) => pathname.startsWith(i.href))?.label ?? "Extra Hour";
}
