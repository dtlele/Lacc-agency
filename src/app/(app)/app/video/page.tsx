"use client";
import { useState } from "react";

const LIVELLI = ["", "per principianti", "livello intermedio", "per esperte"];
const SUGGERITI = ["amigurumi", "punto ventaglio", "granny square", "borsa a rete", "anello magico"];

export default function Video() {
  const [q, setQ] = useState("");
  const [liv, setLiv] = useState("");
  const [go, setGo] = useState("");
  const termine = go ? `uncinetto ${go}${liv ? " " + liv : ""} tutorial` : "";
  const yt = termine ? `https://www.youtube.com/results?search_query=${encodeURIComponent(termine)}` : "";
  const pin = termine ? `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(termine)}` : "";
  return (
    <div className="grid max-w-2xl gap-5">
      <h1 className="text-4xl">Cerca un video</h1>
      <form onSubmit={(e) => { e.preventDefault(); setGo(q.trim()); }} className="card grid gap-3">
        <label className="font-bold">Cosa vuoi imparare?
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Es. amigurumi, punto ventaglio, borsa" className="input mt-1" maxLength={80} />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Livello">
          {LIVELLI.map((l) => <button type="button" key={l} className="chip" aria-pressed={liv === l} onClick={() => setLiv(l)}>{l || "Tutti i livelli"}</button>)}
        </div>
        <button className="btn justify-self-start" disabled={!q.trim()}>Cerca</button>
      </form>
      <div className="flex flex-wrap gap-2" aria-label="Idee">
        {SUGGERITI.map((s) => <button key={s} className="chip" onClick={() => { setQ(s); setGo(s); }}>{s}</button>)}
      </div>
      {go && (
        <div className="card fade-in grid gap-3 bg-menta">
          <p className="font-bold">Risultati per &ldquo;{go}&rdquo;</p>
          <a className="btn justify-self-start" href={yt} target="_blank" rel="noopener noreferrer">Apri su YouTube</a>
          <a className="btn btn-ghost justify-self-start" href={pin} target="_blank" rel="noopener noreferrer">Apri su Pinterest</a>
        </div>
      )}
      <p className="text-sm text-muted">Per ora la ricerca si apre sul sito scelto. L&apos;elenco dei video direttamente qui, con il controllo &ldquo;creatrice umana&rdquo;, arriva con la chiave di YouTube.</p>
    </div>
  );
}
