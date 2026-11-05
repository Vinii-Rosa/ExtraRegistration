import { describe, expect, it } from "@jest/globals";
import {
  REFRESH_COOKIE,
  decodeJwt,
  isFresh,
  readRefreshCookie,
  readUser,
} from "@/lib/tokens";

function jwt(payload: object) {
  const part = (value: object) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${part({ alg: "HS256", typ: "JWT" })}.${part(payload)}.assinatura`;
}

const NOW = 1_800_000_000_000;
const inSeconds = (seconds: number) => Math.floor(NOW / 1000) + seconds;

describe("readRefreshCookie", () => {
  it("lê o refresh_token dos Set-Cookie da resposta", () => {
    const headers = new Headers();
    headers.append("set-cookie", "outro=1; Path=/");
    headers.append(
      "set-cookie",
      `${REFRESH_COOKIE}=abc.def.ghi; Path=/; HttpOnly; SameSite=Lax`,
    );
    expect(readRefreshCookie(headers)).toBe("abc.def.ghi");
  });

  it("devolve null sem o cookie", () => {
    const headers = new Headers();
    headers.append("set-cookie", "outro=1; Path=/");
    expect(readRefreshCookie(headers)).toBeNull();
    expect(readRefreshCookie(new Headers())).toBeNull();
  });

  it("devolve null quando o cookie vem vazio (logout)", () => {
    const headers = new Headers();
    headers.append("set-cookie", `${REFRESH_COOKIE}=; Max-Age=0; Path=/`);
    expect(readRefreshCookie(headers)).toBeNull();
  });

  it("não confunde com cookies de nome parecido", () => {
    const headers = new Headers();
    headers.append("set-cookie", `x_${REFRESH_COOKIE}=errado; Path=/`);
    expect(readRefreshCookie(headers)).toBeNull();
  });
});

describe("decodeJwt", () => {
  it("lê o payload", () => {
    expect(decodeJwt(jwt({ user_id: "u1", exp: 10 }))).toEqual({
      user_id: "u1",
      exp: 10,
    });
  });

  it("devolve null para token malformado", () => {
    expect(decodeJwt("sem-pontos")).toBeNull();
    expect(decodeJwt("a.!!!.c")).toBeNull();
    expect(decodeJwt("")).toBeNull();
  });
});

describe("readUser", () => {
  it("extrai user_id e email", () => {
    expect(readUser(jwt({ user_id: "u1", email: "a@b.com" }))).toEqual({
      userId: "u1",
      email: "a@b.com",
    });
  });

  it("devolve null se faltar user_id ou email", () => {
    expect(readUser(jwt({ email: "a@b.com" }))).toBeNull();
    expect(readUser(jwt({ user_id: "u1" }))).toBeNull();
    expect(readUser("lixo")).toBeNull();
  });
});

describe("isFresh", () => {
  it("é fresco quando falta mais de 30 s para expirar", () => {
    expect(isFresh(jwt({ exp: inSeconds(60) }), NOW)).toBe(true);
  });

  it("precisa renovar a menos de 30 s de expirar", () => {
    expect(isFresh(jwt({ exp: inSeconds(29) }), NOW)).toBe(false);
    expect(isFresh(jwt({ exp: inSeconds(30) }), NOW)).toBe(false);
  });

  it("token expirado, ausente ou sem exp não é fresco", () => {
    expect(isFresh(jwt({ exp: inSeconds(-10) }), NOW)).toBe(false);
    expect(isFresh(undefined, NOW)).toBe(false);
    expect(isFresh(jwt({ user_id: "u1" }), NOW)).toBe(false);
    expect(isFresh("lixo", NOW)).toBe(false);
  });
});
