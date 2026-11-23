"use client";
import { useState } from "react";

const CATEGORIES = ["Amigurumi", "Borse", "Coperte", "Scialli", "Abbigliamento", "Accessori"];
const DIFFICULTIES = ["Facile", "Media", "Esperta"];
const COLORS = ["Rosa", "Lilla", "Menta", "Giallo"];

type Props = { id: number; category: string; difficulty: string; color: string };

export default function ProjectMeta({ id, category, difficulty, color }: Props) {
  const [v, setV] = useState({ category, difficulty, color });
  const [msg, setMsg] = useState("");

  async function change(field: "category" | "difficulty" | "color", value: string) {
    const prev = v;
    setV({ ...v, [field]: value });
    setMsg("");
    try {
      const r = await fetch(`/api/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [field]: value }) });
      if (!r.ok) throw new Error();
      setMsg("Salvato");
    } catch {
      setV(prev);
      setMsg("Non sono riuscita a salvare");
    }
  }

  const cats = category && !CATEGORIES.includes(category) ? [...CATEGORIES, category] : CATEGORIES;
  return (
    <div className="card mb-4 grid gap-3 sm:grid-cols-3">
      <label className="grid gap-1 text-sm font-bold">Categoria
        <select className="input" value={v.category} onChange={(e) => change("category", e.target.value)}>
          <option value="">Nessuna</option>
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-bold">Difficoltà
        <select className="input" value={v.difficulty} onChange={(e) => change("difficulty", e.target.value)}>
          <option value="">Nessuna</option>
          {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-bold">Colore
        <select className="input" value={v.color} onChange={(e) => change("color", e.target.value)}>
          <option value="">Nessuno</option>
          {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      {msg && <p className="text-sm font-bold sm:col-span-3" role="status">{msg}</p>}
    </div>
  );
}
