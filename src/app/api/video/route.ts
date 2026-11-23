import { q, ensureSchema } from "@/lib/db";
import { requireUser, rateOk } from "@/lib/auth";
import { guard, json } from "@/lib/http";

export const maxDuration = 60;

type Vid = { id: string; title: string; channel: string; duration: number | null; subs?: number | null; verified?: boolean };
const LEVELS = ["", "principianti", "intermedio", "esperte"];

/** GET ?q=amigurumi&level=principianti -> tutorial di uncinetto da YouTube (motore Python yt-dlp, cache globale 30 giorni). */
export const GET = (req: Request) =>
  guard(async () => {
    const s = await requireUser();
    await ensureSchema();
    const u = new URL(req.url).searchParams;
    const raw = (u.get("q") ?? "").trim().slice(0, 80);
    const level = LEVELS.includes(u.get("level") ?? "") ? (u.get("level") ?? "") : "";
    if (raw.length < 2) return json({ error: "Scrivi cosa vuoi imparare" }, 400);

    const key = `${raw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim()}|${level}|v2`; // v2: risultati con segnali del canale
    const [hit] = await q<{ videos: Vid[] }>("SELECT videos FROM video_cache WHERE cache_key=$1 AND created_at > now() - interval '30 days'", [key]);
    if (hit?.videos?.length) return { videos: hit.videos, cached: true };

    // solo le ricerche nuove costano: limite per utente (admin escluso) e tetto globale
    if (s.role !== "admin") {
      if (!(await rateOk("video_user", `u${s.uid}`, Number(process.env.VIDEO_USER_DAY) || 40, 1440)))
        return json({ error: "Hai raggiunto il limite di ricerche di oggi: riprova domani." }, 429);
      if (!(await rateOk("video_global", "all", Number(process.env.VIDEO_GLOBAL_DAY) || 500, 1440)))
        return json({ error: "La ricerca video ha raggiunto il limite giornaliero: riprova domani." }, 429);
    }
    const base = process.env.PY_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const r = await fetch(`${base}/api/py/yt?q=${encodeURIComponent(raw)}&level=${encodeURIComponent(level)}`, {
      headers: { "x-internal-key": process.env.INTERNAL_KEY || "" },
      signal: AbortSignal.timeout(50000),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: d.error || "Ricerca video non disponibile: riprova tra poco." }, 502);
    const videos: Vid[] = Array.isArray(d.videos) ? d.videos : [];
    if (videos.length)
      await q(`INSERT INTO video_cache(cache_key, query, videos, created_at) VALUES($1,$2,$3::jsonb,now())
               ON CONFLICT (cache_key) DO UPDATE SET videos=EXCLUDED.videos, created_at=now()`, [key, raw, JSON.stringify(videos)]);
    return { videos, cached: false };
  });
