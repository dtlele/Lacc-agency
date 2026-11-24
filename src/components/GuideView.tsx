"use client";
import { useState } from "react";
import type { GuideMeta } from "@/lib/guide";
import type { Step } from "@/lib/pattern";
import WorkMode from "./WorkMode";

const LANG_NAMES: Record<string, string> = { it: "Italiano", en: "English", es: "Español", fr: "Français", de: "Deutsch", pt: "Português" };
const focus = "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-rosa";

/** Scheda di progetto ricavata da un video: info, materiali, glossario, passi spuntabili, consigli e video. */
export default function GuideView({ meta, steps, done, onToggle, projectId, title }: { meta: GuideMeta; steps: Step[]; done: number[]; onToggle: (i: number) => void; projectId: number; title: string }) {
  const [player, setPlayer] = useState(false);
  const [work, setWork] = useState(false);
  const next = steps.findIndex((_, i) => !done.includes(i));
  const pct = steps.length ? Math.round((done.length / steps.length) * 100) : 0;
  const url = `https://www.youtube.com/watch?v=${meta.videoId}`;
  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      {work && <WorkMode steps={steps} done={done} onToggle={onToggle} onClose={() => setWork(false)} storeKey={`g${projectId}`} videoId={meta.videoId} title={title} />}
      <button type="button" onClick={() => setWork(true)} className={`btn min-h-16 text-xl lg:col-span-2 ${focus}`}>
        {done.length > 0 && done.length < steps.length ? "Continua a lavorare" : "Inizia a lavorare"} · un passo alla volta
      </button>
      <section aria-label="Passi" className="card">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-bold">{done.length === steps.length ? "Fatto! Il lavoro è finito." : `${done.length} passi su ${steps.length}`}</p>
          <span className="text-sm font-bold text-muted">{pct}%</span>
        </div>
        <div className="mb-4 h-3 overflow-hidden rounded-full border-2 border-ink bg-white" aria-hidden="true"><div className="h-full bg-rosa transition-[width]" style={{ width: pct + "%" }} /></div>
        <ol className="grid gap-2">
          {steps.map((s, i) => {
            const ok = done.includes(i);
            return (
              <li key={i}>
                <button onClick={() => onToggle(i)} aria-pressed={ok}
                  className={`grid w-full grid-cols-[auto_1fr] gap-3 rounded-2xl border-2 border-ink p-3 text-left ${focus} ${ok ? "bg-menta" : "bg-bg"} ${i === next ? "outline outline-[3px] outline-offset-2 outline-rosa" : ""}`}>
                  <span className={`grid h-8 w-8 place-items-center rounded-full border-2 border-ink font-display ${ok ? "bg-rosa text-white" : "bg-lilla"}`}>{ok ? "✓" : i + 1}</span>
                  <span><b className="block">{s.t}</b><span className="text-sm">{s.s}</span></span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-5">
        <section aria-label="Scheda informativa" className="card">
          {meta.summary && <p className="mb-3">{meta.summary}</p>}
          <p className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-bold">
            {meta.difficulty && <span>Difficoltà: {meta.difficulty}</span>}
            {meta.timeNeeded && <span>Tempo: {meta.timeNeeded}</span>}
            <span className="text-muted">Lingua della scheda: {LANG_NAMES[meta.lang] ?? meta.lang}</span>
          </p>
          {meta.materials.length > 0 && (<>
            <h2 className="mb-1 text-xl">Materiali</h2>
            <ul className="mb-3 list-disc pl-5 text-sm">{meta.materials.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </>)}
          {meta.glossary.length > 0 && (<>
            <h2 className="mb-1 text-xl">Glossario dei punti</h2>
            <dl className="mb-3 grid gap-1 text-sm">{meta.glossary.map((g, i) => <div key={i}><dt className="inline font-bold">{g.term}</dt> <dd className="inline">→ {g.meaning}</dd></div>)}</dl>
          </>)}
          {meta.tips.length > 0 && (<>
            <h2 className="mb-1 text-xl">Consigli</h2>
            <ul className="list-disc pl-5 text-sm">{meta.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
          </>)}
        </section>

        <section aria-label="Video" className="card">
          <p className="mb-2 text-sm">
            <a href={url} target="_blank" rel="noopener noreferrer" className={`font-bold underline ${focus}`}>Guarda il video su YouTube</a>
            {meta.channel && <span className="text-muted"> · {meta.channel}</span>}
          </p>
          <button type="button" className={`btn btn-ghost ${focus}`} aria-expanded={player} onClick={() => setPlayer((v) => !v)}>{player ? "Nascondi il video" : "Mostra il video qui"}</button>
          {player && (
            <div className="mt-3 aspect-video overflow-hidden rounded-2xl border-2 border-ink">
              <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${meta.videoId}`} title={meta.videoTitle || "Video del tutorial"}
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
