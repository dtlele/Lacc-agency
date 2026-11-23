import Link from "next/link";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "I miei progetti" };

export default async function Progetti() {
  const s = await requireUser();
  const items = await q<{ id: number; name: string; thumb: string | null; n_steps: number; n_done: number }>(
    "SELECT id,name,thumb,jsonb_array_length(steps) AS n_steps,jsonb_array_length(done) AS n_done FROM projects WHERE user_id=$1 ORDER BY updated_at DESC", [s.uid]);
  return (
    <div className="grid gap-5">
      <h1 className="text-4xl">I miei progetti</h1>
      {items.length === 0 ? (
        <div className="card max-w-md">
          <p className="font-bold">Non hai ancora salvato nessun progetto.</p>
          <p className="mt-1 text-muted">Parti da una foto: ne ricavo lo schema e i passi.</p>
          <Link href="/app/schema" className="btn mt-4">Crea il primo schema</Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={p.id}>
              <Link href={`/app/progetti/${p.id}`} className="card flex h-full items-center gap-4 hover:bg-rosa-chiaro/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.thumb ? <img src={p.thumb} alt="" className="h-20 w-20 shrink-0 rounded-2xl border-2 border-ink object-cover" /> : <span className="h-20 w-20 shrink-0 rounded-2xl border-2 border-ink bg-lilla" />}
                <span>
                  <b className="block text-lg">{p.name}</b>
                  <span className="text-sm text-muted">{p.n_done === p.n_steps ? "Finito" : `${p.n_done} passi su ${p.n_steps}`}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
