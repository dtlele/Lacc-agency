"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Step } from "@/lib/pattern";

const BG = "#fff7ee", FILL = "#ff4f8b", INK = "#3d1747", HI = "#ffe066";
const MAX_W = 480, PAD = 14, STRIP = 44, MAX_CELL = 30;
const REC_SECONDS = 9, HOLD_SECONDS = 1.5;
const VOICE_MAX = 240;

function pickMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m));
}

/** Animazione dello schema: la griglia si riempie riga per riga dal basso. Si può scaricare come video WebM. */
export default function PatternPlayer({ rows, steps, name }: { rows: string[]; steps: Step[]; name: string }) {
  const nRows = rows.length;
  const nCols = rows[0]?.length ?? 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progRef = useRef(0); // 0..nRows (righe riempite, con frazione)
  const recRef = useRef<{ rec: MediaRecorder; holdUntil: number | null; voice: boolean } | null>(null);
  // voce narrante
  const voiceOnRef = useRef(false);
  const hqRef = useRef(false); // voce di qualità (ElevenLabs) disponibile
  const busyRef = useRef(false); // true finche' la frase corrente sta parlando: l'animazione aspetta
  const spokenRef = useRef(-1); // indice dell'ultimo passo letto
  const tokRef = useRef(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const destRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const srcRef = useRef<AudioBufferSourceNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bufRef = useRef<Map<string, AudioBuffer>>(new Map());
  const [prog, setProg] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [reduced, setReduced] = useState(false);
  const [canRecord, setCanRecord] = useState(true);
  const [recording, setRecording] = useState(false);
  const [msg, setMsg] = useState("");
  const [voiceOk, setVoiceOk] = useState(false); // il browser sa leggere ad alta voce
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceHq, setVoiceHq] = useState(false);
  const [voiceNote, setVoiceNote] = useState("");

  const geo = useMemo(() => {
    const cell = Math.max(6, Math.min(MAX_CELL, Math.floor((MAX_W - PAD * 2) / Math.max(1, nCols))));
    const w = Math.max(260, cell * nCols + PAD * 2);
    const h = STRIP + cell * nRows + PAD;
    return { cell, w: w + (w % 2), h: h + (h % 2) };
  }, [nCols, nRows]);

  const stepOfRow = useCallback((y: number) => steps.find((s) => s.r.includes(y)), [steps]);

  const stepText = useCallback((i: number) => `${steps[i].t}. ${steps[i].s}`.replace(/\s+/g, " ").trim().slice(0, VOICE_MAX), [steps]);
  const stepIndexAt = useCallback((p: number) => {
    const row = nRows - 1 - Math.min(nRows - 1, Math.max(0, Math.ceil(p) - 1));
    return steps.findIndex((s) => s.r.includes(row));
  }, [steps, nRows]);

  const stopVoice = useCallback(() => {
    tokRef.current++;
    busyRef.current = false;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    try { srcRef.current?.stop(); } catch { /* gia' fermo */ }
    srcRef.current = null;
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  }, []);

  const loadBuf = useCallback(async (text: string): Promise<AudioBuffer> => {
    const hit = bufRef.current.get(text);
    if (hit) return hit;
    const ctx = ctxRef.current;
    if (!ctx) throw new Error("no audio");
    const r = await fetch("/api/voice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
    if (!r.ok) throw new Error(String(r.status));
    const b = await ctx.decodeAudioData(await r.arrayBuffer());
    bufRef.current.set(text, b);
    return b;
  }, []);

  const speak = useCallback((i: number) => {
    stopVoice();
    const tok = tokRef.current;
    const text = stepText(i);
    busyRef.current = true;
    const done = () => { if (tok === tokRef.current) { busyRef.current = false; if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } } };
    const browser = () => {
      if (typeof speechSynthesis === "undefined") { done(); return; }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "it-IT";
      const v = speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith("it"));
      if (v) u.voice = v;
      u.onend = done; u.onerror = done;
      timerRef.current = setTimeout(done, text.length * 120 + 3000); // rete di sicurezza se il browser non avvisa
      speechSynthesis.speak(u);
    };
    if (!hqRef.current || !ctxRef.current) { browser(); return; }
    loadBuf(text).then((buf) => {
      if (tok !== tokRef.current) return;
      const ctx = ctxRef.current!;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      if (destRef.current) src.connect(destRef.current);
      src.onended = done;
      srcRef.current = src;
      src.start();
    }).catch(() => {
      if (tok !== tokRef.current) return;
      hqRef.current = false; setVoiceHq(false);
      setVoiceNote("La voce di qualità non risponde: uso la voce del browser.");
      browser();
    });
  }, [stopVoice, stepText, loadBuf]);

  const draw = useCallback((p: number) => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const { cell, w, h } = geo;
    ctx.setTransform(cv.width / w, 0, 0, cv.height / h, 0, 0);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, w, h);
    const full = Math.floor(p);
    const cur = p < nRows ? full : -1; // riga (dal basso) in lavorazione
    const ox = Math.round((w - cell * nCols) / 2);
    for (let k = 0; k < nRows; k++) {
      const y = nRows - 1 - k;
      const frac = k < full ? 1 : k === cur ? p - full : 0;
      const isCur = k === cur && p > 0;
      for (let x = 0; x < nCols; x++) {
        const px = ox + x * cell, py = STRIP + y * cell;
        const on = rows[y][x] === "#";
        const shown = on && (k < full || (k === cur && (x + 1) / nCols <= frac + 1e-9));
        ctx.fillStyle = isCur ? HI : shown ? FILL : "#ffffff";
        if (isCur && shown) ctx.fillStyle = FILL;
        ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
        ctx.strokeStyle = shown ? INK : "rgba(61,23,71,0.25)";
        ctx.lineWidth = shown ? 1.5 : 1;
        ctx.strokeRect(px + 1.5, py + 1.5, cell - 3, cell - 3);
      }
    }
    // titolo del passo corrente
    const rowNow = nRows - 1 - Math.min(nRows - 1, Math.max(0, Math.ceil(p) - 1));
    const label = p >= nRows ? "Finito!" : p <= 0 ? "Pronto a iniziare" : stepOfRow(rowNow)?.t ?? "Lavoro in corso";
    ctx.fillStyle = INK; ctx.font = "bold 17px system-ui, sans-serif"; ctx.textBaseline = "middle";
    let txt = label;
    while (txt.length > 3 && ctx.measureText(txt).width > w - PAD * 2) txt = txt.slice(0, -2) + "…";
    ctx.fillText(txt, PAD, STRIP / 2);
  }, [geo, nCols, nRows, rows, stepOfRow]);

  // dimensioni nitide su schermi retina
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = recording ? 1 : Math.min(3, window.devicePixelRatio || 1);
    cv.width = Math.round(geo.w * dpr);
    cv.height = Math.round(geo.h * dpr);
    draw(progRef.current);
  }, [geo, draw, recording]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    setCanRecord(typeof MediaRecorder !== "undefined" && typeof HTMLCanvasElement.prototype.captureStream === "function");
    if (!mq.matches) setPlaying(true);
    setVoiceOk(typeof speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined");
    return () => { stopVoice(); ctxRef.current?.close().catch(() => undefined); ctxRef.current = null; };
  }, [stopVoice]);

  // ciclo di animazione
  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const r = recRef.current;
      const rate = r ? nRows / REC_SECONDS : Math.max(1.5, nRows / 10) * speed;
      const vActive = voiceOnRef.current && (!r || r.voice);
      if (vActive && progRef.current < nRows) {
        const idx = stepIndexAt(progRef.current);
        if (idx >= 0 && idx !== spokenRef.current) { spokenRef.current = idx; speak(idx); }
      }
      const waiting = vActive && busyRef.current; // la voce sta parlando: l'animazione aspetta
      if (!waiting && progRef.current < nRows) progRef.current = Math.min(nRows, progRef.current + rate * dt);
      draw(progRef.current);
      setProg(progRef.current);
      if (progRef.current >= nRows) {
        if (r) {
          if (r.holdUntil === null) r.holdUntil = now + HOLD_SECONDS * 1000;
          else if (now >= r.holdUntil) { r.rec.stop(); return; }
        } else { setPlaying(false); return; }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, nRows, draw, speak, stepIndexAt]);

  function setP(p: number) { progRef.current = p; setProg(p); draw(p); }
  function resetVoice() { stopVoice(); spokenRef.current = -1; }
  function togglePlay() {
    if (playing) resetVoice();
    if (!playing && progRef.current >= nRows) setP(0);
    setPlaying((v) => !v);
  }
  function restart() { resetVoice(); setP(0); setPlaying(!reduced); }
  function nextRow() { resetVoice(); setPlaying(false); setP(Math.min(nRows, Math.floor(progRef.current) + 1)); }

  async function toggleVoice() {
    if (voiceOn) {
      voiceOnRef.current = false; setVoiceOn(false); resetVoice(); setVoiceNote("");
      return;
    }
    setVoiceNote("Controllo la voce...");
    let hq = false;
    try {
      const r = await fetch("/api/voice");
      hq = r.ok && !!(await r.json()).enabled && typeof AudioContext !== "undefined";
    } catch { hq = false; }
    if (hq) {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      await ctxRef.current.resume().catch(() => undefined);
    }
    hqRef.current = hq; setVoiceHq(hq);
    resetVoice();
    voiceOnRef.current = true; setVoiceOn(true);
    setVoiceNote(hq ? "Voce di qualità attiva." : "Voce del browser attiva.");
  }

  async function download() {
    const cv = canvasRef.current;
    if (!cv || recRef.current) return;
    setMsg("");
    resetVoice();
    // voce di qualita': prepara tutte le frasi prima di registrare, cosi' l'audio finisce nel video
    let withVoice = false;
    if (voiceOnRef.current && hqRef.current && ctxRef.current) {
      setRecording(true);
      setMsg("Preparo la voce...");
      try {
        for (let i = 0; i < steps.length; i++) await loadBuf(stepText(i));
        destRef.current = ctxRef.current.createMediaStreamDestination();
        withVoice = true;
        setMsg("");
      } catch {
        setMsg("Non sono riuscita a preparare la voce: il video sarà senza voce.");
      }
    }
    spokenRef.current = -1;
    try {
      setPlaying(false);
      setRecording(true);
      // aspetta il ridisegno del canvas a 1x, poi parte la registrazione
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const c = canvasRef.current!;
        try {
          const canvasStream = c.captureStream(30);
          const stream = withVoice && destRef.current
            ? new MediaStream([...canvasStream.getVideoTracks(), ...destRef.current.stream.getAudioTracks()])
            : canvasStream;
          const mime = pickMime();
          const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 2_500_000 } : undefined);
          const chunks: Blob[] = [];
          rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
          rec.onerror = () => fail();
          rec.onstop = () => {
            stream.getTracks().forEach((t) => t.stop());
            canvasStream.getTracks().forEach((t) => t.stop());
            stopVoice(); destRef.current = null; spokenRef.current = -1;
            recRef.current = null;
            setPlaying(false);
            setRecording(false);
            const blob = new Blob(chunks, { type: mime ?? "video/webm" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = (name.trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "") || "schema") + ".webm";
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 10000);
            setMsg("Video pronto. Lo trovi tra i file scaricati.");
          };
          progRef.current = 0; draw(0); setProg(0);
          recRef.current = { rec, holdUntil: null, voice: withVoice };
          rec.start(250);
          setPlaying(true);
        } catch { fail(); }
      }));
    } catch { fail(); }
  }
  function fail() {
    stopVoice(); destRef.current = null; spokenRef.current = -1;
    recRef.current = null; setPlaying(false); setRecording(false);
    setMsg("Non sono riuscita a fare il video. Prova con un altro browser.");
  }

  const done = prog >= nRows;
  const rowNow = nRows - 1 - Math.min(nRows - 1, Math.max(0, Math.ceil(prog) - 1));
  const label = done ? "Finito!" : prog <= 0 ? "Pronto a iniziare" : stepOfRow(rowNow)?.t ?? "Lavoro in corso";
  const rowNum = Math.min(nRows, Math.ceil(prog));
  const pct = nRows ? Math.round((prog / nRows) * 100) : 0;
  const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rosa";

  if (!nRows || !nCols) return null;
  return (
    <div>
      <canvas ref={canvasRef} role="img" aria-label={`Animazione dello schema ${name}: la griglia si riempie riga per riga dal basso`}
        className="mx-auto block h-auto w-full rounded-2xl border-2 border-ink" style={{ maxWidth: geo.w, aspectRatio: `${geo.w} / ${geo.h}` }} />
      <div className="mx-auto mt-3" style={{ maxWidth: geo.w }}>
        <div className="mb-2 h-3 overflow-hidden rounded-full border-2 border-ink bg-white" role="progressbar" aria-label="Avanzamento dell'animazione" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="h-full bg-rosa" style={{ width: pct + "%" }} />
        </div>
        <p className="mb-3 text-sm font-bold">Riga {rowNum} di {nRows}: {label}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={`btn ${focus}`} onClick={togglePlay} disabled={recording}>{playing ? "Pausa" : done ? "Rivedi" : "Avvia"}</button>
          <button type="button" className={`btn btn-ghost ${focus}`} onClick={nextRow} disabled={recording || done}>Riga successiva</button>
          <button type="button" className={`btn btn-ghost ${focus}`} onClick={restart} disabled={recording}>Riavvia</button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Velocità">
          <span className="text-sm font-bold">Velocità</span>
          {[0.5, 1, 2].map((v) => (
            <button key={v} type="button" aria-pressed={speed === v} disabled={recording} onClick={() => setSpeed(v)}
              className={`chip ${focus} ${speed === v ? "bg-rosa text-white" : ""}`}>{v}x</button>
          ))}
        </div>
        {canRecord && (
          <div className="mt-4">
            <button type="button" className={`btn ${focus}`} onClick={download} disabled={recording}>{recording ? "Sto registrando…" : "Scarica il video"}</button>
          </div>
        )}
        {voiceOk && (
          <div className="mt-4">
            <button type="button" className={`btn btn-ghost ${focus}`} aria-pressed={voiceOn} onClick={toggleVoice} disabled={recording}>
              {voiceOn ? "Voce: accesa" : "Voce: spenta"}
            </button>
            <p className="mt-1 text-sm text-muted">
              {voiceOn && voiceHq
                ? "La voce di qualità finisce anche nel video scaricato."
                : "La voce del browser si sente solo qui, non nel file scaricato."}
            </p>
            <p className="min-h-5 text-sm font-bold" role="status" aria-live="polite">{voiceNote}</p>
          </div>
        )}
        {reduced && <p className="mt-2 text-sm text-muted">Hai scelto meno movimento: usa &quot;Riga successiva&quot; per andare avanti a mano.</p>}
        {!canRecord && <p className="mt-2 text-sm text-muted">Questo browser non può registrare il video. Prova con Chrome o Edge.</p>}
        <p className="mt-2 min-h-5 text-sm font-bold" role="status" aria-live="polite">{recording ? "Sto registrando…" : msg}</p>
      </div>
    </div>
  );
}
