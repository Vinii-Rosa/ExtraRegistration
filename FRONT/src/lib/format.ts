const TIME_ZONE = "America/Sao_Paulo";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormat = new Intl.DateTimeFormat("pt-BR", { timeZone: TIME_ZONE });
const dateKeyFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

// null é "Em aberto" e nunca R$ 0
export function formatCurrency(value: number | null | undefined) {
  return value === null || value === undefined
    ? "Em aberto"
    : currency.format(value);
}

// "2026-11-04" -> "04/11/2026"
export function formatDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

// "14:30:00" -> "14:30"
export function formatTime(time: string | null) {
  return time ? time.slice(0, 5) : "Em aberto";
}

// Timestamp ISO da API -> "04/11/2026"
export function formatTimestamp(iso: string) {
  return dateFormat.format(new Date(iso));
}

// Timestamp ISO da API -> "2026-11-04", para comparar com input type=date
export function timestampDateKey(iso: string) {
  return dateKeyFormat.format(new Date(iso));
}

export function todayKey() {
  return dateKeyFormat.format(new Date());
}

export function currentMonthKey() {
  return dateKeyFormat.format(new Date()).slice(0, 7);
}

export function isDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isMonthKey(value: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function formatMonth(month: string) {
  const [year, m] = month.split("-");
  const name = new Date(Number(year), Number(m) - 1, 1).toLocaleDateString(
    "pt-BR",
    { month: "long" },
  );
  return `${name} de ${year}`;
}
