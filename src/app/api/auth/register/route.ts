import { q, ensureSchema } from "@/lib/db";
import { bootstrapAdmin, clientId, hashPassword, rateOk, setSession } from "@/lib/auth";
import { guard, json, readBody } from "@/lib/http";

const DISPOSABLE = /(^|\.)(mailinator|guerrillamail|10minutemail|tempmail|temp-mail|yopmail|trashmail|sharklasers|getnada|dispostable|maildrop|throwaway|fakeinbox|mohmal|emailondeck)\./i;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

/** Registrazione con email e password. Anti-bot: limiti per rete e globali, honeypot, tempo minimo del modulo, codice invito opzionale. */
export const POST = (req: Request) =>
  guard(async () => {
    await ensureSchema();
    await bootstrapAdmin(); // se il database è vuoto, il primo account creato è sempre l'admin configurato
    if (!(await rateOk("register", clientId(req), 5, 60))) return json({ error: "Troppe registrazioni da questa rete, riprova più tardi" }, 429);
    if (!(await rateOk("register-global", "all", Number(process.env.REGISTER_DAY_GLOBAL) || 25, 1440))) return json({ error: "Registrazioni chiuse per oggi: riprova domani" }, 429);
    const b = await readBody(req);
    if (typeof b.website === "string" && b.website.trim().length > 0) return json({ error: "Richiesta non valida" }, 400);
    const t0 = Number(b.t0);
    if (Number.isFinite(t0) && t0 > 0 && Date.now() - t0 < 1200) return json({ error: "Attendi un istante e riprova" }, 429);
    if (process.env.REGISTRATION_CODE && String(b.code ?? "").trim() !== process.env.REGISTRATION_CODE) return json({ error: "Codice invito non valido" }, 403);
    const email = String(b.email ?? "").toLowerCase().trim();
    const password = String(b.password ?? "");
    const name = String(b.name ?? "").trim().slice(0, 60);
    if (!EMAIL.test(email)) return json({ error: "Email non valida" }, 400);
    if (password.length < 8) return json({ error: "La password deve avere almeno 8 caratteri" }, 400);
    if (password.length > 200) return json({ error: "Password troppo lunga (massimo 200 caratteri)" }, 400);
    if (DISPOSABLE.test(email.split("@")[1] ?? "")) return json({ error: "Usa un indirizzo email reale: le email temporanee non sono ammesse" }, 400);
    if (b.accept !== true) return json({ error: "Devi accettare termini e privacy" }, 400);
    const [ex] = await q("SELECT id FROM users WHERE email=$1", [email]);
    if (ex) return json({ error: "Esiste già un account con questa email: accedi" }, 409);
    let u: { id: number };
    try {
      [u] = await q<{ id: number }>("INSERT INTO users(email,name,role,pw_hash) VALUES($1,$2,'user',$3) RETURNING id", [email, name, hashPassword(password)]);
    } catch (e) {
      if (/unique|duplicate/i.test(String((e as Error)?.message))) return json({ error: "Esiste già un account con questa email: accedi" }, 409);
      throw e;
    }
    await setSession({ uid: u.id, role: "user", name });
    return { ok: true };
  });
