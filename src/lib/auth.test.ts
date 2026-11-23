import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set() {}, delete() {} }),
}));
vi.mock("./db", () => ({
  q: async () => [],
  ensureSchema: async () => {},
}));

type AuthModule = typeof import("./auth");
let auth: AuthModule;

beforeAll(async () => {
  process.env.SESSION_SECRET = "0123456789abcdef0123456789abcdef"; // 32 caratteri
  auth = await import("./auth");
});

describe("hashPassword / verifyPassword", () => {
  it("round trip: la password giusta viene accettata", () => {
    const h = auth.hashPassword("segreta123");
    expect(auth.verifyPassword("segreta123", h)).toBe(true);
  });

  it("password sbagliata viene rifiutata", () => {
    const h = auth.hashPassword("segreta123");
    expect(auth.verifyPassword("altra456", h)).toBe(false);
  });

  it("due hash della stessa password sono diversi (salt casuale)", () => {
    expect(auth.hashPassword("stessa")).not.toBe(auth.hashPassword("stessa"));
  });

  it("stored malformato restituisce false", () => {
    expect(auth.verifyPassword("x", "")).toBe(false);
    expect(auth.verifyPassword("x", "soloSalt")).toBe(false);
    expect(auth.verifyPassword("x", ":")).toBe(false);
    expect(auth.verifyPassword("x", "salt:")).toBe(false);
    expect(auth.verifyPassword("x", ":hash")).toBe(false);
  });
});

describe("makeToken / readToken", () => {
  const base = { uid: 7, role: "user" as const, name: "Anna" };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-23T10:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("round trip: il token letto restituisce la sessione con exp", () => {
    const s = auth.readToken(auth.makeToken(base));
    expect(s).not.toBeNull();
    expect(s).toMatchObject(base);
    expect(s!.exp).toBeGreaterThan(Date.now());
  });

  it("token manomesso restituisce null", () => {
    const t = auth.makeToken(base);
    const [p, sig] = t.split(".");
    const forged = Buffer.from(JSON.stringify({ ...base, role: "admin", exp: Date.now() + 1e9 })).toString("base64url");
    expect(auth.readToken(`${forged}.${sig}`)).toBeNull();
    expect(auth.readToken(`${p}.${sig.slice(0, -2)}xx`)).toBeNull();
  });

  it("token scaduto restituisce null", () => {
    const t = auth.makeToken(base);
    vi.setSystemTime(new Date("2026-12-30T10:00:00Z")); // oltre 30 giorni
    expect(auth.readToken(t)).toBeNull();
  });

  it("token senza punto restituisce null", () => {
    expect(auth.readToken("senzapunto")).toBeNull();
    expect(auth.readToken("")).toBeNull();
    expect(auth.readToken(undefined)).toBeNull();
  });
});
