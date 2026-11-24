"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Step } from "@/lib/pattern";
import { StitchRow, stitchesIn } from "./StitchSymbols";

type Props = {
  steps: Step[];
  done: number[];
  onToggle: (i: number) => void;
  onClose: () => void;
  storeKey: string; // per ricordare i contagiri di questo progetto
  videoId?: string; // se c'è, ogni passo può mostrare il suo pezzo di video
  title?: string;
  glossary?: { term: string; meaning: string }[]; // abbreviazioni da spiegare accanto al passo
};

const fmt = (s: number) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s)) % 60).padStart(2, "0")}`;
const lsGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* nessuna memoria: pazienza */ } };

const isLetter = (c?: string) => !!c && c.toLowerCase() !== c.toUpperCase();
/** Voci del glossario che compaiono nel testo del passo (parola intera, senza distinguere maiuscole). */
export function termsIn(glossary: { term: string; meaning: string }[], text: string) {
  const hay = text.toLowerCase();
  return glossary.filter((g) => {
    const t = g.term.trim().toLowerCase();
    if (!t) return false;
    for (let from = hay.indexOf(t); from >= 0; from = hay.indexOf(t, from + 1)) {
      if (!isLetter(hay[from - 1]) && !isLetter(hay[from + t.length])) return true;
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

// ---- comandi vocali ----
const NUMS: Record<string, number> = { un: 1, uno: 1, una: 1, due: 2, tre: 3, quattro: 4, cinque: 5, sei: 6, sette: 7, otto: 8, nove: 9, dieci: 10, undici: 11, dodici: 12, tredici: 13, quattordici: 14, quindici: 15, sedici: 16, diciassette: 17, diciotto: 18, diciannove: 19, venti: 20, trenta: 30, quaranta: 40, cinquanta: 50, sessanta: 60 };
const NUM = "\\d+|" + Object.keys(NUMS).sort((a, b) => b.length - a.length).join("|");
const toNum = (w: string) => (/^\d+$/.test(w) ? Number(w) : NUMS[w]);
/** minuscolo, senza accenti né punteggiatura: "Più lento!" -> "piu lento" */
export const flat = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9: ]+/g, " ").replace(/\s+/g, " ").trim();

export type Cmd =
  | { k: "next" } | { k: "back" } | { k: "read" } | { k: "goto"; n: number }
  | { k: "count"; d: number } | { k: "reset" }
  | { k: "timer"; min?: number } | { k: "timerStop" }
  | { k: "vShow" } | { k: "vHide" } | { k: "vReplay" } | { k: "vPause" } | { k: "vPlay" } | { k: "vBig"; on: boolean }
  | { k: "vSeek"; rel?: number; abs?: number } | { k: "vRate"; r: number } | { k: "vSound"; on: boolean };

/** Frase detta a voce -> comando. Restituisce null se non si capisce (nessuna azione a caso). */
export function parseCommand(raw: string): Cmd | null {
  const x = flat(raw);
  if (!x) return null;
  const timerWord = /\b(timer|cronometro|sveglia)\b/.test(x);
  let m: RegExpExecArray | null;
  // salti nel video: prima di "avanti/indietro", che da soli cambiano passo
  m = new RegExp(`(?:vai |salta |porta(?:mi)? )?(?:al )?minuto (${NUM})(?: e (${NUM}))?(?: secondi)?$`).exec(x)
    ?? new RegExp(`(?:vai|salta|porta\\w*) (?:a|al|alle?) (${NUM}) (?:minut\\w+|min)(?: e (${NUM}))?`).exec(x);
  if (m) return { k: "vSeek", abs: (toNum(m[1]) ?? 0) * 60 + (m[2] ? toNum(m[2]) ?? 0 : 0) };
  m = /(\d+:\d{2})/.exec(x);
  if (m && /(vai|salta|porta)/.test(x)) { const [a, b] = m[1].split(":").map(Number); return { k: "vSeek", abs: a * 60 + b }; }
  m = new RegExp(`(indietro|torna|riavvolgi|ripeti l ultimo)(?: di)? (${NUM}) secondi`).exec(x);
  if (m) return { k: "vSeek", rel: -(toNum(m[2]) ?? 10) };
  m = new RegExp(`(avanti|salta|vai avanti)(?: di)? (${NUM}) secondi`).exec(x);
  if (m) return { k: "vSeek", rel: toNum(m[2]) ?? 10 };
  if (/\b(riavvolgi|un po indietro|ultimo pezzo|non ho capito|rivedi l ultimo)\b/.test(x)) return { k: "vSeek", rel: -10 };
  if (/\b(rivedi|rivediamo|rivedere|ricomincia|riparti|dall inizio|dal principio|rimostra|rifai vedere|fammi rivedere)\b/.test(x)) return { k: "vReplay" };
  if (/\b(piu lento|rallenta|lentamente|piano|troppo veloce)\b/.test(x)) return { k: "vRate", r: 0.5 };
  if (/\b(piu veloce|accelera)\b/.test(x)) return { k: "vRate", r: 1.25 };
  if (/\b(velocita normale|normale)\b/.test(x)) return { k: "vRate", r: 1 };
  if (/\b(schermo intero|a tutto schermo|ingrandisci|piu grande|video grande|cinema)\b/.test(x)) return { k: "vBig", on: true };
  if (/\b(rimpicciolisci|piu piccolo|esci dallo schermo intero|torna normale)\b/.test(x)) return { k: "vBig", on: false };
  if (/\b(nascondi|chiudi|togli) (il )?video\b/.test(x)) return { k: "vHide" };
  if (/\b(mostra|apri|fammi vedere|fai vedere|fammi guardare|guarda|metti) (il |un )?(video|filmato|clip|pezzo)\b/.test(x) || /^video$/.test(x)) return { k: "vShow" };
  // pausa: anche "stop" da solo (ma "stop timer" ferma il timer)
  if (!timerWord && /\b(pausa|stop|ferma|fermati|fermo|basta|aspetta|un attimo|alt|metti in pausa|stai fermo)\b/.test(x)) return { k: "vPause" };
  if (!timerWord && /\b(riprendi|continua|riproduci|play|fai partire|avvia|parti|via)\b/.test(x)) return { k: "vPlay" };
  if (/\b(audio|sonoro|volume|con il suono|accendi l audio|togli il muto)\b/.test(x)) return { k: "vSound", on: true };
  if (/\b(muto|silenzio|senza audio|spegni l audio)\b/.test(x)) return { k: "vSound", on: false };
  // timer
  if (timerWord && /\b(stop|ferma|annulla|spegni|cancella|basta)\b/.test(x)) return { k: "timerStop" };
  if (timerWord || /\bavvisami\b/.test(x)) {
    m = new RegExp(`(${NUM}) (?:minut\\w+|min)`).exec(x);
    return { k: "timer", min: m ? toNum(m[1]) : undefined };
  }
  // passo preciso: "vai al passo 5", "passo cinque"
  m = new RegExp(`\\b(?:passo|step|punto numero|numero) (${NUM})\\b`).exec(x);
  if (m && toNum(m[1])) return { k: "goto", n: toNum(m[1]) };
  // contagiri
  if (/\b(azzera|ricomincia a contare|resetta|reset|zero)\b/.test(x)) return { k: "reset" };
  m = new RegExp(`\\b(?:piu|aggiungi|segna|metti) (${NUM})\\b`).exec(x);
  if (m && toNum(m[1])) return { k: "count", d: toNum(m[1]) };
  if (/\b(meno|togli|sbagliato|errore)\b/.test(x)) return { k: "count", d: -1 };
  if (/\b(piu|aggiungi|segna|conta|uno|giro|maglia)\b/.test(x)) return { k: "count", d: 1 };
  // passi
  if (/\b(ripeti|rileggi|leggi|rileggilo|ridimmelo|come si fa|cosa devo fare)\b/.test(x)) return { k: "read" };
  if (/\b(indietro|precedente|prima|torna|torna indietro)\b/.test(x)) return { k: "back" };
  if (/\b(avanti|prossimo|successivo|dopo|fatto|finito|finita|ho finito|vai|passo successivo|next)\b/.test(x)) return { k: "next" };
  return null;
}

const RATES = [0.5, 0.75, 1];

/** Modalità lavoro: pensata per il telefono nel supporto. Video grande in alto (o a sinistra in orizzontale) con i suoi comandi,
 *  testo del passo sotto, contagiri/timer in una riga sola e due tasti enormi in basso. Tutto comandabile anche a voce. */
export default function WorkMode({ steps, done, onToggle, onClose, storeKey, videoId, title, glossary = [] }: Props) {
  const first = steps.findIndex((_, i) => !done.includes(i));
  const [i, setI] = useState(first >= 0 ? first : 0);
  const [count, setCount] = useState(0);
  const [timer, setTimer] = useState<number | null>(null); // secondi rimasti
  const [timerMenu, setTimerMenu] = useState(false);
  const [videoPref, setVideoPref] = useState<boolean | null>(null); // null = automatico: si apre da solo se il passo ha il suo momento nel video
  const [big, setBig] = useState(false); // video a schermo intero (vista cinema)
  const [playing, setPlaying] = useState(true);
  const [rate, setRate] = useState(0.75); // i principianti hanno bisogno di vedere il gesto con calma
  const [replay, setReplay] = useState(0);
  const [readAloud, setReadAloud] = useState(false);
  const [listening, setListening] = useState(false);
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null);
  const speakingRef = useRef(false);
  const recRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const wantListen = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const vtime = useRef(0); // secondo corrente del video (arriva dal player)
  const rateRef = useRef(rate);
  rateRef.current = rate;
  const s = steps[i];
  const video = !!videoId && (videoPref ?? s?.at !== undefined);
  const last = i === steps.length - 1;
  const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
  const SR = typeof window !== "undefined" ? ((window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition) : undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

  // velocità scelta l'ultima volta
  useEffect(() => { const r = Number(lsGet("ff-rate")); if (RATES.includes(r)) setRate(r); }, []);
  // contagiri: ricordato per progetto e passo
  useEffect(() => { setCount(Number(lsGet(`ff-n-${storeKey}-${i}`)) || 0); setTimer(null); setTimerMenu(false); setPlaying(true); vtime.current = s?.at ?? 0; }, [storeKey, i]); // eslint-disable-line react-hooks/exhaustive-deps
  const bump = useCallback((d: number) => setCount((c) => { const n = Math.max(0, Math.min(9999, c + d)); lsSet(`ff-n-${storeKey}-${i}`, String(n)); return n; }), [storeKey, i]);

  // schermo sempre acceso
  useEffect(() => {
    let lock: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
    let off = false;
    const get = async () => { try { lock = await (navigator as any).wakeLock?.request("screen"); } catch { /* non supportato */ } }; // eslint-disable-line @typescript-eslint/no-explicit-any
    get();
    const vis = () => { if (document.visibilityState === "visible" && !off) get(); };
    document.addEventListener("visibilitychange", vis);
    return () => { off = true; document.removeEventListener("visibilitychange", vis); lock?.release?.().catch(() => undefined); };
  }, []);

  // blocca lo scorrimento della pagina sotto
  useEffect(() => { const o = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = o; }; }, []);

  // ---- player YouTube comandato con postMessage (nessuno script esterno) ----
  const yt = useCallback((func: string, args: unknown[] = []) => {
    try { frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "*"); } catch { /* player non pronto */ }
  }, []);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (typeof e.data !== "string" || !e.origin.includes("youtube")) return;
      try {
        const d = JSON.parse(e.data);
        if (d?.event !== "infoDelivery") return;
        if (typeof d.info?.currentTime === "number") vtime.current = d.info.currentTime;
        if (typeof d.info?.playerState === "number") setPlaying(d.info.playerState === 1 || d.info.playerState === 3);
      } catch { /* altro messaggio */ }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  const seek = useCallback((sec: number) => { const t = Math.max(0, sec); vtime.current = t; yt("seekTo", [t, true]); yt("playVideo"); setPlaying(true); }, [yt]);
  const pickRate = useCallback((r: number) => { setRate(r); lsSet("ff-rate", String(r)); yt("setPlaybackRate", [r]); }, [yt]);
  const togglePlay = useCallback(() => { if (playing) { yt("pauseVideo"); setPlaying(false); } else { yt("playVideo"); setPlaying(true); } }, [playing, yt]);
  const onFrameLoad = useCallback(() => {
    try { frameRef.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1, channel: "widget" }), "*"); } catch { /* ignora */ }
    // il player ignora i comandi finché non è pronto: si riapplica la velocità un paio di volte
    setTimeout(() => yt("setPlaybackRate", [rateRef.current]), 700);
    setTimeout(() => yt("setPlaybackRate", [rateRef.current]), 1800);
  }, [yt]);

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
    setBig(false);
    if (i < steps.length - 1) setI(i + 1); else onClose();
  }, [i, done, onToggle, steps.length, onClose]);
  const back = useCallback(() => { setBig(false); setI((v) => Math.max(0, v - 1)); }, []);

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
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") back();
      else if (e.key === "+" || e.key === "ArrowUp") bump(1);
      else if (e.key === "-" || e.key === "ArrowDown") bump(-1);
      else if (e.key === "Escape") { if (big) setBig(false); else onClose(); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [next, back, bump, onClose, big]);

  /** Esegue un comando; restituisce la frase di conferma. */
  const run = useCallback((c: Cmd): string => {
    const hasClip = s?.at !== undefined;
    const needVideo = (): boolean => { if (!videoId) return false; if (!video) setVideoPref(true); return true; };
    switch (c.k) {
      case "next": next(); return last ? "Finito" : "Avanti";
      case "back": back(); return "Indietro";
      case "read": read(); return "Rileggo il passo";
      case "goto": { const n = Math.min(steps.length, Math.max(1, c.n)); setI(n - 1); return `Passo ${n}`; }
      case "count": bump(c.d); return c.d > 0 ? `+${c.d}` : `${c.d}`;
      case "reset": setCount(0); lsSet(`ff-n-${storeKey}-${i}`, "0"); return "Contatore a zero";
      case "timer": { const m = c.min ?? minutesIn(s?.s ?? "") ?? 5; setTimer(m * 60); setTimerMenu(false); return `Timer ${m} min`; }
      case "timerStop": setTimer(null); return "Timer fermato";
      case "vShow": if (!needVideo()) return "Nessun video per questo progetto"; return "Mostro il video";
      case "vHide": setVideoPref(false); setBig(false); return "Nascondo il video";
      case "vBig": if (!needVideo()) return "Nessun video"; setBig(c.on); return c.on ? "Video a schermo intero" : "Video normale";
      case "vReplay": if (!needVideo()) return "Nessun video"; if (video) seek(s?.at ?? 0); else setReplay((n) => n + 1); return "Rivedo questo passo";
      case "vPause": yt("pauseVideo"); setPlaying(false); if (canSpeak) speechSynthesis.cancel(); return "In pausa";
      case "vPlay": if (!needVideo()) return "Nessun video"; yt("playVideo"); setPlaying(true); return "Riprendo";
      case "vSeek": {
        if (!needVideo()) return "Nessun video";
        const target = c.abs !== undefined ? c.abs : vtime.current + (c.rel ?? 0);
        const lo = hasClip ? Math.max(0, (s?.at ?? 0) - 5) : 0; // un po' prima del passo, mai a caso nel video
        seek(c.abs !== undefined ? target : Math.max(lo, target));
        return c.abs !== undefined ? `Vado a ${fmt(c.abs)}` : c.rel! < 0 ? `Indietro di ${-c.rel!} secondi` : `Avanti di ${c.rel} secondi`;
      }
      case "vRate": needVideo(); pickRate(c.r); return c.r < 1 ? "Più lento" : c.r > 1 ? "Più veloce" : "Velocità normale";
      case "vSound": needVideo(); yt(c.on ? "unMute" : "mute"); return c.on ? "Audio acceso" : "Audio spento";
    }
  }, [s, videoId, video, next, back, read, steps.length, bump, storeKey, i, last, seek, yt, pickRate, canSpeak]);

  // riconoscimento vocale: prova tutte le alternative proposte dal browser
  const handler = useRef<(alts: string[]) => void>(() => undefined);
  handler.current = (alts: string[]) => {
    for (const a of alts) {
      const c = parseCommand(a);
      if (c) { setSaid({ ok: true, text: run(c) }); return; }
    }
    setSaid({ ok: false, text: `Non ho capito: «${alts[0]}»` });
  };
  useEffect(() => {
    if (!listening || !SR) return;
    wantListen.current = true;
    const start = () => {
      if (!wantListen.current) return;
      const r = new SR();
      r.lang = "it-IT"; r.continuous = true; r.interimResults = false; r.maxAlternatives = 4;
      r.onresult = (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (speakingRef.current) return; // non ascoltare la propria voce
        const res = e.results[e.results.length - 1];
        if (!res?.isFinal) return;
        const alts: string[] = [];
        for (let k = 0; k < res.length; k++) alts.push(String(res[k]?.transcript ?? ""));
        handler.current(alts);
      };
      r.onend = () => { if (wantListen.current) setTimeout(start, 250); };
      r.onerror = (e: any) => { if (e?.error === "not-allowed" || e?.error === "service-not-allowed") { wantListen.current = false; setListening(false); setSaid({ ok: false, text: "Microfono non consentito" }); } }; // eslint-disable-line @typescript-eslint/no-explicit-any
      recRef.current = r;
      try { r.start(); } catch { /* già avviato */ }
    };
    start();
    return () => { wantListen.current = false; try { recRef.current?.stop(); } catch { /* già fermo */ } };
  }, [listening, SR]);
  useEffect(() => { if (!said) return; const t = setTimeout(() => setSaid(null), 3500); return () => clearTimeout(t); }, [said]);

  if (!s) return null;
  const suggested = minutesIn(s.s);
  const len = s.s.length;
  const bodySize = len < 110 ? "text-xl" : len < 260 ? "text-lg" : "text-base";
  const pct = Math.round(((i + 1) / steps.length) * 100);
  const known = new Set(stitchesIn(`${s.t} ${s.s}`).map((k) => k)); // i punti con simbolo non si ripetono nel glossario
  const gloss = termsIn(glossary, `${s.t} ${s.s}`).filter((g) => ![...known].some((k) => g.term.toLowerCase() === k)).slice(0, 2);
  const clipSrc = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&start=${s.at ?? 0}${s.end ? `&end=${s.end}` : ""}${s.at !== undefined ? "&autoplay=1&mute=1" : ""}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&fs=0`;
  const btn = "grid min-h-11 min-w-11 place-items-center rounded-xl border-2 border-ink px-2 text-sm font-bold active:brightness-90 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rosa";
  const tool = "grid h-12 w-12 place-items-center rounded-2xl border-2 border-ink text-xl focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rosa";

  return (
    <div role="dialog" aria-modal="true" aria-label="Modalità lavoro" className="fixed inset-0 z-50 flex flex-col bg-bg">
      <header className="flex items-center gap-2 border-b-2 border-ink px-3 py-1.5">
        <button type="button" onClick={onClose} className={`${btn} bg-white`}>Esci</button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-muted">{title || "Il tuo progetto"}</p>
          <div className="mt-0.5 h-2 overflow-hidden rounded-full border-2 border-ink bg-white" role="progressbar" aria-label="Avanzamento" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1}>
            <div className="h-full bg-rosa transition-[width]" style={{ width: pct + "%" }} />
          </div>
        </div>
        <p className="shrink-0 text-base font-bold" aria-live="polite">{i + 1}/{steps.length}</p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col landscape:flex-row">
        {video && (
          <div className={big ? "fixed inset-0 z-[55] flex flex-col bg-black" : "flex shrink-0 flex-col bg-black landscape:h-full landscape:w-[56%]"}>
            <div className={big ? "min-h-0 flex-1" : "aspect-video w-full landscape:aspect-auto landscape:min-h-0 landscape:flex-1"}>
              <iframe ref={frameRef} key={`${i}-${s.at ?? 0}-${replay}`} className="h-full w-full" title={`Video: ${s.t}`} src={clipSrc} onLoad={onFrameLoad}
                allow="autoplay; accelerometer; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" />
            </div>
            <div className="flex items-center gap-1.5 bg-ink px-2 py-1.5 text-white" role="group" aria-label="Comandi del video">
              <button type="button" aria-label="Indietro di 10 secondi" onClick={() => seek(vtime.current - 10)} className={`${btn} border-white/60 bg-white/10`}>−10″</button>
              <button type="button" aria-label={playing ? "Pausa" : "Riprendi"} onClick={togglePlay} className={`${btn} min-w-14 border-white bg-rosa text-lg`}>{playing ? "❚❚" : "▶"}</button>
              <button type="button" aria-label="Avanti di 10 secondi" onClick={() => seek(vtime.current + 10)} className={`${btn} border-white/60 bg-white/10`}>+10″</button>
              <button type="button" aria-label="Rivedi questo passo dall'inizio" onClick={() => seek(s.at ?? 0)} className={`${btn} border-white/60 bg-white/10`}>↻</button>
              <span className="ml-auto flex items-center gap-1" role="group" aria-label="Velocità">
                {RATES.map((r) => (
                  <button key={r} type="button" aria-pressed={rate === r} onClick={() => pickRate(r)} className={`${btn} ${rate === r ? "border-white bg-white text-ink" : "border-white/60 bg-white/10"}`}>{r === 1 ? "1×" : `${r}×`}</button>
                ))}
              </span>
              <button type="button" aria-label={big ? "Esci dallo schermo intero" : "Video a schermo intero"} aria-pressed={big} onClick={() => setBig((v) => !v)} className={`${btn} border-white/60 bg-white/10`}>{big ? "✕" : "⛶"}</button>
            </div>
            {big && said && <p className={`bg-ink px-3 pb-2 text-sm font-bold ${said.ok ? "text-menta" : "text-rosa-chiaro"}`} role="status">{said.ok ? `✓ ${said.text}` : said.text}</p>}
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col">
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            <h1 className="mb-1.5 text-2xl leading-tight">{s.t}</h1>
            <p className={`${bodySize} leading-snug whitespace-pre-line`}>{s.s}</p>
            <StitchRow text={`${s.t} ${s.s}`} />
            {gloss.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Significato dei punti">
                {gloss.map((g) => <li key={g.term} className="rounded-xl border-2 border-ink bg-menta px-2.5 py-1 text-sm"><b>{g.term}</b> = {g.meaning}</li>)}
              </ul>
            )}
            {videoId && !video && (
              <button type="button" className={`${btn} mt-3 bg-lilla px-4`} onClick={() => setVideoPref(true)}>▶ Guarda il video{s.at !== undefined ? ` (${fmt(s.at)})` : ""}</button>
            )}
          </main>

          <section aria-label="Strumenti" className="border-t-2 border-ink bg-white px-3 py-2">
            {timerMenu && timer === null && (
              <div className="mb-2 flex flex-wrap gap-1.5" role="group" aria-label="Scegli il timer">
                {[...(suggested ? [suggested] : []), 5, 10, 15, 30].filter((m, k, a) => a.indexOf(m) === k).map((m) => (
                  <button key={m} type="button" onClick={() => { setTimer(m * 60); setTimerMenu(false); }} className={`${btn} px-3 ${m === suggested ? "bg-menta" : "bg-bg"}`}>{m} min{m === suggested ? " ★" : ""}</button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1" role="group" aria-label="Contagiri">
                <button type="button" onClick={() => bump(-1)} aria-label="Togli uno" className="h-12 w-12 rounded-2xl border-2 border-ink bg-bg text-3xl font-bold leading-none active:bg-rosa-chiaro">−</button>
                <output className="min-w-[3rem] text-center font-display text-3xl" aria-live="polite" aria-label={`Contati: ${count}`}>{count}</output>
                <button type="button" onClick={() => bump(1)} aria-label="Aggiungi uno" className="h-12 w-12 rounded-2xl border-2 border-ink bg-rosa text-3xl font-bold leading-none text-white active:bg-accent">+</button>
              </div>
              <span className="ml-auto flex items-center gap-1.5">
                {timer === null ? (
                  <button type="button" aria-label="Timer" aria-expanded={timerMenu} onClick={() => setTimerMenu((v) => !v)} className={`${tool} ${timerMenu ? "bg-menta" : "bg-bg"}`}>⏱</button>
                ) : (
                  <button type="button" aria-label="Ferma il timer" onClick={() => setTimer(null)} role="timer" className={`${tool} w-auto min-w-[5.2rem] gap-1 px-2.5 font-display text-xl ${timer === 0 ? "bg-warn text-white" : "bg-menta"}`}>{timer === 0 ? "Finito!" : fmt(timer)}</button>
                )}
                {canSpeak && <button type="button" aria-label="Leggi i passi ad alta voce" aria-pressed={readAloud} onClick={() => setReadAloud((v) => !v)} className={`${tool} ${readAloud ? "bg-rosa text-white" : "bg-bg"}`}>🔊</button>}
                {SR && <button type="button" aria-label="Comandi vocali" aria-pressed={listening} onClick={() => { setSaid(null); setListening((v) => !v); }} className={`${tool} ${listening ? "bg-rosa text-white" : "bg-bg"}`}>🎤</button>}
              </span>
            </div>
            <p className={`min-h-5 pt-1 text-sm font-bold ${said && !said.ok ? "text-warn" : "text-muted"}`} role="status" aria-live="polite">
              {said ? (said.ok ? `✓ ${said.text}` : said.text) : listening ? "Ti ascolto: «avanti», «stop», «rivedi», «più lento»…" : ""}
            </p>
          </section>

          <footer className="grid grid-cols-[1fr_2fr] gap-2.5 border-t-2 border-ink bg-bg p-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
            <button type="button" onClick={back} disabled={i === 0} className="min-h-16 rounded-3xl border-2 border-ink bg-white text-lg font-bold disabled:opacity-40 active:bg-lilla">← Indietro</button>
            <button type="button" onClick={next} className="min-h-16 rounded-3xl border-2 border-ink bg-rosa text-xl font-bold text-white active:bg-accent">{last ? "Finito ✓" : "Fatto · Avanti →"}</button>
          </footer>
        </div>
      </div>
    </div>
  );
}
