import Link from "next/link";
import { q } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Home" };

const AZIONI = [
  { href: "/app/schema", t: "Crea uno schema", s: "Da una foto ai punti e ai passi", bg: "bg-rosa-chiaro" },
  { href: "/app/chat", t: "Chiedi all'assistente", s: "Punti, filati, misure, errori", bg: "bg-lilla" },
  { href: "/app/video", t: "Cerca un video", s: "Tutorial per punto o progetto", bg: "bg-menta" },
  { href: "/app/materiali", t: "Trova i materiali", s: "Uncinetti e filati su Amazon", bg: "bg-pesca" },
];

export default async function Home() {
  const s = await requireUser();
  const COLS = "id,name,thumb,favorite,jsonb_array_length(steps) AS n_steps,jsonb_array_length(done) AS n_done";
  type Riga = { id: number; name: string; thumb: string | null; n_steps: number; n_done: number; favorite: boolean };
  const [recenti, preferiti, videoFav] = await Promise.all([
    q<Riga>(`SELECT ${COLS} FROM projects WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 3`, [s.uid]),
    q<Riga>(`SELECT ${COLS} FROM projects WHERE user_id=$1 AND favorite ORDER BY updated_at DESC LIMIT 3`, [s.uid]),
    q<{ n: number }>("SELECT count(*)::int AS n FROM video_favorites WHERE user_id=$1", [s.uid]),
  ]);
  const nVideoFav = videoFav[0]?.n ?? 0;
  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-4xl sm:text-5xl">{s.name ? `Ciao ${s.name}, cosa crei oggi?` : "Cosa crei oggi?"}</h1>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {AZIONI.map((a) => (
          <li key={a.href}>
            <Link href={a.href} className={`card block h-full ${a.bg} hover:-translate-y-0.5`} style={{ transition: "transform .12s" }}>
              <b className="block font-display text-2xl font-normal">{a.t}</b>
              <span className="text-sm font-bold">{a.s}</span>
            </Link>
          </li>
        ))}
      </ul>
      <section aria-labelledby="h-preferiti">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="h-preferiti" className="flex items-center gap-2 text-2xl">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="#ff4f8b" stroke="#3d1747" strokeWidth="2" strokeLinejoin="round"><path d="M12 21s-8.5-5.4-8.5-11.2A4.8 4.8 0 0 1 12 7.1a4.8 4.8 0 0 1 8.5 2.7C20.5 15.6 12 21 12 21z" /></svg>
            I tuoi preferiti
          </h2>
          {(preferiti.length > 0 || nVideoFav > 0) && <Link href="/app/preferiti" className="font-bold underline">Apri</Link>}
        </div>
        {preferiti.length === 0 && nVideoFav === 0 ? (
          <p className="text-muted">Tocca il <span aria-hidden="true">♥</span> su un progetto o su un video per ritrovarlo qui. <Link href="/app/preferiti" className="font-bold text-accent underline">Vai ai preferiti</Link>.</p>
        ) : (
          <>
            <ul className="grid gap-3 sm:grid-cols-3">
              {preferiti.map((p) => (
                <li key={p.id}>
                  <Link href={`/app/progetti/${p.id}`} className="card flex items-center gap-3 !p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {p.thumb ? <img src={p.thumb} alt="" className="h-14 w-14 rounded-xl border-2 border-ink object-cover" /> : <span className="h-14 w-14 rounded-xl border-2 border-ink bg-rosa-chiaro" />}
                    <span><b className="block">{p.name}</b><span className="text-sm text-muted">{p.n_done} di {p.n_steps} passi</span></span>
                  </Link>
                </li>
              ))}
            </ul>
            {nVideoFav > 0 && (
              <p className="mt-3 text-sm font-bold text-muted">
                e {nVideoFav} {nVideoFav === 1 ? "video salvato" : "video salvati"} · <Link href="/app/preferiti" className="text-accent underline">guardali</Link>
              </p>
            )}
          </>
        )}
      </section>
      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-2xl">Riprendi un progetto</h2>
          {recenti.length > 0 && <Link href="/app/progetti" className="font-bold underline">Tutti</Link>}
        </div>
        {recenti.length === 0 ? (
          <p className="text-muted">Non hai ancora progetti salvati. <Link href="/app/schema" className="font-bold text-accent underline">Crea il primo</Link>.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-3">
            {recenti.map((p) => (
              <li key={p.id}>
                <Link href={`/app/progetti/${p.id}`} className="card flex items-center gap-3 !p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.thumb ? <img src={p.thumb} alt="" className="h-14 w-14 rounded-xl border-2 border-ink object-cover" /> : <span className="h-14 w-14 rounded-xl border-2 border-ink bg-lilla" />}
                  <span><b className="block">{p.favorite && <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="Preferito" className="mr-1 inline align-[-2px]" fill="#ff4f8b" stroke="#3d1747" strokeWidth="2" strokeLinejoin="round"><path d="M12 21s-8.5-5.4-8.5-11.2A4.8 4.8 0 0 1 12 7.1a4.8 4.8 0 0 1 8.5 2.7C20.5 15.6 12 21 12 21z" /></svg>}{p.name}</b><span className="text-sm text-muted">{p.n_done} di {p.n_steps} passi</span></span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
