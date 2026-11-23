"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client";
import HeartButton from "@/components/HeartButton";
import VideoUseDialog from "@/components/VideoUseDialog";

type Vid = { id: string; title: string; channel: string; duration: number | null; subs?: number | null; verified?: boolean };
const fmtSubs = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1).replace(".", ",")} mln` : n >= 1000 ? `${Math.round(n / 1000)} mila` : String(n));
const canale = (v: Vid) => [v.channel, v.verified ? "canale verificato" : "", v.subs ? `${fmtSubs(v.subs)} iscritti` : ""].filter(Boolean).join(" · ");
const LIVELLI = [["", "Tutti i livelli"], ["principianti", "Principianti"], ["intermedio", "Intermedio"], ["esperte", "Esperte"]] as const;
const SUGGERITI = ["amigurumi", "punto ventaglio", "granny square", "borsa a rete", "anello magico"];
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function Video() {
  const [text, setText] = useState("");
  const [liv, setLiv] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [res, setRes] = useState<{ q: string; level: string; videos: Vid[]; nextToken: string | null } | null>(null);
  const [tokens, setTokens] = useState<string[]>([""]); // token di ogni pagina già vista (la pagina 1 non ne ha) + quello della successiva
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    api<{ items?: { id: string }[] }>("/api/favorites/videos")
      .then((d) => setFavs(new Set((d.items ?? []).map((v) => v.id))))
      .catch(() => {});
  }, []);

  async function preferito(v: Vid, next: boolean) {
    const set = (on: boolean) => setFavs((f) => { const n = new Set(f); if (on) n.add(v.id); else n.delete(v.id); return n; });
    set(next);
    try {
      if (next) await api("/api/favorites/videos", "POST", { id: v.id, title: v.title, channel: v.channel, duration: v.duration });
      else await api(`/api/favorites/videos?id=${encodeURIComponent(v.id)}`, "DELETE");
    } catch (x) { set(!next); setErr((x as Error).message); }
  }

  /** Carica la pagina `idx` della ricerca; `stack[idx]` è il token di quella pagina. */
  async function carica(q: string, level: string, stack: string[], idx: number) {
    setBusy(true); setErr(""); setOpen(null);
    try {
      const r = await api<{ videos: Vid[]; nextToken?: string | null }>(`/api/video?q=${encodeURIComponent(q)}&level=${level}${stack[idx] ? `&token=${encodeURIComponent(stack[idx])}` : ""}`);
      const nextToken = r.nextToken ?? null;
      setRes({ q, level, videos: r.videos, nextToken });
      setTokens(nextToken ? [...stack.slice(0, idx + 1), nextToken] : stack.slice(0, idx + 1));
      setPage(idx);
      if (!r.videos.length) setErr(idx === 0 ? `Nessun tutorial di uncinetto trovato per «${q}»: prova con altre parole.` : "In questa pagina non c'è nessun tutorial di uncinetto: prova la pagina successiva o cambia parole.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (x) { setErr((x as Error).message); if (idx === 0) setRes(null); }
    setBusy(false);
  }
  function cerca(q: string, level = liv) {
    q = q.trim(); if (q.length < 2 || busy) return;
    setTokens([""]); setPage(0);
    carica(q, level, [""], 0);
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
            <li key={v.id} className="relative">
              <button onClick={() => setOpen(i)} className="card block h-full w-full overflow-hidden !p-0 text-left hover:bg-menta/40">
                <span className="relative block aspect-video border-b-2 border-ink bg-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {v.duration ? <span className="absolute bottom-2 right-2 rounded-full bg-ink px-2 py-0.5 text-xs font-bold text-white">{fmt(v.duration)}</span> : null}
                </span>
                <span className="block p-3"><b className="line-clamp-2 block">{v.title}</b><span className="text-sm text-muted">{canale(v)}</span></span>
              </button>
              <span className="absolute right-2 top-2 z-10 rounded-full bg-white/90 text-xl" onClick={(e) => e.stopPropagation()}>
                <HeartButton on={favs.has(v.id)} onChange={(n) => preferito(v, n)} label="Salva tra i preferiti" />
              </span>
            </li>
          ))}
        </ul>
      )}
      {res && (page > 0 || res.nextToken) && (
        <nav className="flex items-center justify-between gap-3" aria-label="Pagine dei risultati">
          <button className="btn btn-ghost !min-h-10" disabled={busy || page === 0} onClick={() => carica(res.q, res.level, tokens, page - 1)}>Pagina precedente</button>
          <span className="font-bold text-muted">Pagina {page + 1}</span>
          <button className="btn btn-ghost !min-h-10" disabled={busy || !res.nextToken} onClick={() => carica(res.q, res.level, tokens, page + 1)}>Pagina successiva</button>
        </nav>
      )}
      <p className="text-sm text-muted">Risultati da YouTube. Mostriamo solo video di uncinetto che insegnano a fare il lavoro (tutorial, lezioni, passo passo) e scartiamo vetrine di lavori finiti, compilation, video velocizzati e short. Escludiamo anche i video che si dichiarano generati con l&apos;AI. Sono indizi su titolo, descrizione e durata, non una garanzia: l&apos;ultima parola è tua.</p>
      {res && open !== null && <PlayerModal videos={res.videos} start={open} favs={favs} onHeart={preferito} onClose={() => setOpen(null)} />}
    </div>
  );
}

function PlayerModal({ videos, start, favs, onHeart, onClose }: { videos: Vid[]; start: number; favs: Set<string>; onHeart: (v: Vid, next: boolean) => void; onClose: () => void }) {
  const [i, setI] = useState(start);
  const [usa, setUsa] = useState(false);
  const usaRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  const v = videos[i];
  usaRef.current = usa;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !usaRef.current) onClose(); };
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; prev?.focus(); };
  }, [onClose]);
  return (
    <div className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Video" onClick={onClose}>
      <div ref={ref} tabIndex={-1} className="card max-h-[92dvh] w-full max-w-3xl overflow-y-auto !rounded-b-none pb-[max(1rem,env(safe-area-inset-bottom))] sm:!rounded-b-[20px]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div><h2 className="text-xl">{v.title}</h2><p className="text-sm text-muted">{canale(v)}{v.duration ? ` · ${fmt(v.duration)}` : ""}</p></div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xl"><HeartButton on={favs.has(v.id)} onChange={(n) => onHeart(v, n)} label="Salva tra i preferiti" /></span>
            <button className="btn btn-ghost !min-h-10 !px-4" onClick={onClose} aria-label="Chiudi">Chiudi</button>
          </div>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border-2 border-ink bg-black">
          <iframe key={v.id} src={`https://www.youtube-nocookie.com/embed/${v.id}?rel=0&autoplay=1`} title={v.title} className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
        <button className="btn mt-3 w-full" onClick={() => setUsa(true)}>Usa questo video per creare la scheda del progetto</button>
        {videos.length > 1 && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <button className="btn btn-ghost !min-h-10" onClick={() => setI((i + videos.length - 1) % videos.length)}>Precedente</button>
            <span className="text-sm font-bold text-muted">{i + 1} di {videos.length}</span>
            <button className="btn btn-ghost !min-h-10" onClick={() => setI((i + 1) % videos.length)}>Successivo</button>
          </div>
        )}
      </div>
      {usa && <div onClick={(e) => e.stopPropagation()}><VideoUseDialog video={{ id: v.id, title: v.title, channel: v.channel, duration: v.duration }} onClose={() => setUsa(false)} /></div>}
    </div>
  );
}
