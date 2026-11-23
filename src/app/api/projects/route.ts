import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { guard, json, readBody } from "@/lib/http";
import { cleanRows, cleanSteps } from "@/lib/pattern";

const MAX_PER_USER = 50;

export const GET = () =>
  guard(async () => {
    const s = await requireUser();
    const items = await q("SELECT id,name,thumb,jsonb_array_length(steps) AS n_steps,jsonb_array_length(done) AS n_done,updated_at FROM projects WHERE user_id=$1 ORDER BY updated_at DESC", [s.uid]);
    return { items };
  });

export const POST = (req: Request) =>
  guard(async () => {
    const s = await requireUser();
    const b = await readBody(req);
    const rows = cleanRows(b.rows);
    if (!rows) return json({ error: "Schema non valido" }, 400);
    const steps = cleanSteps(b.steps, rows.length);
    if (steps.length < 2) return json({ error: "Servono almeno due passi" }, 400);
    const name = String(b.name ?? "").trim().slice(0, 60) || "Il mio progetto";
    const thumb = typeof b.thumb === "string" && b.thumb.startsWith("data:image/jpeg;base64,") && b.thumb.length < 250000 ? b.thumb : null;
    const [{ n }] = await q<{ n: number }>("SELECT count(*)::int AS n FROM projects WHERE user_id=$1", [s.uid]);
    if (n >= MAX_PER_USER) return json({ error: `Hai raggiunto il limite di ${MAX_PER_USER} progetti: eliminane uno per salvarne un altro.` }, 409);
    const [p] = await q<{ id: number }>("INSERT INTO projects(user_id,name,rows,steps,thumb) VALUES($1,$2,$3::jsonb,$4::jsonb,$5) RETURNING id", [s.uid, name, JSON.stringify(rows), JSON.stringify(steps), thumb]);
    return { id: p.id };
  });
