import { Suspense } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { ShellSkeleton } from "@/components/shell/shell-skeleton";
import { getProjects } from "@/lib/data/projects";
import { requireSession } from "@/lib/session";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: React.ReactNode }) {
  const { email, token, userId } = await requireSession();
  const projects = await getProjects(token, userId);
  return (
    <AppShell email={email} projects={projects}>
      {children}
    </AppShell>
  );
}
