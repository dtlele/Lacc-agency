"use client";

// Contatore globale delle richieste che modificano dati: serve a mostrare il caricamento e a bloccare i tocchi mentre il sito lavora.
let pending = 0;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
export const subscribeBusy = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const getBusy = () => pending;

export async function api<T = any>(url: string, method = "GET", body?: unknown, quiet = false): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const mutating = method !== "GET" && !quiet; // quiet: salvataggi continui (spunte dei passi) che non devono bloccare
  if (mutating) { pending++; emit(); }
  try {
    const r = await fetch(url, { method, headers: body ? { "content-type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const d = await r.json().catch(() => ({}));
    if (r.status === 401 && !url.includes("/auth/")) { location.href = "/accedi"; throw new Error("sessione scaduta"); }
    if (!r.ok) throw new Error(d.error || `Errore ${r.status}`);
    return d;
  } finally {
    if (mutating) { pending--; emit(); }
  }
}
