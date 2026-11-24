"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Step } from "@/lib/pattern";
import { StitchRow } from "./StitchSymbols";

type Props = {
  steps: Step[];
  done: number[];
  onToggle: (i: number) => void;
  onClose: () => void;
  storeKey: string; // per ricordare i contagiri di questo progetto
  videoId?: string; // se c'è, ogni passo può mostrare il video dal suo momento
  title?: string;
  glossary?: { term: string; meaning: string }[]; // abbreviazioni da spiegare accanto al passo
};

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const lsGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* nessuna memoria: pazienza */ } };

/** Voci del glossario che compaiono nel testo del passo (parola intera, senza distinguere maiuscole). */
export function termsIn(glossary: { term: string; meaning: string }[], text: string) {
  const hay = text.toLowerCase();
  return glossary.filter((g) => {
    const t = g.term.trim().toLowerCase();
    if (!t) return false;
    for (let from = hay.indexOf(t); from >= 0; from = hay.indexOf(t, from + 1)) {
      const before = hay[from - 1], after = hay[from + t.length];
      const isLetter = (c?: string) => !!c && c.toLowerCase() !== c.toUpperCase();
      if (!isLetter(before) && !isLetter(after)) return true;
    }
    return false;
  }).slice(0, 6);
}

/** Minuti citati nel testo del passo ("lavora per 10 minuti") -> proposta di timer. */
function minutesIn(text: string): number | null {
  const m = /(\d{1,3})\s*(?:minuti|minuto|min\b)/i.exec(text);
  const n = m ? Number(m[1]) : 0;
  return n >= 1 && n <= 180 ? n : null;
}

