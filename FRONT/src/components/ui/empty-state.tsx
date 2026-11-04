import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl border border-border text-fg">
        <Icon size={20} />
      </span>
      <p className="text-sm font-bold tracking-tight">{title}</p>
      {description && <p className="max-w-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}
