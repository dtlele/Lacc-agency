"use client";
export async function api<T = any>(url: string, method = "GET", body?: unknown): Promise<T> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const r = await fetch(url, { method, headers: body ? { "content-type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401 && !url.includes("/auth/")) { location.href = "/accedi"; throw new Error("sessione scaduta"); }
  if (!r.ok) throw new Error(d.error || `Errore ${r.status}`);
  return d;
}