/** Modalità lavoro: un passo alla volta a schermo intero, testo grande, tasti enormi, contagiri, timer, voce e video dal momento giusto. */
export default function WorkMode({ steps, done, onToggle, onClose, storeKey, videoId, title, glossary = [] }: Props) {
  const first = steps.findIndex((_, i) => !done.includes(i));
  const [i, setI] = useState(first >= 0 ? first : 0);
  const [count, setCount] = useState(0);
  const [timer, setTimer] = useState<number | null>(null); // secondi rimasti
  const [videoPref, setVideoPref] = useState<boolean | null>(null); // null = automatico: si apre da solo se il passo ha il suo momento nel video
  const [replay, setReplay] = useState(0);
  const [readAloud, setReadAloud] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [awake, setAwake] = useState<"si" | "no" | "">("");
  const speakingRef = useRef(false);
  const recRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const wantListen = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const s = steps[i];
  const video = videoPref ?? s?.at !== undefined;
  const last = i === steps.length - 1;
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const SR = typeof window !== "undefined" ? ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition) : undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

  // contagiri: ricordato per progetto e passo
  useEffect(() => { setCount(Number(lsGet(`ff-n-${storeKey}-${i}`)) || 0); setTimer(null); }, [storeKey, i]);
  const bump = useCallback((d: number) => setCount((c) => { const n = Math.max(0, Math.min(9999, c + d)); lsSet(`ff-n-${storeKey}-${i}`, String(n)); return n; }), [storeKey, i]);

  // schermo sempre acceso
  useEffect(() => {
    let lock: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
    let off = false;
    const get = async () => {
      try { lock = await (navigator as any).wakeLock?.request("screen"); if (!off) setAwake(lock ? "si" : "no"); } catch { if (!off) setAwake("no"); } // eslint-disable-line @typescript-eslint/no-explicit-any
    };
    get();
    const vis = () => { if (document.visibilityState === "visible") get(); };
    document.addEventListener("visibilitychange", vis);
    return () => { off = true; document.removeEventListener("visibilitychange", vis); lock?.release?.().catch(() => undefined); };
  }, []);

  // blocca lo scorrimento della pagina sotto
  useEffect(() => { const o = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = o; }; }, []);

  const speak = useCallback((text: string) => {
    if (!canSpeak) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "it-IT";
    const v = speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith("it"));
    if (v) u.voice = v;
    speakingRef.current = true;
    const end = () => { speakingRef.current = false; };
    u.onend = end; u.onerror = end;
    speechSynthesis.speak(u);
  }, [canSpeak]);

  const read = useCallback(() => { if (s) speak(`${s.t}. ${s.s}`); }, [s, speak]);
  useEffect(() => { if (readAloud) read(); else if (canSpeak) speechSynthesis.cancel(); }, [i, readAloud]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel(); }, []);

  const next = useCallback(() => {
    if (!done.includes(i)) onToggle(i);
    if (i < steps.length - 1) setI(i + 1); else onClose();
  }, [i, done, onToggle, steps.length, onClose]);
  const back = useCallback(() => setI((v) => Math.max(0, v - 1)), []);

  // timer a ritroso
  useEffect(() => {
    if (timer === null || timer <= 0) return;
    const t = setTimeout(() => setTimer((v) => (v === null ? null : v - 1)), 1000);
    return () => clearTimeout(t);
  }, [timer]);
  useEffect(() => {
    if (timer !== 0) return;
    try { navigator.vibrate?.([300, 150, 300, 150, 600]); } catch { /* non supportato */ }
    try {
      const ctx = (ctxRef.current ??= new AudioContext());
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.frequency.value = 880; g.gain.value = 0.2;
      o.start(); o.stop(ctx.currentTime + 0.8);
    } catch { /* senza audio */ }
    speak("Il timer è finito.");
  }, [timer, speak]);

  // tastiera (tablet/PC)
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") back();
      else if (e.key === "+" || e.key === "ArrowUp") bump(1);
      else if (e.key === "-" || e.key === "ArrowDown") bump(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [next, back, bump, onClose]);

  // comandi vocali (riconoscimento del browser: l'audio non lascia il telefono per mano nostra)
  const handler = useRef<(t: string) => void>(() => undefined);
  handler.current = (t: string) => {
    const x = t.toLowerCase();
    setHeard(x);
    if (/\b(avanti|prossimo|successivo|fatto|finito)\b/.test(x)) next();
    else if (/\b(indietro|precedente|torna)\b/.test(x)) back();
    else if (/\b(ripeti|rileggi|ancora)\b/.test(x)) read();
    else if (/\b(più|piu|aggiungi|segna|uno)\b/.test(x)) bump(1);
    else if (/\b(meno|togli)\b/.test(x)) bump(-1);
    else if (/\btimer\b/.test(x)) { const m = minutesIn(x) ?? minutesIn(`${s?.s ?? ""}`); if (m) setTimer(m * 60); }
  };
  useEffect(() => {
    if (!listening || !SR) return;
    wantListen.current = true;
    const start = () => {
      if (!wantListen.current) return;
      const r = new SR();
      r.lang = "it-IT"; r.continuous = true; r.interimResults = false;
      r.onresult = (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (speakingRef.current) return; // non ascoltare la propria voce
        const res = e.results[e.results.length - 1];
        if (res?.isFinal) handler.current(String(res[0]?.transcript ?? ""));
      };
      r.onend = () => { if (wantListen.current) setTimeout(start, 250); };
      r.onerror = (e: any) => { if (e?.error === "not-allowed" || e?.error === "service-not-allowed") { wantListen.current = false; setListening(false); setHeard("Microfono non consentito"); } }; // eslint-disable-line @typescript-eslint/no-explicit-any
      recRef.current = r;
      try { r.start(); } catch { /* già avviato */ }
    };
    start();
    return () => { wantListen.current = false; try { recRef.current?.stop(); } catch { /* già fermo */ } };
  }, [listening, SR]);

  if (!s) return null;
  const suggested = minutesIn(s.s);
  const len = s.s.length;
  const bodySize = len < 110 ? "text-3xl leading-snug" : len < 260 ? "text-2xl leading-snug" : "text-xl leading-snug";
  const pct = Math.round(((i + 1) / steps.length) * 100);
  const chip = "min-h-12 rounded-full border-2 border-ink px-4 text-base font-bold focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rosa";

  return (
    <div role="dialog" aria-modal="true" aria-label="Modalità lavoro" className="fixed inset-0 z-50 flex flex-col bg-bg">
      <header className="flex items-center gap-3 border-b-2 border-ink px-4 py-2">
        <button type="button" onClick={onClose} className={`${chip} bg-white`}>Esci</button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{title || "Il tuo progetto"}</p>
          <div className="mt-1 h-3 overflow-hidden rounded-full border-2 border-ink bg-white" role="progressbar" aria-label="Avanzamento" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1}>
            <div className="h-full bg-rosa transition-[width]" style={{ width: pct + "%" }} />
          </div>
        </div>
        <p className="shrink-0 text-lg font-bold" aria-live="polite">{i + 1}/{steps.length}</p>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-4">
        <h1 className="mb-3 text-4xl leading-tight sm:text-5xl">{s.t}</h1>
        <p className={`${bodySize} whitespace-pre-line`}>{s.s}</p>

        <StitchRow text={`${s.t} ${s.s}`} />

        {glossary.length > 0 && (() => {
          const used = termsIn(glossary, `${s.t} ${s.s}`);
          return used.length ? (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Significato dei punti">
              {used.map((g) => <li key={g.term} className="rounded-2xl border-2 border-ink bg-menta px-3 py-1.5 text-base"><b>{g.term}</b> = {g.meaning}</li>)}
            </ul>
          ) : null;
        })()}

        {videoId && (
          <div className="mt-4">
            <button type="button" className={`${chip} bg-lilla`} aria-expanded={video} onClick={() => setVideoPref(!video)}>
              {video ? "Nascondi il video" : s.at !== undefined ? `Guarda questo passo nel video (${fmt(s.at)})` : "Guarda il video"}
            </button>
            {video && s.at !== undefined && <button type="button" className={`${chip} ml-2 bg-bg`} onClick={() => setReplay((n) => n + 1)}>Rivedi il pezzo</button>}
            {video && (
              <div className="mt-3 aspect-video overflow-hidden rounded-2xl border-2 border-ink">
                <iframe key={`${i}-${s.at ?? 0}-${replay}`} className="h-full w-full" title={`Video: ${s.t}`}
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?start=${s.at ?? 0}${s.end ? `&end=${s.end}` : ""}${s.at !== undefined ? "&autoplay=1&mute=1" : ""}&playsinline=1&rel=0`}
                  allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
              </div>
            )}
            {video && s.at !== undefined && s.end && <p className="mt-1 text-sm text-muted">Mostro solo questo passo ({fmt(s.at)}–{fmt(s.end)}). Tocca il video per il sonoro.</p>}
            {video && s.at === undefined && <p className="mt-1 text-sm text-muted">Per questo progetto non conosco il momento esatto: il video parte dall&apos;inizio.</p>}
          </div>
        )}
      </main>

      <section aria-label="Strumenti" className="border-t-2 border-ink bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2" role="group" aria-label="Contagiri">
            <button type="button" onClick={() => bump(-1)} aria-label="Togli uno" className="h-16 w-16 rounded-2xl border-2 border-ink bg-bg text-4xl font-bold active:bg-rosa-chiaro">−</button>
            <output className="min-w-[4.5rem] text-center font-display text-5xl" aria-live="polite" aria-label={`Contati: ${count}`}>{count}</output>
            <button type="button" onClick={() => bump(1)} aria-label="Aggiungi uno" className="h-16 w-16 rounded-2xl border-2 border-ink bg-rosa text-4xl font-bold text-white active:bg-accent">+</button>
          </div>
          <div className="text-right">
            {timer === null ? (
              <div className="flex flex-wrap justify-end gap-2">
                {suggested && <button type="button" className={`${chip} bg-menta`} onClick={() => setTimer(suggested * 60)}>Timer {suggested} min</button>}
                <button type="button" className={`${chip} bg-bg`} onClick={() => setTimer(300)}>5 min</button>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2" role="timer" aria-label="Timer">
                <span className={`font-display text-4xl ${timer === 0 ? "text-warn" : ""}`}>{timer === 0 ? "Finito!" : fmt(timer)}</span>
                <button type="button" className={`${chip} bg-bg`} onClick={() => setTimer(null)}>Stop</button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {canSpeak && <button type="button" className={`${chip} ${readAloud ? "bg-rosa text-white" : "bg-bg"}`} aria-pressed={readAloud} onClick={() => setReadAloud((v) => !v)}>Voce {readAloud ? "accesa" : "spenta"}</button>}
          {canSpeak && <button type="button" className={`${chip} bg-bg`} onClick={read}>Ripeti</button>}
          {SR && <button type="button" className={`${chip} ${listening ? "bg-rosa text-white" : "bg-bg"}`} aria-pressed={listening} onClick={() => { setHeard(""); setListening((v) => !v); }}>Comandi vocali {listening ? "accesi" : "spenti"}</button>}
        </div>
        <p className="mt-1 min-h-5 text-sm text-muted" role="status" aria-live="polite">
          {listening ? `Di’: avanti, indietro, ripeti, più, meno, timer.${heard ? ` Ho sentito: “${heard}”` : ""}` : awake === "no" ? "Lo schermo potrebbe spegnersi: questo browser non lo permette." : ""}
        </p>
      </section>

      <footer className="grid grid-cols-[1fr_2fr] gap-3 border-t-2 border-ink bg-bg p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={back} disabled={i === 0} className="min-h-24 rounded-3xl border-2 border-ink bg-white text-2xl font-bold disabled:opacity-40 active:bg-lilla">← Indietro</button>
        <button type="button" onClick={next} className="min-h-24 rounded-3xl border-2 border-ink bg-rosa text-3xl font-bold text-white active:bg-accent">{last ? "Finito ✓" : "Fatto · Avanti →"}</button>
      </footer>
    </div>
  );
}
