"use client";
import type { Step } from "@/lib/pattern";
import AmigurumiPreview from "./AmigurumiPreview";

export type RoundsMeta = { shape?: string; size?: number; rounds?: number[] };

/** Passi spuntabili + anteprima 3D: il giro del primo passo da fare è in giallo. */
export default function RoundsView({ meta, steps, done, onToggle }: { meta: RoundsMeta; steps: Step[]; done: number[]; onToggle: (i: number) => void }) {
  const rounds = meta.rounds ?? [];
  const next = steps.findIndex((_, i) => !done.includes(i));
  const first = next >= 0 ? steps[next].r[0] : undefined;
  // il passo "Chiudi" non ha giri: si evidenzia l'ultimo giro
  const highlight = next >= 0 ? (first ?? rounds.length - 1) : undefined;
  const pct = steps.length ? Math.round((done.length / steps.length) * 100) : 0;
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
      <section aria-label="Anteprima 3D" className="card">
        <h2 className="mb-2 text-xl">Anteprima 3D</h2>
        <p className="mb-3 text-sm text-muted">Trascina per ruotare. In giallo il giro da fare ({rounds.length} giri in tutto).</p>
        <AmigurumiPreview rounds={rounds} highlight={highlight} />
      </section>
    </div>
  );
}
