import { Skeleton } from "@/components/ui/skeleton";

export function ShellSkeleton() {
  return (
    <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[var(--sidebar-w)_minmax(0,1fr)]">
      <aside className="hidden border-r border-border bg-card p-3 dark:bg-bg md:block">
        <Skeleton className="mb-6 h-8 w-full" />
        <Skeleton className="mb-1 h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </aside>
      <div className="flex flex-col">
        <div className="flex h-14 items-center border-b border-border px-6">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-4 px-6 py-6 lg:px-10 lg:py-12">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
