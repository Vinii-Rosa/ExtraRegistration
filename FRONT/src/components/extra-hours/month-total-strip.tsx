import { Card } from "@/components/ui/card";
import { formatCurrency, formatMinutes, formatMonth } from "@/lib/format";

export function MonthTotalStrip({
  month,
  total,
  minutes,
}: {
  month: string;
  total: number;
  minutes: number;
}) {
  return (
    <Card className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[10px] text-muted uppercase">Total do mês</p>
        <p className="text-muted capitalize">{formatMonth(month)}</p>
      </div>
      <dl className="flex items-center gap-6 text-right">
        <div>
          <dt className="text-[10px] text-muted uppercase">Horas</dt>
          <dd className="text-lg font-bold tracking-tight">
            {formatMinutes(minutes)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] text-muted uppercase">Valor</dt>
          <dd className="text-lg font-bold tracking-tight">
            {formatCurrency(total)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
