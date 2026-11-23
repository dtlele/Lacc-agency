"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client";

type Vid = { id: string; title: string; channel: string; duration: number | null };
const LIVELLI = [["", "Tutti i livelli"], ["principianti", "Principianti"], ["intermedio", "Intermedio"], ["esperte", "Esperte"]] as const;
const SUGGERITI = ["amigurumi", "punto ventaglio", "granny square", "borsa a rete", "anello magico"];
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function Video() {
  const [text, setText] = useState("");
  const [liv, setLiv] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<{ q: string; videos: Vid[] } | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  async function cerca(q: string, level = liv) {
    q = q.trim(); if (q.length < 2 || busy) return;
    setBusy(true); setErr(""); setOpen(null);
    try {
      const r = await api<{ videos: Vid[] }>(`/api/video?q=${encodeURIComponent(q)}&level=${level}`);
      setRes({ q, videos: r.videos });
      if (!r.videos.length) setErr("Nessun tutorial trovato: prova con altre parole.");
    } catch (x) { setErr((x as Error).message); setRes(null); }
    setBusy(false);
  }

  return (
    <div className="grid max-w-3xl gap-5">
      <h1 className="text-4xl">Cerca un video</h1>
      <form onSubmit={(e) => { e.preventDefault(); cerca(text); }} className="card grid gap-3">
        <label className="font-bold">Cosa vuoi imparare?
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Es. amigurumi, punto ventaglio, borsa" className="input mt-1" maxLength={80} />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Livello">
          {LIVELLI.map(([v, l]) => <button type="button" key={v} className="chip" aria-pressed={liv === v} onClick={() => { setLiv(v); if (res) cerca(res.q, v); }}>{l}</button>)}
        </div>
        <button className="btn justify-self-start" disabled={busy || text.trim().length < 2}>{busy ? "Cerco…" : "Cerca"}</button>
      </form>
      <div className="flex flex-wrap gap-2">
        {SUGGERITI.map((s) => <button key={s} className="chip" onClick={() => { setText(s); cerca(s); }}>{s}</button>)}
      </div>
      <p role="status" aria-live="polite" className="min-h-6 font-bold text-muted">{busy ? "Cerco i tutorial migliori su YouTube…" : err}</p>
      {res && res.videos.length > 0 && (
        <ul className="fade-in grid gap-4 sm:grid-cols-2">
          {res.videos.map((v, i) => (
            <li key={v.id}>
              <button onClick={() => setOpen(i)} className="card block h-full w-full overflow-hidden !p-0 text-left hover:bg-menta/40">
                <span className="relative block aspect-video border-b-2 border-ink bg-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {v.duration ? <span className="absolute bottom-2 right-2 rounded-full bg-ink px-2 py-0.5 text-xs font-bold text-white">{fmt(v.duration)}</span> : null}
                </span>
                <span className="block p-3"><b className="line-clamp-2 block">{v.title}</b><span className="text-sm text-muted">{v.channel}</span></span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-sm text-muted">Risultati da YouTube. Escludiamo i video che dichiarano di essere generati con l&apos;AI; non possiamo però verificare ogni canale.</p>
      {res && open !== null && <PlayerModal videos={res.videos} start={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function PlayerModal({ videos, start, onClose }: { videos: Vid[]; start: number; onClose: () => void }) {
  const [i, setI] = useState(start);
  const ref = useRef<HTMLDivElement>(null);
  const v = videos[i];
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; prev?.focus(); };
  }, [onClose]);
  return (
    <div className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Video" onClick={onClose}>
      <div ref={ref} tabIndex={-1} className="card max-h-[92dvh] w-full max-w-3xl overflow-y-auto !rounded-b-none pb-[max(1rem,env(safe-area-inset-bottom))] sm:!rounded-b-[20px]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div><h2 className="text-xl">{v.title}</h2><p className="text-sm text-muted">{v.channel}{v.duration ? ` · ${fmt(v.duration)}` : ""}</p></div>
          <button className="btn btn-ghost !min-h-10 !px-4" onClick={onClose} aria-label="Chiudi">Chiudi</button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border-2 border-ink bg-black">
          <iframe key={v.id} src={`https://www.youtube-nocookie.com/embed/${v.id}?rel=0&autoplay=1`} title={v.title} className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
        {videos.length > 1 && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <button className="btn btn-ghost !min-h-10" onClick={() => setI((i + videos.length - 1) % videos.length)}>Precedente</button>
            <span className="text-sm font-bold text-muted">{i + 1} di {videos.length}</span>
            <button className="btn btn-ghost !min-h-10" onClick={() => setI((i + 1) % videos.length)}>Successivo</button>
          </div>
        )}
      </div>
    </div>
  );
}
