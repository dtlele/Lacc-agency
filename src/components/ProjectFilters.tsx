"use client";
import Link from "next/link";
import { useMemo, useState } from "react";

export type ProjectItem = {
  id: number; name: string; thumb: string | null; kind: "grid" | "rounds";
  category: string; difficulty: string; color: string; n_steps: number; n_done: number;
};

const CATEGORIES = ["Amigurumi", "Borse", "Coperte", "Scialli", "Abbigliamento", "Accessori"];
const DIFFICULTIES = ["Facile", "Media", "Esperta"];
const COLORS = ["Rosa", "Lilla", "Menta", "Giallo"];
const COLOR_BG: Record<string, string> = { Rosa: "bg-rosa-chiaro", Lilla: "bg-lilla", Menta: "bg-menta", Giallo: "bg-giallo" };

export default function ProjectFilters({ items }: { items: ProjectItem[] }) {
  const [cat, setCat] = useState("");
  const [diff, setDiff] = useState("");
  const [col, setCol] = useState("");
  const [text, setText] = useState("");

  const cats = useMemo(() => CATEGORIES.filter((c) => items.some((p) => p.category === c)), [items]);
  const shown = useMemo(() => {
    const t = text.trim().toLowerCase();
    return items.filter((p) =>
      (!cat || p.category === cat) && (!diff || p.difficulty === diff) && (!col || p.color === col) &&
      (!t || p.name.toLowerCase().includes(t)));
  }, [items, cat, diff, col, text]);
  const reset = () => { setCat(""); setDiff(""); setCol(""); setText(""); };

  return (
    <div className="grid gap-4">
      <div className="card grid gap-3">
        <input className="input" type="search" placeholder="Cerca per nome" aria-label="Cerca per nome" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Categoria">
          <button type="button" className="chip" aria-pressed={cat === ""} onClick={() => setCat("")}>Tutte</button>
          {cats.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">Difficoltà
            <select className="input" value={diff} onChange={(e) => setDiff(e.target.value)}>
              <option value="">Tutte</option>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold">Colore
            <select className="input" value={col} onChange={(e) => setCol(e.target.value)}>
              <option value="">Tutti</option>
              {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="card max-w-md">
          <p className="font-bold">Nessun progetto con questi filtri</p>
          <button type="button" className="btn mt-4" onClick={reset}>Azzera i filtri</button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.id}>
              <Link href={`/app/progetti/${p.id}`} className="card flex h-full items-center gap-4 hover:bg-rosa-chiaro/40">
                {p.thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.thumb} alt="" className="h-20 w-20 shrink-0 rounded-2xl border-2 border-ink object-cover" />
                ) : (
                  <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-2 border-ink bg-lilla text-sm font-bold">
                    {p.kind === "rounds" ? "giri" : ""}
                  </span>
                )}
                <span className="grid gap-1">
                  <b className="block text-lg">{p.name}</b>
                  <span className="text-sm text-muted">{p.n_done === p.n_steps ? "Finito" : `${p.n_done} passi su ${p.n_steps}`}</span>
                  <span className="flex flex-wrap gap-1">
                    {p.category && <span className="rounded-full border-2 border-ink bg-menta px-2 text-xs font-bold">{p.category}</span>}
                    {p.difficulty && <span className="rounded-full border-2 border-ink bg-giallo px-2 text-xs font-bold">{p.difficulty}</span>}
                    {p.color && <span className={`rounded-full border-2 border-ink px-2 text-xs font-bold ${COLOR_BG[p.color] ?? "bg-card"}`}>{p.color}</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
