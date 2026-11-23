import { q, ensureSchema } from "@/lib/db";
import { requireUser, rateOk } from "@/lib/auth";
import { guard, json } from "@/lib/http";

export const maxDuration = 60;

type Vid = { id: string; title: string; channel: string; duration: number | null; subs?: number | null; verified?: boolean };
const LEVELS = ["", "principianti", "intermedio", "esperte"];
const TOKEN = /^[A-Za-z0-9_-]{1,100}$/;

/** GET ?q=amigurumi&level=principianti&token=... -> una pagina di tutorial di uncinetto da YouTube (cache globale 30 giorni per pagina). */
export const GET = (req: Request) =>
  guard(async () => {
    const s = await requireUser();
    await ensureSchema();
    const u = new URL(req.url).searchParams;
    // niente caratteri di controllo, spazi ripuliti, massimo 80 caratteri
    const raw = (u.get("q") ?? "").replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
    const level = LEVELS.includes(u.get("level") ?? "") ? (u.get("level") ?? "") : "";
    const token = u.get("token") ?? "";
    if ((raw.match(/\p{L}/gu) ?? []).length < 2) return json({ error: "Scrivi almeno due lettere di cosa vuoi imparare" }, 400);
    if (token && !TOKEN.test(token)) return json({ error: "Pagina non valida" }, 400);

    const key = `${raw.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim()}|${level}|${token}|v5`; // v5: filtro di pertinenza e pagine
    const [hit] = await q<{ videos: { v?: Vid[]; n?: string | null } | Vid[] }>("SELECT videos FROM video_cache WHERE cache_key=$1 AND created_at > now() - interval '30 days'", [key]);
    if (hit) {
      if (Array.isArray(hit.videos)) return { videos: hit.videos, nextToken: null, cached: true };
      if (hit.videos?.v) return { videos: hit.videos.v, nextToken: hit.videos.n ?? null, cached: true };
    }

    // solo le ricerche nuove costano (100 unita' di quota YouTube l'una): limite per utente (admin escluso) e tetto globale
    if (s.role !== "admin") {
      if (!(await rateOk("video_user", `u${s.uid}`, Number(process.env.VIDEO_USER_DAY) || 20, 1440)))
        return json({ error: "Hai raggiunto il limite di pagine di risultati nuove per oggi: le pagine già viste restano disponibili, per le altre riprova domani." }, 429);
      if (!(await rateOk("video_global", "all", Number(process.env.VIDEO_GLOBAL_DAY) || 90, 1440)))
        return json({ error: "La ricerca video ha raggiunto il limite giornaliero di tutti gli utenti: le pagine già viste restano disponibili, per le altre riprova domani." }, 429);
    }
    const base = process.env.PY_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const r = await fetch(`${base}/api/py/yt?q=${encodeURIComponent(raw)}&level=${encodeURIComponent(level)}${token ? `&token=${encodeURIComponent(token)}` : ""}`, {
      headers: { "x-internal-key": process.env.INTERNAL_KEY || "" },
      signal: AbortSignal.timeout(50000),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) return json({ error: d.error || "Ricerca video non disponibile: riprova tra poco." }, 502);
    const videos: Vid[] = Array.isArray(d.videos) ? d.videos : [];
    const nextToken: string | null = typeof d.nextToken === "string" && TOKEN.test(d.nextToken) ? d.nextToken : null;
    if (videos.length || nextToken)
      await q(`INSERT INTO video_cache(cache_key, query, videos, created_at) VALUES($1,$2,$3::jsonb,now())
               ON CONFLICT (cache_key) DO UPDATE SET videos=EXCLUDED.videos, created_at=now()`, [key, raw, JSON.stringify({ v: videos, n: nextToken })]);
    return { videos, nextToken, cached: false, enrich_error: d.enrich_error ?? null };
  });
