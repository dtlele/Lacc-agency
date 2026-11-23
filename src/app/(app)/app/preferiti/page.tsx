import Link from "next/link";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import FavoriteVideos, { type FavVideo } from "./FavoriteVideos";

export const metadata = { title: "Preferiti" };

export default async function Preferiti() {
  const s = await requireUser();
  const progetti = await q<{ id: number; name: string; thumb: string | null; kind: string; n_steps: number; n_done: number }>(
    "SELECT id,name,thumb,kind,jsonb_array_length(steps) AS n_steps,jsonb_array_length(done) AS n_done FROM projects WHERE user_id=$1 AND favorite ORDER BY updated_at DESC", [s.uid]);
  const video = await q<FavVideo>(
    "SELECT video_id AS id,title,channel,duration FROM video_favorites WHERE user_id=$1 ORDER BY created_at DESC LIMIT 200", [s.uid]);
  return (
    <div className="grid gap-8">
      <h1 className="text-4xl">Preferiti</h1>
      <section className="grid gap-3">
        <h2 className="text-2xl">Progetti preferiti</h2>
        {progetti.length === 0 ? (
          <p className="text-muted">Nessun progetto preferito. Tocca il cuore su un progetto per trovarlo qui.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {progetti.map((p) => (
              <li key={p.id}>
                <Link href={`/app/progetti/${p.id}`} className="card flex h-full items-center gap-4 hover:bg-rosa-chiaro/40">
                  {p.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumb} alt="" className="h-20 w-20 shrink-0 rounded-2xl border-2 border-ink object-cover" />
                  ) : (
                    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-2 border-ink bg-lilla text-sm font-bold">{p.kind === "rounds" ? "giri" : ""}</span>
                  )}
                  <span className="grid gap-1">
                    <b className="block text-lg">{p.name}</b>
                    <span className="text-sm text-muted">{p.n_done === p.n_steps ? "Finito" : `${p.n_done} passi su ${p.n_steps}`}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="grid gap-3">
        <h2 className="text-2xl">Video preferiti</h2>
        <FavoriteVideos initial={video} />
      </section>
    </div>
  );
}
