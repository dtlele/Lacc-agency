"use client";
import type { Step } from "@/lib/pattern";

/** Passi spuntabili + schema a punti: le righe del passo corrente sono evidenziate. Lo schema si legge dal basso verso l'alto. */
export default function PatternView({ rows, steps, done, onToggle }: { rows: string[]; steps: Step[]; done: number[]; onToggle: (i: number) => void }) {
  const next = steps.findIndex((_, i) => !done.includes(i));
  const lit = new Set(next >= 0 ? steps[next].r : []);
  const pct = Math.round((done.length / steps.length) * 100);
  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
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
                  className={`grid w-full grid-cols-[auto_1fr] gap-3 rounded-2xl border-2 border-ink p-3 text-left ${ok ? "bg-menta" : "bg-bg"} ${i === next ? "outline outline-[3px] outline-offset-2 outline-rosa" : ""}`}>
                  <span className={`grid h-8 w-8 place-items-center rounded-full border-2 border-ink font-display ${ok ? "bg-rosa text-white" : "bg-lilla"}`}>{ok ? "✓" : i + 1}</span>
                  <span><b className="block">{s.t}</b><span className="text-sm">{s.s}</span></span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>
      <section aria-label="Schema" className="card">
        <h2 className="mb-2 text-xl">Schema</h2>
        <p className="mb-3 text-sm text-muted">Si legge dal basso verso l&apos;alto. In giallo le righe del passo da fare.</p>
        <div className="overflow-x-auto p-1">
          <div role="img" aria-label="Schema a quadretti del progetto" className="grid w-max min-w-full gap-[3px]" style={{ gridTemplateColumns: `repeat(${rows[0].length}, minmax(22px, 1fr))` }}>
            {rows.map((r, y) => [...r].map((ch, x) => <div key={y + "-" + x} className={`cella ${ch === "#" ? "pieno" : ""} ${lit.has(y) ? "evid" : ""}`}>{ch === "#" ? "|" : ""}</div>))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm font-bold">
          <span className="flex items-center gap-2"><i className="inline-block h-4 w-4 rounded border-2 border-ink bg-rosa" />Maglia</span>
          <span className="flex items-center gap-2"><i className="inline-block h-4 w-4 rounded border-2 border-ink bg-white" />Vuoto</span>
        </div>
      </section>
    </div>
  );
}
