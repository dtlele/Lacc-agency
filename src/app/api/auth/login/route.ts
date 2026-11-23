import { q, ensureSchema } from "@/lib/db";
import { bootstrapAdmin, clientId, rateOk, setSession, verifyPassword } from "@/lib/auth";
import { guard, json, readBody } from "@/lib/http";

export const POST = (req: Request) =>
  guard(async () => {
    await ensureSchema();
    if (!(await rateOk("login", clientId(req), 10, 15))) return json({ error: "Troppi tentativi, riprova tra qualche minuto" }, 429);
    const { email, password } = await readBody(req);
    if (String(password ?? "").length > 200) return json({ error: "Credenziali errate" }, 401);
    await bootstrapAdmin();
    const [u] = await q<{ id: number; role: "admin" | "user"; name: string; pw_hash: string }>("SELECT id,role,name,pw_hash FROM users WHERE email=$1", [String(email ?? "").toLowerCase().trim()]);
    if (!u || !verifyPassword(String(password ?? ""), u.pw_hash)) return json({ error: "Credenziali errate" }, 401);
    await setSession({ uid: u.id, role: u.role, name: u.name });
    await q("UPDATE users SET last_seen_at=now() WHERE id=$1", [u.id]);
    return { ok: true };
  });
