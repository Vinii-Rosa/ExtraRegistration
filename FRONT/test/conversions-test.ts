import { describe, expect, it } from "@jest/globals";
import { DEFAULT_LIMIT, parseExtrasQuery } from "@/lib/extras-query";
import { toApiBody, toApiDate } from "@/lib/routes/extra-hours";

describe("toApiDate", () => {
  it("converte YYYY-MM-DD (input date) para DD/MM/YYYY (API)", () => {
    expect(toApiDate("2026-11-04")).toBe("04/11/2026");
  });
});

describe("toApiBody", () => {
  it("converte a data e preserva os outros campos", () => {
    expect(
      toApiBody({
        project_id: "p1",
        date: "2026-11-04",
        start_time: "18:00",
        end_time: null,
      }),
    ).toEqual({
      project_id: "p1",
      date: "04/11/2026",
      start_time: "18:00",
      end_time: null,
    });
  });

  it("não inclui a data quando ela não é enviada (fechar e reabrir)", () => {
    const body = toApiBody({ end_time: "20:00" });
    expect(body).toEqual({ end_time: "20:00" });
    expect("date" in body).toBe(false);
  });

  it("reabrir envia end_time null", () => {
    expect(toApiBody({ end_time: null })).toEqual({ end_time: null });
  });
});

describe("parseExtrasQuery", () => {
  it("usa os padrões sem parâmetros", () => {
    expect(parseExtrasQuery({})).toEqual({
      page: 1,
      limit: DEFAULT_LIMIT,
      from: undefined,
      to: undefined,
      hour: undefined,
      total_value: undefined,
    });
  });

  it("lê os filtros da URL", () => {
    const query = parseExtrasQuery({
      page: "3",
      limit: "25",
      from: "2026-11-01",
      to: "2026-11-10",
      hour: "2",
      total_value: "120",
    });
    expect(query).toMatchObject({
      page: 3,
      limit: 25,
      from: "2026-11-01",
      to: "2026-11-10",
      hour: "2",
      total_value: "120",
    });
  });

  it("aceita só o início ou só o fim do intervalo", () => {
    expect(parseExtrasQuery({ from: "2026-11-05" })).toMatchObject({
      from: "2026-11-05",
      to: undefined,
    });
    expect(parseExtrasQuery({ to: "2026-11-05" })).toMatchObject({
      from: undefined,
      to: "2026-11-05",
    });
  });

  it("inverte o intervalo quando o início é depois do fim", () => {
    const query = parseExtrasQuery({ from: "2026-11-10", to: "2026-11-01" });
    expect(query.from).toBe("2026-11-01");
    expect(query.to).toBe("2026-11-10");
  });

  it("ignora datas inválidas", () => {
    const query = parseExtrasQuery({ from: "2026-02-31", to: "04/11/2026" });
    expect(query.from).toBeUndefined();
    expect(query.to).toBeUndefined();
  });

  it("não lê mais month nem date da URL", () => {
    const query = parseExtrasQuery({ month: "2026-11", date: "2026-11-04" });
    expect(query.from).toBeUndefined();
    expect(query.to).toBeUndefined();
    expect(query.month).toBeUndefined();
  });

  it("corrige page e limit inválidos", () => {
    expect(parseExtrasQuery({ page: "0" }).page).toBe(1);
    expect(parseExtrasQuery({ page: "-2" }).page).toBe(1);
    expect(parseExtrasQuery({ page: "abc" }).page).toBe(1);
    expect(parseExtrasQuery({ limit: "1.5" }).limit).toBe(DEFAULT_LIMIT);
  });

  it("limita o limit a 100", () => {
    expect(parseExtrasQuery({ limit: "500" }).limit).toBe(100);
  });

  it("descarta hour e total_value que não são inteiros", () => {
    const query = parseExtrasQuery({ hour: "1.5", total_value: "abc" });
    expect(query.hour).toBeUndefined();
    expect(query.total_value).toBeUndefined();
  });

  it("usa o primeiro valor quando o parâmetro se repete", () => {
    expect(parseExtrasQuery({ page: ["2", "5"] }).page).toBe(2);
  });
});
