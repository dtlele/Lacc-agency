import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { q, ensureSchema } from "./db";

export type Session = { uid: number; role: "admin" | "user"; name: string; exp: number };
const COOKIE = "sid";
const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET mancante");
  return s;
};

export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
}
export function verifyPassword(pw: string, stored: string) {
  const [salt, h] = stored.split(":");
  if (!salt || !h) return false;
  const a = Buffer.from(h, "hex"), b = scryptSync(pw, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}
const sign = (p: string) => createHmac("sha256", secret()).update(p).digest("base64url");
export function makeToken(s: Omit<Session, "exp">) {
  const p = Buffer.from(JSON.stringify({ ...s, exp: Date.now() + 30 * 864e5 })).toString("base64url");
  return `${p}.${sign(p)}`;
}
export function readToken(t?: string): Session | null {
  if (!t) return null;
  const [p, sig] = t.split(".");
  if (!p || !sig) return null;
  const want = Buffer.from(sign(p)), got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const s = JSON.parse(Buffer.from(p, "base64url").toString()) as Session;
    return s.exp > Date.now() ? s : null;
  } catch { return null; }
}
export async function getSession() { return readToken((await cookies()).get(COOKIE)?.value); }
export async function setSession(s: Omit<Session, "exp">) {
  (await cookies()).set(COOKIE, makeToken(s), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 30 * 86400,
  });
}
export async function clearSession() { (await cookies()).delete(COOKIE); }

/** crea l'admin iniziale da ADMIN_EMAIL/ADMIN_PASSWORD se non esiste nessun utente */
export async function bootstrapAdmin() {
  await ensureSchema();
  const [{ n }] = await q<{ n: number }>("SELECT count(*)::int AS n FROM users");
  const email = process.env.ADMIN_EMAIL, pw = process.env.ADMIN_PASSWORD;
  if (n === 0 && email && pw)
    await q("INSERT INTO users(email,name,role,pw_hash) VALUES($1,'Admin','admin',$2)", [email.toLowerCase(), hashPassword(pw)]);
}
/** Utente autorizzato: il ruolo si legge dal database, non dal cookie (un account cancellato smette subito di valere). */
export async function requireUser(admin = false): Promise<Session> {
  const s = await getSession();
  if (!s) throw new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  await ensureSchema();
  const [u] = await q<{ role: "admin" | "user"; name: string }>("SELECT role,name FROM users WHERE id=$1", [s.uid]);
  if (!u) throw new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  if (admin && u.role !== "admin") throw new Response(JSON.stringify({ error: "forbidden" }), { status: 403 });
  return { ...s, role: u.role, name: u.name };
}
export async function optionalUser(): Promise<Session | null> {
  try { return await requireUser(); } catch { return null; }
}

/** limite di richieste persistente (per IP/utente): true = consentito */
export async function rateOk(kind: string, who: string, max: number, windowMin: number): Promise<boolean> {
  const [{ n }] = await q<{ n: number }>("SELECT count(*)::int AS n FROM rate_events WHERE kind=$1 AND who=$2 AND at > now() - ($3 || ' minutes')::interval", [kind, who, String(windowMin)]);
  if (n >= max) return false;
  await q("INSERT INTO rate_events(kind,who) VALUES($1,$2)", [kind, who]);
  await q("DELETE FROM rate_events WHERE at < now() - interval '2 days'").catch(() => undefined);
  return true;
}
/** Restituisce un credito consumato con rateOk (es. quando l'operazione costosa poi fallisce): toglie l'evento più recente. */
export async function rateRefund(kind: string, who: string): Promise<void> {
  await q("DELETE FROM rate_events WHERE id=(SELECT id FROM rate_events WHERE kind=$1 AND who=$2 ORDER BY id DESC LIMIT 1)", [kind, who]).catch(() => undefined);
}
/** Guardia anti-abuso per le funzioni che consumano credito AI: tetto globale, tetto per utente, account nuovi in attesa. */
export async function aiGate(s: Session) {
  if (s.role === "admin") return;
  const [u] = await q<{ age_min: number }>("SELECT EXTRACT(EPOCH FROM now()-created_at)/60 AS age_min FROM users WHERE id=$1", [s.uid]);
  if (u && Number(u.age_min) < 2) throw new Response(JSON.stringify({ error: "Account appena creato: l'assistente si attiva tra un paio di minuti." }), { status: 403 });
  if (!(await rateOk("ai_global", "all", Number(process.env.AI_GLOBAL_DAY) || 300, 1440)))
    throw new Response(JSON.stringify({ error: "L'assistente ha raggiunto il limite giornaliero del servizio: riprova domani." }), { status: 429 });
  const perUser = Number(process.env.AI_USER_DAY) || 30;
  if (!(await rateOk("ai_user", `u${s.uid}`, perUser, 1440)))
    throw new Response(JSON.stringify({ error: `Hai raggiunto il limite giornaliero di ${perUser} richieste: riprova domani.` }), { status: 429 });
}
export const clientId = (req: Request) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "x";
  return createHmac("sha256", secret()).update(ip).digest("hex").slice(0, 24); // IP non memorizzato in chiaro
};
