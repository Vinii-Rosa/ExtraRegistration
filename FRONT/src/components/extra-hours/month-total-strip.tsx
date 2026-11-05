import { Card } from "@/components/ui/card";
import { formatCurrency, formatMonth } from "@/lib/format";

export function MonthTotalStrip({
  month,
  total,
}: {
  month: string;
  total: number;
}) {
  return (
    <Card className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[10px] text-muted uppercase">Total do mês</p>
        <p className="text-muted capitalize">{formatMonth(month)}</p>
      </div>
      <p className="text-lg font-bold tracking-tight">{formatCurrency(total)}</p>
    </Card>
  );
}
