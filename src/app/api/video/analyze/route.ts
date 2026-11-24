import { q, ensureSchema } from "@/lib/db";
import { requireUser, rateOk, rateRefund, aiGate } from "@/lib/auth";
import { guard, json, readBody } from "@/lib/http";
import { llm, MODEL_VISION } from "@/lib/llm";
import { cleanGuide, pickLang, VIDEO_ID } from "@/lib/guide";

export const maxDuration = 60;

const LANG_NAMES: Record<string, string> = { it: "italiano", en: "English", es: "español", fr: "français", de: "Deutsch", pt: "português" };
type Result = { meta: unknown; steps: unknown; name: string };

/** Estrae il primo oggetto JSON dalla risposta (il modello a volte aggiunge recinti ```). */
function parseJson(text: string): Record<string, any> | null { // eslint-disable-line @typescript-eslint/no-explicit-any
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  try { const v = JSON.parse(text.slice(a, b + 1)); return v && typeof v === "object" ? v : null; } catch { return null; }
}

/** Titolo, canale e durata (secondi) dalla YouTube Data API; null se non disponibili. */
async function videoInfo(id: string): Promise<{ title: string; channel: string; duration: number } | null> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(id)}&key=${encodeURIComponent(key)}`, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) return null;
    const it = (await r.json()).items?.[0];
    const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(it?.contentDetails?.duration ?? "");
    if (!it || !m) return null;
    const [d, h, mi, se] = [m[1], m[2], m[3], m[4]].map((x) => Number(x ?? 0));
    return { title: String(it.snippet?.title ?? "").slice(0, 120), channel: String(it.snippet?.channelTitle ?? "").slice(0, 60), duration: d * 86400 + h * 3600 + mi * 60 + se };
  } catch { return null; }
}

/** POST {videoId,title,channel,duration,lang,confirm:2} -> scheda del progetto ricavata dal video (Gemini guarda ~1 fotogramma/s e ascolta l'audio). */
export const POST = (req: Request) =>
  guard(async () => {
    const s = await requireUser();
    await ensureSchema();
    const b = await readBody(req);
    if (b.confirm !== 2) return json({ error: "Serve la doppia conferma prima di analizzare il video." }, 400);
    const videoId = String(b.videoId ?? "");
    if (!VIDEO_ID.test(videoId)) return json({ error: "Video non valido" }, 400);
    const lang = pickLang(b.lang);
    // titolo, canale e durata si leggono dalla API ufficiale di YouTube, mai dal browser (la durata decide il costo dell'analisi)
    const info = await videoInfo(videoId);
    if (!info) return json({ error: "Non riesco a verificare questo video: riprova tra poco." }, 502);
    if (info.duration > 2400) return json({ error: "Il video è troppo lungo: massimo 40 minuti" }, 400);
    if (info.duration < 120) return json({ error: "Il video è troppo corto per ricavarne una scheda: minimo 2 minuti" }, 400);
    const title = info.title, channel = info.channel;

    // cache: un'analisi già fatta non costa e non conta nei limiti
    const key = `${videoId}|${lang}|v3`; // v3: i passi hanno inizio e fine nel video
    const [hit] = await q<{ data: Result }>("SELECT data FROM video_analysis WHERE cache_key=$1 AND created_at > now() - interval '30 days'", [key]);
    if (hit?.data) return { ...hit.data, cached: true };

    // Limiti: rateOk registra l'evento subito; se l'analisi poi fallisce il credito viene restituito con rateRefund.
    if (s.role !== "admin") {
      await aiGate(s);
      if (!(await rateOk("analyze_user", `u${s.uid}`, Number(process.env.ANALYZE_USER_DAY) || 3, 1440)))
        return json({ error: "Hai finito le analisi di oggi: riprova domani." }, 429);
      if (!(await rateOk("analyze_global", "all", Number(process.env.ANALYZE_GLOBAL_DAY) || 30, 1440)))
        return json({ error: "L'analisi dei video ha raggiunto il limite giornaliero del servizio: riprova domani." }, 429);
    }

    const prompt = `Guarda questo video di uncinetto (immagini e voce) e crea la scheda informativa del progetto. Scrivi TUTTI i testi in ${LANG_NAMES[lang]}.
