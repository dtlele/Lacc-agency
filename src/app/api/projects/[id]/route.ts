import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { guard, json, readBody, toId } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

/** Ogni query filtra anche per user_id: un utente non può leggere o modificare i progetti di un altro. */
export const GET = (_req: Request, { params }: Ctx) =>
  guard(async () => {
    const s = await requireUser();
    const id = toId((await params).id);
    if (!id) return json({ error: "Non trovato" }, 404);
    const [p] = await q("SELECT id,name,rows,steps,done,thumb FROM projects WHERE id=$1 AND user_id=$2", [id, s.uid]);
    return p ? p : json({ error: "Non trovato" }, 404);
  });

export const PATCH = (req: Request, { params }: Ctx) =>
  guard(async () => {
    const s = await requireUser();
    const id = toId((await params).id);
    if (!id) return json({ error: "Non trovato" }, 404);
    const b = await readBody(req);
    const [p] = await q<{ n: number }>("SELECT jsonb_array_length(steps) AS n FROM projects WHERE id=$1 AND user_id=$2", [id, s.uid]);
    if (!p) return json({ error: "Non trovato" }, 404);
    if (Array.isArray(b.done)) {
      const done = [...new Set(b.done.filter((x: unknown) => Number.isInteger(x) && (x as number) >= 0 && (x as number) < p.n))];
      await q("UPDATE projects SET done=$1::jsonb, updated_at=now() WHERE id=$2 AND user_id=$3", [JSON.stringify(done), id, s.uid]);
    }
    if (typeof b.name === "string" && b.name.trim()) await q("UPDATE projects SET name=$1, updated_at=now() WHERE id=$2 AND user_id=$3", [b.name.trim().slice(0, 60), id, s.uid]);
    if (typeof b.category === "string") await q("UPDATE projects SET category=$1, updated_at=now() WHERE id=$2 AND user_id=$3", [b.category.trim().slice(0, 30), id, s.uid]);
    if (typeof b.difficulty === "string" && ["", "Facile", "Media", "Esperta"].includes(b.difficulty.trim().slice(0, 12))) await q("UPDATE projects SET difficulty=$1, updated_at=now() WHERE id=$2 AND user_id=$3", [b.difficulty.trim(), id, s.uid]);
    if (typeof b.color === "string" && ["", "Rosa", "Lilla", "Menta", "Giallo"].includes(b.color.trim().slice(0, 12))) await q("UPDATE projects SET color=$1, updated_at=now() WHERE id=$2 AND user_id=$3", [b.color.trim(), id, s.uid]);
    return { ok: true };
  });

export const DELETE = (_req: Request, { params }: Ctx) =>
  guard(async () => {
    const s = await requireUser();
    const id = toId((await params).id);
    if (!id) return json({ error: "Non trovato" }, 404);
    const gone = await q("DELETE FROM projects WHERE id=$1 AND user_id=$2 RETURNING id", [id, s.uid]);
    return gone.length ? { ok: true } : json({ error: "Non trovato" }, 404);
  });
