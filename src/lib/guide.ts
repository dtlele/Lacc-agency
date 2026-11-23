import type { Step } from "@/lib/pattern";

/** Scheda di progetto ricavata da un video (kind 'guide'). Salvata in projects.meta; i passi stanno in projects.steps. */
export type GuideMeta = {
  videoId: string;
  videoTitle: string;
  channel: string;
  lang: string; // lingua della scheda (it, en, es, fr, de, pt)
  summary: string;
  difficulty: string; // Facile | Media | Esperta | ""
  timeNeeded: string; // es. "2 ore"
  materials: string[]; // filato, uncinetto, occhi di sicurezza...
  glossary: { term: string; meaning: string }[]; // abbreviazioni e punti usati
  tips: string[];
};
export const GUIDE_LANGS = ["it", "en", "es", "fr", "de", "pt"] as const;
export const pickLang = (l: unknown) => (GUIDE_LANGS as readonly string[]).includes(String(l)) ? String(l) : "it";

const str = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const list = (v: unknown, n: number, max: number) => (Array.isArray(v) ? v : []).map((x) => str(x, max)).filter(Boolean).slice(0, n);
export const VIDEO_ID = /^[A-Za-z0-9_-]{8,16}$/;

/** Ripulisce meta e passi di una scheda (dal client o dall'AI): lunghezze massime e tipi. Restituisce null se non è utilizzabile. */
export function cleanGuide(meta: unknown, steps: unknown): { meta: GuideMeta; steps: Step[] } | null {
  const m = (meta ?? {}) as Record<string, unknown>;
  if (!VIDEO_ID.test(String(m.videoId ?? ""))) return null;
  const st = (Array.isArray(steps) ? steps : []).slice(0, 40).map((p: any) => ({ t: str(p?.t, 80), s: str(p?.s, 400), r: [] as number[] })).filter((p) => p.t); // eslint-disable-line @typescript-eslint/no-explicit-any
  if (st.length < 2) return null;
  const difficulty = ["Facile", "Media", "Esperta"].includes(String(m.difficulty)) ? String(m.difficulty) : "";
  return {
    steps: st,
    meta: {
      videoId: String(m.videoId), videoTitle: str(m.videoTitle, 120), channel: str(m.channel, 60), lang: pickLang(m.lang),
      summary: str(m.summary, 600), difficulty, timeNeeded: str(m.timeNeeded, 40),
      materials: list(m.materials, 20, 120),
      glossary: (Array.isArray(m.glossary) ? m.glossary : []).slice(0, 30).map((g: any) => ({ term: str(g?.term, 40), meaning: str(g?.meaning, 200) })).filter((g) => g.term && g.meaning), // eslint-disable-line @typescript-eslint/no-explicit-any
      tips: list(m.tips, 12, 240),
    },
  };
}
