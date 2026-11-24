"use client";
import { useState, type ReactNode } from "react";

export type StitchKey = "cat" | "mbss" | "mb" | "mma" | "ma" | "aum" | "dim" | "cm";

/** Disegni dei simboli standard degli schemi a uncinetto (viewBox 32x32), nome e come si fa. */
export const STITCHES: Record<StitchKey, { name: string; how: string; draw: ReactNode }> = {
  cat: { name: "Catenella", how: "Passa il filo e tiralo dentro l'asola.", draw: <ellipse cx="16" cy="16" rx="11" ry="5.5" /> },
  mbss: { name: "Maglia bassissima", how: "Infila l'uncinetto, passa il filo e tiralo anche nell'asola.", draw: <circle cx="16" cy="16" r="4.5" fill="currentColor" /> },
  mb: { name: "Maglia bassa", how: "Infila, prendi il filo, tira fuori, prendi il filo e chiudi le due asole.", draw: <path d="M16 6v20M6 16h20" /> },
  mma: { name: "Mezza maglia alta", how: "Gettata, infila, tira fuori, prendi il filo e chiudi le tre asole.", draw: <path d="M8 7h16M16 7v20" /> },
  ma: { name: "Maglia alta", how: "Gettata, infila, tira fuori, poi chiudi le asole due alla volta.", draw: <path d="M8 7h16M16 7v20M11 19l10-5" /> },
  aum: { name: "Aumento", how: "Due maglie nella stessa maglia della base.", draw: <path d="M16 27L8 6M16 27l8-21M5 12h6M21 12h6" /> },
  dim: { name: "Diminuzione", how: "Due maglie unite in una sola.", draw: <path d="M8 27l8-21M24 27L16 6M5 21h6M21 21h6" /> },
  cm: { name: "Cerchio magico", how: "Anello regolabile da cui si parte: poi si stringe il filo.", draw: <><circle cx="16" cy="16" r="10" /><circle cx="16" cy="16" r="3" /></> },
};

const isLetter = (c?: string) => !!c && c.toLowerCase() !== c.toUpperCase();
const has = (hay: string, w: string) => {
  for (let i = hay.indexOf(w); i >= 0; i = hay.indexOf(w, i + 1)) if (!isLetter(hay[i - 1]) && !isLetter(hay[i + w.length])) return true;
  return false;
};
// parole intere (nomi e sigle) per ciascun punto; "ma" è anche la congiunzione italiana, quindi vale solo dopo un numero ("5 ma")
const WORDS: [StitchKey, string[]][] = [
  ["cm", ["cerchio magico", "anello magico", "cm magico"]],
  ["mbss", ["mbss", "maglia bassissima", "punto bassissimo"]],
  ["mma", ["mma", "mezza maglia alta", "mezza alta"]],
  ["mb", ["mb", "maglia bassa", "punto basso"]],
  ["ma", ["maglia alta", "punto alto"]],
  ["cat", ["catenella", "catenelle", "cat"]],
  ["aum", ["aumento", "aumenti", "aum"]],
  ["dim", ["diminuzione", "diminuzioni", "dim"]],
];

/** Punti nominati nel testo di un passo (al massimo `max`), nell'ordine in cui conviene mostrarli. */
export function stitchesIn(text: string, max = 5): StitchKey[] {
  const hay = text.toLowerCase();
  const out: StitchKey[] = [];
  for (const [k, words] of WORDS) {
    if (words.some((w) => has(hay, w)) || (k === "ma" && /\d\s*ma(?![\p{L}])/u.test(hay))) out.push(k);
  }
  return out.slice(0, max);
}

/** Simboli dei punti nominati nel passo: chip compatti, un tocco mostra come si fa. */
export function StitchRow({ text }: { text: string }) {
  const keys = stitchesIn(text, 4);
  const [open, setOpen] = useState<StitchKey | null>(null);
  if (!keys.length) return null;
  return (
    <div className="mt-3" aria-label="Simboli dei punti">
      <ul className="flex flex-wrap gap-1.5">
        {keys.map((k) => (
          <li key={k}>
            <button type="button" aria-pressed={open === k} onClick={() => setOpen(open === k ? null : k)}
              className={`flex min-h-11 items-center gap-1.5 rounded-full border-2 border-ink py-1 pl-1.5 pr-3 text-sm font-bold ${open === k ? "bg-menta" : "bg-white"}`}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#3d1747" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rounded-full bg-rosa-chiaro p-0.5">{STITCHES[k].draw}</svg>
              {STITCHES[k].name}
            </button>
          </li>
        ))}
      </ul>
      {open && <p className="mt-1.5 rounded-xl bg-menta px-3 py-2 text-sm font-bold" role="status">{STITCHES[open].how}</p>}
    </div>
  );
}
