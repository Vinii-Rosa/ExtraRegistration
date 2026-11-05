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
