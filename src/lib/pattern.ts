export type Step = { t: string; s: string; r: number[] };

/** Convalida la griglia a punti (# = maglia, . = vuoto) ricevuta dal client. */
export function cleanRows(rows: unknown): string[] | null {
  if (!Array.isArray(rows) || rows.length < 4 || rows.length > 40) return null;
  if (rows.some((r) => typeof r !== "string" || r.length < 4 || r.length > 40 || /[^#.]/.test(r))) return null;
  if (new Set(rows.map((r: string) => r.length)).size !== 1) return null;
  return rows as string[];
}

/** Ripulisce i passi (da client o AI): lunghezze massime e indici di riga validi. */
export function cleanSteps(steps: unknown, nRows: number): Step[] {
  return (Array.isArray(steps) ? steps : []).slice(0, 10).map((p: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
    t: String(p?.t ?? "").slice(0, 60),
    s: String(p?.s ?? "").slice(0, 240),
    r: (Array.isArray(p?.r) ? p.r : []).filter((x: unknown) => Number.isInteger(x) && (x as number) >= 0 && (x as number) < nRows),
  })).filter((p) => p.t);
}
