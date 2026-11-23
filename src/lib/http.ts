import { NextResponse } from "next/server";
/** id numerico sicuro per il database (intero positivo che sta in un INT di Postgres); null se non valido */
export const toId = (v: unknown): number | null => { const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v; return typeof n === "number" && Number.isInteger(n) && n > 0 && n <= 2147483647 ? n : null; };
/** Corpo JSON della richiesta come OGGETTO semplice: vuoto -> {}, JSON valido ma non-oggetto (null, array, numero, stringa) -> {},
 *  JSON rotto -> Response 400. Cosi' le rotte non crollano con "Cannot read properties of null". */
export async function readBody(req: Request): Promise<Record<string, any>> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const text = await req.text();
  if (!text.trim()) return {};
  let v: unknown;
  try { v = JSON.parse(text); } catch { throw json({ error: "Richiesta non valida (JSON)" }, 400); }
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, any>) : {}; // eslint-disable-line @typescript-eslint/no-explicit-any
}
export const json = (d: unknown, status = 200) => NextResponse.json(d, { status });
export async function guard<T>(fn: () => Promise<T>): Promise<Response> {
  try { const r = await fn(); return r instanceof Response ? r : json(r); }
  catch (e: any) {
    if (e instanceof Response) return e;
    if (e instanceof SyntaxError && /JSON/i.test(e.message)) return json({ error: "Richiesta non valida (JSON)" }, 400); // corpo malformato: errore del client, non del server
    if (/prerender|DYNAMIC_SERVER|BAILOUT/i.test(String(e?.digest ?? "") + String(e?.message ?? ""))) throw e; // segnali interni di Next
    console.error(e); return json({ error: String(e?.message ?? e).slice(0, 200) }, 500);
  }
}
