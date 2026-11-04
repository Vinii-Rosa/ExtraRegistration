import type { ReactNode } from "react";
import { SessionProvider } from "@/contexts/session-context";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  return (
    <SessionProvider email={email}>
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
    </SessionProvider>
  );
}
