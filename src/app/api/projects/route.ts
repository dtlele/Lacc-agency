import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { guard, json, readBody } from "@/lib/http";
import { cleanRows, cleanSteps } from "@/lib/pattern";
import { cleanGuide } from "@/lib/guide";

const MAX_PER_USER = 50;

export const GET = () =>
  guard(async () => {
    const s = await requireUser();
    const items = await q("SELECT id,name,thumb,kind,category,difficulty,color,jsonb_array_length(steps) AS n_steps,jsonb_array_length(done) AS n_done,updated_at FROM projects WHERE user_id=$1 ORDER BY updated_at DESC", [s.uid]);
    return { items };
  });

export const POST = (req: Request) =>
  guard(async () => {
    const s = await requireUser();
    const b = await readBody(req);
    const kind = b.kind === "rounds" ? "rounds" : b.kind === "guide" ? "guide" : "grid";
    const rows = kind === "grid" ? cleanRows(b.rows) : [];
    if (!rows) return json({ error: "Schema non valido" }, 400);
    let meta: Record<string, unknown> = {};
    let guideSteps: unknown = null;
    if (kind === "guide") {
      const g = cleanGuide(b.meta, b.steps);
      if (!g) return json({ error: "Scheda non valida" }, 400);
      meta = g.meta; guideSteps = g.steps;
    }
    if (kind === "rounds") {
      const m = b.meta as { shape?: unknown; size?: unknown; rounds?: unknown } | undefined;
      const rounds = Array.isArray(m?.rounds) ? m.rounds.slice(0, 80).map(Number) : [];
      if (rounds.length < 2 || rounds.some((n) => !Number.isInteger(n) || n < 1 || n > 400)) return json({ error: "Giri non validi" }, 400);
      meta = { shape: String(m?.shape ?? "").slice(0, 20), size: Math.min(400, Math.max(1, Number(m?.size) || 0)), rounds };
    }
    const steps = kind === "guide" ? (guideSteps as { t: string; s: string; r: number[] }[]) : cleanSteps(b.steps, kind === "rounds" ? 80 : rows.length);
    const pick = (v: unknown, max = 30) => String(v ?? "").trim().slice(0, max);
    if (steps.length < 2) return json({ error: "Servono almeno due passi" }, 400);
    const name = String(b.name ?? "").trim().slice(0, 60) || "Il mio progetto";
    const thumb = typeof b.thumb === "string" && b.thumb.startsWith("data:image/jpeg;base64,") && b.thumb.length < 250000 ? b.thumb : null;
    const [{ n }] = await q<{ n: number }>("SELECT count(*)::int AS n FROM projects WHERE user_id=$1", [s.uid]);
    if (n >= MAX_PER_USER) return json({ error: `Hai raggiunto il limite di ${MAX_PER_USER} progetti: eliminane uno per salvarne un altro.` }, 409);
    const [p] = await q<{ id: number }>("INSERT INTO projects(user_id,name,rows,steps,thumb,kind,meta,category,difficulty,color) VALUES($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7::jsonb,$8,$9,$10) RETURNING id",
      [s.uid, name, JSON.stringify(rows), JSON.stringify(steps), thumb, kind, JSON.stringify(meta), pick(b.category), pick(b.difficulty, 12), pick(b.color, 12)]);
    return { id: p.id };
  });
