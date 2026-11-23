import { describe, it, expect, vi } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: {
    json: (d: unknown, init?: { status?: number }) =>
      new Response(JSON.stringify(d), {
        status: init?.status ?? 200,
        headers: { "content-type": "application/json" },
      }),
  },
}));

import { toId, readBody } from "./http";

describe("toId", () => {
  it("accetta interi positivi", () => {
    expect(toId(1)).toBe(1);
    expect(toId(42)).toBe(42);
    expect(toId(2147483647)).toBe(2147483647);
  });

  it("accetta stringhe numeriche valide", () => {
    expect(toId("7")).toBe(7);
    expect(toId(" 12 ")).toBe(12);
  });

  it("rifiuta 0 e negativi", () => {
    expect(toId(0)).toBeNull();
    expect(toId(-3)).toBeNull();
    expect(toId("0")).toBeNull();
  });

  it("rifiuta decimali", () => {
    expect(toId(1.5)).toBeNull();
    expect(toId("2.5")).toBeNull();
  });

  it("rifiuta valori oltre INT di Postgres", () => {
    expect(toId(2147483648)).toBeNull();
    expect(toId("99999999999")).toBeNull();
  });

  it("rifiuta null e valori non numerici", () => {
    expect(toId(null)).toBeNull();
    expect(toId(undefined)).toBeNull();
    expect(toId("")).toBeNull();
    expect(toId("   ")).toBeNull();
    expect(toId("abc")).toBeNull();
  });
});

describe("readBody", () => {
  const post = (body?: string) => new Request("http://x", { method: "POST", body });

  it("corpo vuoto restituisce {}", async () => {
    expect(await readBody(post())).toEqual({});
    expect(await readBody(post("   "))).toEqual({});
  });

  it("JSON oggetto viene restituito così com'è", async () => {
    expect(await readBody(post('{"a":1,"b":"x"}'))).toEqual({ a: 1, b: "x" });
  });

  it("JSON array, null, numero e stringa restituiscono {}", async () => {
    expect(await readBody(post("[1,2]"))).toEqual({});
    expect(await readBody(post("null"))).toEqual({});
    expect(await readBody(post("42"))).toEqual({});
    expect(await readBody(post('"ciao"'))).toEqual({});
  });

  it("JSON rotto lancia una Response con status 400", async () => {
    let thrown: unknown;
    try {
      await readBody(post("{non json"));
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(400);
  });
});