Rispondi SOLO con JSON valido, senza altro testo, in questa forma:
{"nome":"","riassunto":"","difficolta":"Facile|Media|Esperta","tempo":"","materiali":[""],"glossario":[{"termine":"","significato":""}],"passi":[{"titolo":"","istruzione":"","inizio_sec":0,"fine_sec":0}],"consigli":[""]}
Regole: i passi sono in ordine, da 6 a 25, con istruzioni concrete (numero di maglie, giri, misura dell'uncinetto e filato se mostrati o detti nel video). "inizio_sec" e "fine_sec" sono i secondi del video (numeri interi) in cui quel passo comincia e finisce di essere mostrato: servono a far vedere solo quel pezzo di video; scegli l'inizio un attimo prima del gesto; se non sei sicuro metti 0. Il titolo di ogni passo è breve (massimo 6 parole) e l'istruzione si capisce a colpo d'occhio. Il glossario spiega abbreviazioni e punti usati. Non inventare nulla: se un dato non c'è nel video, lascialo vuoto. "difficolta" può essere solo Facile, Media o Esperta (o vuoto). Non usare i nomi delle difficoltà tradotti.`;
    const refund = async () => { if (s.role !== "admin") { await rateRefund("analyze_user", `u${s.uid}`); await rateRefund("analyze_global", "all"); } };
    // Un errore passeggero del servizio AI (429/5xx, rete) faceva fallire l'analisi senza lasciare traccia:
    // ora si riprova una volta sola, se resta tempo prima del limite della funzione (60 s), e l'errore vero finisce nei log.
    const started = Date.now();
    const askAI = (timeoutMs: number) => llm(process.env.LLM_MODEL_VIDEO || MODEL_VISION(), [{
      role: "user",
      content: [{ type: "text", text: prompt }, { type: "video_url", video_url: { url: `https://www.youtube.com/watch?v=${videoId}` } }],
    }], { json: true, max: 4000, timeoutMs });
    let text = "";
    try {
      text = await askAI(50000);
    } catch (e1) {
      const left = 56000 - (Date.now() - started);
      console.error(`[analyze] 1° tentativo fallito per ${videoId} dopo ${Date.now() - started} ms:`, e1 instanceof Error ? e1.message : e1);
      if (left < 15000) {
        await refund();
        return json({ error: "Il servizio di analisi non ha risposto in tempo: riprova tra poco." }, 504);
      }
      try {
        text = await askAI(left);
      } catch (e2) {
        console.error(`[analyze] 2° tentativo fallito per ${videoId}:`, e2 instanceof Error ? e2.message : e2);
        await refund();
        return json({ error: "Non sono riuscita ad analizzare il video in questo momento: riprova tra poco (l'analisi non ti è stata addebitata)." }, 502);
      }
    }
    const j = parseJson(text);
    const bad = async () => { await refund(); return json({ error: "Non sono riuscita a ricavare i passi da questo video: potrebbe non essere un tutorial" }, 502); };
    if (!j) return await bad();
    const g = cleanGuide({
      videoId, videoTitle: title, channel, lang, summary: j.riassunto, difficulty: j.difficolta, timeNeeded: j.tempo,
      materials: j.materiali, glossary: (Array.isArray(j.glossario) ? j.glossario : []).map((x: any) => ({ term: x?.termine, meaning: x?.significato })), // eslint-disable-line @typescript-eslint/no-explicit-any
      tips: j.consigli,
    }, (Array.isArray(j.passi) ? j.passi : []).map((p: any) => ({ t: p?.titolo, s: p?.istruzione, at: p?.inizio_sec, end: p?.fine_sec }))); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!g) return await bad();
    const name = String(j.nome ?? "").replace(/\s+/g, " ").trim().slice(0, 60) || title.slice(0, 60) || "Progetto da video";
    const out: Result = { meta: g.meta, steps: g.steps, name };
    await q(`INSERT INTO video_analysis(cache_key,data,created_at) VALUES($1,$2::jsonb,now())
             ON CONFLICT (cache_key) DO UPDATE SET data=EXCLUDED.data, created_at=now()`, [key, JSON.stringify(out)]);
    return { ...out, cached: false };
  });
