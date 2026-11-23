import { q } from "@/lib/db";
import { requireUser, rateOk, verifyPassword, hashPassword } from "@/lib/auth";
import { guard, json, readBody } from "@/lib/http";

export const POST = (req: Request) =>
  guard(async () => {
    const s = await requireUser();
    const b = await readBody(req);
    const cur = typeof b.current === "string" ? b.current : "";
    const next = typeof b.next === "string" ? b.next : "";
    if (!cur) return json({ error: "Scrivi la password attuale." }, 400);
    if (next.length < 8 || next.length > 200) return json({ error: "La nuova password deve avere da 8 a 200 caratteri." }, 400);
    if (!(await rateOk("pwchange", `u${s.uid}`, 5, 60))) return json({ error: "Troppi tentativi: riprova tra un'ora." }, 429);
    const [u] = await q<{ pw_hash: string }>("SELECT pw_hash FROM users WHERE id=$1", [s.uid]);
    if (!u || !verifyPassword(cur, u.pw_hash)) return json({ error: "La password attuale non è corretta." }, 403);
    if (cur === next) return json({ error: "La nuova password deve essere diversa da quella attuale." }, 400);
    await q("UPDATE users SET pw_hash=$1 WHERE id=$2", [hashPassword(next), s.uid]);
    return { ok: true };
  });
