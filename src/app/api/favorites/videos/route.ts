import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { guard, json, readBody } from "@/lib/http";

const MAX = 200;
const ID_RE = /^[A-Za-z0-9_-]{8,16}$/;

export const GET = () =>
  guard(async () => {
    const s = await requireUser();
    const items = await q("SELECT video_id AS id,title,channel,duration FROM video_favorites WHERE user_id=$1 ORDER BY created_at DESC LIMIT $2", [s.uid, MAX]);
    return { items };
  });

export const POST = (req: Request) =>
  guard(async () => {
    const s = await requireUser();
    const b = await readBody(req);
    const id = typeof b.id === "string" ? b.id : "";
    if (!ID_RE.test(id)) return json({ error: "Video non valido" }, 400);
    const title = String(b.title ?? "").trim().slice(0, 120);
    const channel = String(b.channel ?? "").trim().slice(0, 60);
    const duration = typeof b.duration === "number" && Number.isInteger(b.duration) && b.duration >= 0 && b.duration <= 2147483647 ? b.duration : null;
    const [{ n }] = await q<{ n: number }>("SELECT count(*)::int AS n FROM video_favorites WHERE user_id=$1", [s.uid]);
    if (n >= MAX) {
      const dup = await q("SELECT 1 FROM video_favorites WHERE user_id=$1 AND video_id=$2", [s.uid, id]);
      if (!dup.length) return json({ error: `Hai raggiunto il limite di ${MAX} video preferiti: toglierne qualcuno per aggiungerne altri.` }, 409);
    }
    await q("INSERT INTO video_favorites(user_id,video_id,title,channel,duration) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING", [s.uid, id, title, channel, duration]);
    return { ok: true };
  });

export const DELETE = (req: Request) =>
  guard(async () => {
    const s = await requireUser();
    const id = new URL(req.url).searchParams.get("id") ?? "";
    if (!ID_RE.test(id)) return json({ error: "Video non valido" }, 400);
    await q("DELETE FROM video_favorites WHERE user_id=$1 AND video_id=$2", [s.uid, id]);
    return { ok: true };
  });
