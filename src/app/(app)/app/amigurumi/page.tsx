"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { amigurumiRounds, roundsToSteps, MIN_DIAMETER, MAX_DIAMETER, type Shape } from "@/lib/amigurumi";
import AmigurumiPreview from "@/components/AmigurumiPreview";

const FORME: [Shape, string][] = [["sfera", "Sfera"], ["cilindro", "Cilindro"], ["cono", "Cono"], ["uovo", "Uovo"]];

export default function Amigurumi() {
  const router = useRouter();
  const [shape, setShape] = useState<Shape>("sfera");
  const [diam, setDiam] = useState(10);
  const [nome, setNome] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const rounds = useMemo(() => amigurumiRounds(shape, diam), [shape, diam]);
  const steps = useMemo(() => roundsToSteps(rounds), [rounds]);
  const forma = FORME.find(([v]) => v === shape)?.[1] ?? "";
  const nomeFinale = nome.trim() || `Amigurumi ${forma.toLowerCase()} ${diam} cm`;

  async function salva() {
    if (busy) return;
    setBusy(true); setErr("");
    try {
      const r = await api<{ id: number }>("/api/projects", "POST", {
        kind: "rounds", name: nomeFinale, meta: { shape, size: diam, rounds }, steps,
        category: "Amigurumi", difficulty: "Facile",
      });
      router.push(`/app/progetti/${r.id}`);
    } catch (x) { setErr((x as Error).message); setBusy(false); }
  }

  return (
    <div className="grid gap-5">
      <h1 className="text-4xl">Amigurumi a giri</h1>
      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <div className="grid gap-5">
          <section className="card grid gap-4" aria-label="Forma e misura">
            <div>
              <p className="mb-2 font-bold">Che forma vuoi?</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Forma">
                {FORME.map(([v, l]) => <button type="button" key={v} className="chip" aria-pressed={shape === v} onClick={() => setShape(v)}>{l}</button>)}
              </div>
            </div>
            <label className="font-bold">Diametro: {diam} cm
              <input type="range" min={MIN_DIAMETER} max={MAX_DIAMETER} value={diam} onChange={(e) => setDiam(Number(e.target.value))} className="mt-1 block w-full" />
            </label>
            <label className="font-bold">Oppure scrivilo qui (da {MIN_DIAMETER} a {MAX_DIAMETER} cm)
              <input type="number" inputMode="numeric" min={MIN_DIAMETER} max={MAX_DIAMETER} value={diam} className="input mt-1"
                onChange={(e) => { const n = Math.round(Number(e.target.value)); if (Number.isFinite(n)) setDiam(Math.min(MAX_DIAMETER, Math.max(MIN_DIAMETER, n))); }} />
            </label>
            <p className="text-sm text-muted">Calcolato per un filo da amigurumi con circa 2,2 maglie basse ogni cm. Giri: {rounds.length}, al massimo {Math.max(...rounds)} maglie.</p>
          </section>
          <section className="card" aria-label="Giri">
            <h2 className="mb-3 text-xl">I giri</h2>
            <ol className="grid gap-2">
              {steps.map((s, i) => (
                <li key={i} className="rounded-2xl border-2 border-ink bg-bg p-3"><b className="block">{s.t}</b><span className="text-sm">{s.s}</span></li>
              ))}
            </ol>
          </section>
        </div>
        <div className="grid gap-5">
          <section className="card" aria-label="Anteprima">
            <h2 className="mb-2 text-xl">Anteprima</h2>
            <p className="mb-3 text-sm text-muted">Trascina per ruotarla.</p>
            <AmigurumiPreview rounds={rounds} />
          </section>
          <section className="card grid gap-3" aria-label="Salva">
            <label className="font-bold">Nome del progetto
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder={nomeFinale} className="input mt-1" maxLength={60} />
            </label>
            <button className="btn justify-self-start" onClick={salva} disabled={busy}>{busy ? "Salvo…" : "Salva nei progetti"}</button>
            <p role="status" aria-live="polite" className="min-h-6 font-bold text-muted">{err}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
