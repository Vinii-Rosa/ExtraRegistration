import type { ReactNode } from "react";
import { ProjectsProvider } from "@/contexts/projects-context";
import { SessionProvider } from "@/contexts/session-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import type { Project } from "@/types/projects";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({
  email,
  projects,
  children,
}: {
  email: string;
  projects: Project[];
  children: ReactNode;
}) {
  return (
    <SessionProvider email={email}>
      <ProjectsProvider projects={projects}>
        <SidebarProvider>
          <div className="grid min-h-dvh grid-cols-1 transition-[grid-template-columns] duration-600 ease-ui md:grid-cols-[var(--sidebar-w)_minmax(0,1fr)]">
            <Sidebar />
            <div className="flex min-w-0 flex-col">
              <Header />
              <main className="flex-1 px-6 py-6 lg:px-10 lg:py-12">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </ProjectsProvider>
    </SessionProvider>
  );
}
