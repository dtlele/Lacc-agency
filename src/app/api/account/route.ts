import { q } from "@/lib/db";
import { requireUser, rateOk, verifyPassword, clearSession } from "@/lib/auth";
import { guard, json, readBody } from "@/lib/http";

export const DELETE = (req: Request) =>
  guard(async () => {
    const s = await requireUser();
    const b = await readBody(req);
    const pw = typeof b.password === "string" ? b.password : "";
    if (!pw) return json({ error: "Scrivi la tua password per confermare." }, 400);
    if (!(await rateOk("pwchange", `u${s.uid}`, 5, 60))) return json({ error: "Troppi tentativi: riprova tra un'ora." }, 429);
    const [u] = await q<{ pw_hash: string }>("SELECT pw_hash FROM users WHERE id=$1", [s.uid]);
    if (!u || !verifyPassword(pw, u.pw_hash)) return json({ error: "La password non è corretta." }, 403);
    // un admin può uscire solo se ce n'è almeno un altro (controllo e cancellazione in una sola istruzione)
    const gone = await q(
      "DELETE FROM users WHERE id=$1 AND (role<>'admin' OR (SELECT count(*) FROM users WHERE role='admin')>1) RETURNING id", [s.uid]);
    if (!gone.length) return json({ error: "Sei l'unico amministratore: non puoi eliminare l'account." }, 409);
    await clearSession();
    return { ok: true };
  });
