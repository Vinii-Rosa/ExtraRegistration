import { describe, expect, it } from "@jest/globals";
import {
  formatCurrency,
  formatDate,
  formatMonth,
  formatTime,
  formatTimestamp,
  isMonthKey,
  timestampDateKey,
} from "@/lib/format";

// O espaço entre "R$" e o valor é um espaço não separável
const brl = (text: string) => text.replace(/ /g, " ");

describe("formatCurrency", () => {
  it("formata em reais", () => {
    expect(brl(formatCurrency(120))).toBe("R$ 120,00");
    expect(brl(formatCurrency(1234.5))).toBe("R$ 1.234,50");
  });

  it("null e undefined são 'Em aberto', nunca R$ 0", () => {
    expect(formatCurrency(null)).toBe("Em aberto");
    expect(formatCurrency(undefined)).toBe("Em aberto");
  });

  it("zero continua sendo R$ 0,00", () => {
    expect(brl(formatCurrency(0))).toBe("R$ 0,00");
  });
});

describe("formatDate", () => {
  it("converte YYYY-MM-DD para DD/MM/YYYY", () => {
    expect(formatDate("2026-11-04")).toBe("04/11/2026");
  });

  it("ignora a parte de hora de um timestamp", () => {
    expect(formatDate("2026-11-04T00:00:00.000Z")).toBe("04/11/2026");
  });
});

describe("formatTime", () => {
  it("corta os segundos", () => {
    expect(formatTime("14:30:00")).toBe("14:30");
  });

  it("null é 'Em aberto'", () => {
    expect(formatTime(null)).toBe("Em aberto");
  });
});

describe("timestamps no fuso de São Paulo", () => {
  it("usa o dia local, não o dia em UTC", () => {
    // 02:00 UTC ainda é o dia anterior em São Paulo (UTC-3)
    expect(formatTimestamp("2026-11-05T02:00:00.000Z")).toBe("04/11/2026");
    expect(timestampDateKey("2026-11-05T02:00:00.000Z")).toBe("2026-11-04");
  });

  it("mantém o dia quando já é o mesmo nos dois fusos", () => {
    expect(timestampDateKey("2026-11-05T15:00:00.000Z")).toBe("2026-11-05");
  });
});

describe("isMonthKey", () => {
  it("aceita YYYY-MM com mês de 01 a 12", () => {
    expect(isMonthKey("2026-01")).toBe(true);
    expect(isMonthKey("2026-12")).toBe(true);
  });

  it("rejeita formatos e meses inválidos", () => {
    expect(isMonthKey("2026-00")).toBe(false);
    expect(isMonthKey("2026-13")).toBe(false);
    expect(isMonthKey("2026-1")).toBe(false);
    expect(isMonthKey("2026-11-04")).toBe(false);
    expect(isMonthKey("")).toBe(false);
  });
});

describe("formatMonth", () => {
  it("escreve o mês por extenso", () => {
    expect(formatMonth("2026-11")).toBe("novembro de 2026");
    expect(formatMonth("2026-03")).toBe("março de 2026");
  });
});
