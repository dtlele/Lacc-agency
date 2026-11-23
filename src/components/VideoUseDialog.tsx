"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GuideMeta } from "@/lib/guide";
import type { Step } from "@/lib/pattern";

export type VideoLite = { id: string; title: string; channel: string; duration: number | null };

const LANGS: [string, string][] = [["it", "Italiano"], ["en", "English"], ["es", "Español"], ["fr", "Français"], ["de", "Deutsch"], ["pt", "Português"]];
const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rosa";
type Screen = "ask" | "confirm" | "wait" | "preview";
type Result = { meta: GuideMeta; steps: Step[]; name: string };

/** Doppia conferma + analisi del video: crea la scheda informativa del progetto nella lingua scelta. */
export default function VideoUseDialog({ video, onClose }: { video: VideoLite; onClose: () => void }) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("ask");
  const [lang, setLang] = useState("it");
  const [understood, setUnderstood] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const title = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const l = (typeof navigator !== "undefined" ? navigator.language : "it").slice(0, 2).toLowerCase();
    setLang(LANGS.some(([c]) => c === l) ? l : "it");
  }, []);
  useEffect(() => { title.current?.focus(); }, [screen]);
  useEffect(() => () => abort.current?.abort(), []);

  const close = () => { abort.current?.abort(); onClose(); };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { abort.current?.abort(); onClose(); } };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);

  async function analyze() {
    setErr(""); setScreen("wait");
    const ac = new AbortController(); abort.current = ac;
    try {
      const r = await fetch("/api/video/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ac.signal,
        body: JSON.stringify({ videoId: video.id, title: video.title, channel: video.channel, duration: video.duration, lang, confirm: 2 }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(d.error || "Analisi non riuscita: riprova tra poco."); setScreen("confirm"); return; }
      setRes(d as Result); setName(String(d.name ?? "")); setScreen("preview");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setErr("Connessione interrotta: riprova."); setScreen("confirm");
    }
  }

  async function save() {
    if (!res) return;
    setSaving(true); setErr("");
    try {
      const r = await fetch("/api/projects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "guide", name: name.trim() || res.name, meta: res.meta, steps: res.steps, category: "Da video", difficulty: res.meta.difficulty }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(d.error || "Non sono riuscita a salvare."); setSaving(false); return; }
      router.push(`/app/progetti/${d.id}`);
    } catch { setErr("Connessione interrotta: riprova."); setSaving(false); }
  }

  const h = "mb-3 text-2xl outline-none";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/50 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="vud-title" className="card w-full max-w-lg bg-bg">
        <div className="mb-3 rounded-2xl border-2 border-ink bg-white p-3 text-sm"><b className="block">{video.title}</b><span className="text-muted">{video.channel}</span></div>

        {screen === "ask" && (<>
          <h2 id="vud-title" ref={title} tabIndex={-1} className={h}>Vuoi usare questo video per creare la scheda del progetto?</h2>
          <p className="mb-3 text-sm">Guardiamo il video (circa un fotogramma al secondo) e ascoltiamo la voce. Può richiedere un minuto. Ogni utente ha poche analisi al giorno.</p>
          <div className="mb-4">
            <label htmlFor="vud-lang" className="mb-1 block text-sm font-bold">Lingua della scheda</label>
            <select id="vud-lang" className="input" value={lang} onChange={(e) => setLang(e.target.value)}>
              {LANGS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={`btn ${focus}`} onClick={() => setScreen("confirm")}>Continua</button>
            <button type="button" className={`btn btn-ghost ${focus}`} onClick={close}>Annulla</button>
          </div>
        </>)}

        {screen === "confirm" && (<>
          <h2 id="vud-title" ref={title} tabIndex={-1} className={h}>Confermi?</h2>
          <p className="mb-3">L&apos;analisi usa una delle tue analisi di oggi.</p>
          <p className="mb-3 text-sm text-muted">Lingua della scheda: <b>{LANGS.find(([c]) => c === lang)?.[1]}</b></p>
          <label className="mb-4 flex items-start gap-3 font-bold">
            <input type="checkbox" className="mt-1 h-5 w-5" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />
            <span>Ho capito</span>
          </label>
          {err && <p role="alert" className="mb-3 rounded-xl border-2 border-ink bg-pesca p-3 text-sm font-bold">{err}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="button" className={`btn ${focus}`} disabled={!understood} onClick={analyze}>Sì, crea la scheda</button>
            <button type="button" className={`btn btn-ghost ${focus}`} onClick={() => { setErr(""); setUnderstood(false); setScreen("ask"); }}>Indietro</button>
          </div>
        </>)}

        {screen === "wait" && (<>
          <h2 id="vud-title" ref={title} tabIndex={-1} className={h}>Sto guardando il video…</h2>
          <p role="status" aria-live="polite" className="mb-4">Guardo il video e ascolto la voce per scrivere la scheda. Può richiedere circa un minuto: non chiudere la pagina.</p>
          <button type="button" className={`btn btn-ghost ${focus}`} onClick={() => { abort.current?.abort(); setScreen("confirm"); }}>Annulla</button>
        </>)}

        {screen === "preview" && res && (<>
          <h2 id="vud-title" ref={title} tabIndex={-1} className={h}>Ecco la scheda</h2>
          <label htmlFor="vud-name" className="mb-1 block text-sm font-bold">Nome del progetto</label>
          <input id="vud-name" className="input mb-3" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
          {res.meta.summary && <p className="mb-3 text-sm">{res.meta.summary}</p>}
          {res.meta.materials.length > 0 && (<>
            <p className="font-bold">Materiali</p>
            <ul className="mb-3 list-disc pl-5 text-sm">{res.meta.materials.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </>)}
          <p className="mb-4 text-sm font-bold">{res.steps.length} passi</p>
          {err && <p role="alert" className="mb-3 rounded-xl border-2 border-ink bg-pesca p-3 text-sm font-bold">{err}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="button" className={`btn ${focus}`} disabled={saving} onClick={save}>{saving ? "Salvo…" : "Salva nei progetti"}</button>
            <button type="button" className={`btn btn-ghost ${focus}`} disabled={saving} onClick={close}>Scarta</button>
          </div>
        </>)}
      </div>
    </div>
  );
}
