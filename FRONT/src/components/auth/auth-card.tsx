import { Clock } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
  footer: { text: string; href: string; link: string };
};

export function AuthCard({ title, description, children, footer }: Props) {
  return (
    <Card className="flex w-full max-w-sm flex-col gap-6 p-6 animate-[fade-up_250ms_var(--ease-ui)]">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-10 items-center justify-center rounded-xl border border-accent text-fg">
          <Clock size={20} />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
          <p className="text-muted">{description}</p>
        </div>
      </div>
      {children}
      <p className="text-center text-muted">
        {footer.text}{" "}
        <Link
          href={footer.href}
          className="font-semibold text-fg underline-offset-2 hover:underline"
        >
          {footer.link}
        </Link>
      </p>
    </Card>
  );
}
