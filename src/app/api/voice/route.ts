import { q, ensureSchema } from "@/lib/db";
import { requireUser, rateOk } from "@/lib/auth";
import { guard, json, readBody } from "@/lib/http";
import { normalizeVoiceText, voiceCacheKey } from "@/lib/voice";

export const maxDuration = 60;

/** Voce predefinita ElevenLabs ("Rachel", multilingue). Si cambia con ELEVENLABS_VOICE_ID. */
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";

/** GET -> { enabled }: dice se la voce di qualità è attiva, senza consumare quota. */
export const GET = () =>
  guard(async () => {
    await requireUser();
    return { enabled: !!process.env.ELEVENLABS_API_KEY };
  });

/** POST { text } -> audio mp3 (ElevenLabs), con cache nel database per 60 giorni. */
export const POST = (req: Request) =>
  guard(async () => {
    const s = await requireUser();
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) return json({ error: "Voce di qualità non attiva" }, 501);
    await ensureSchema();
    const text = normalizeVoiceText((await readBody(req)).text);
    if (text.length < 2) return json({ error: "Manca il testo da leggere" }, 400);

    const voiceId = (process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID).trim();
    const ck = voiceCacheKey(text, voiceId);
    const headers = { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=86400" };
    const [hit] = await q<{ b64: string }>("SELECT encode(audio,'base64') AS b64 FROM voice_cache WHERE cache_key=$1 AND created_at > now() - interval '60 days'", [ck]);
    if (hit?.b64) return new Response(new Uint8Array(Buffer.from(hit.b64, "base64")), { headers });

    // solo le frasi nuove costano: limite per utente (admin escluso) e tetto globale
    if (s.role !== "admin" && !(await rateOk("voice_user", `u${s.uid}`, Number(process.env.VOICE_USER_DAY) || 60, 1440)))
      return json({ error: "Hai raggiunto il limite di frasi lette di oggi: riprova domani." }, 429);
    if (!(await rateOk("voice_global", "all", Number(process.env.VOICE_GLOBAL_DAY) || 800, 1440)))
      return json({ error: "La voce ha raggiunto il limite giornaliero del servizio: riprova domani." }, 429);

    let r: Response;
    try {
      r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_64`, {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" }),
        signal: AbortSignal.timeout(30000),
      });
    } catch {
      return json({ error: "La voce ci mette troppo: riprova tra poco." }, 504);
    }
    if (!r.ok) {
      console.error("elevenlabs", r.status, (await r.text().catch(() => "")).slice(0, 200));
      return json({ error: r.status === 401 || r.status === 402 || r.status === 429 ? "Il servizio voce non è disponibile al momento." : "Non sono riuscita a creare la voce: riprova tra poco." }, 502);
    }
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 200) return json({ error: "Non sono riuscita a creare la voce: riprova tra poco." }, 502);
    await q(`INSERT INTO voice_cache(cache_key, audio, created_at) VALUES($1, decode($2,'base64'), now())
             ON CONFLICT (cache_key) DO UPDATE SET audio=EXCLUDED.audio, created_at=now()`, [ck, buf.toString("base64")]).catch(() => undefined);
    return new Response(new Uint8Array(buf), { headers });
  });
