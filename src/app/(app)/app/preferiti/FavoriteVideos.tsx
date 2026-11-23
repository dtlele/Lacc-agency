"use client";
import { useEffect, useRef, useState } from "react";
import HeartButton from "@/components/HeartButton";
import { api } from "@/lib/client";

export type FavVideo = { id: string; title: string; channel: string; duration: number | null };
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function FavoriteVideos({ initial }: { initial: FavVideo[] }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState<FavVideo | null>(null);
  async function remove(id: string) {
    await api(`/api/favorites/videos?id=${encodeURIComponent(id)}`, "DELETE");
    setItems((l) => l.filter((v) => v.id !== id));
  }
  if (items.length === 0) return <p className="text-muted">Non hai ancora video preferiti. Nella ricerca video tocca il cuore per salvarli qui.</p>;
  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((v) => (
          <li key={v.id} className="card relative !p-3">
            <button type="button" onClick={() => setOpen(v)} className="grid w-full cursor-pointer gap-2 text-left" aria-label={`Guarda: ${v.title}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-full rounded-xl border-2 border-ink object-cover" />
              <b className="block pr-12">{v.title || "Video"}</b>
              <span className="text-sm text-muted">{[v.channel, v.duration ? fmt(v.duration) : ""].filter(Boolean).join(" · ")}</span>
            </button>
            <span className="absolute right-3 top-3">
              <HeartButton on label={`Togli ${v.title || "il video"} dai preferiti`} onChange={() => remove(v.id)} />
            </span>
          </li>
        ))}
      </ul>
      {open && <Player v={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function Player({ v, onClose }: { v: FavVideo; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    ref.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; prev?.focus(); };
  }, [onClose]);
  return (
    <div className="fade-in fixed inset-0 z-50 flex items-end justify-center bg-ink/70 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Video" onClick={onClose}>
      <div ref={ref} tabIndex={-1} className="card max-h-[92dvh] w-full max-w-3xl overflow-y-auto !rounded-b-none sm:!rounded-b-[20px]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div><h2 className="text-xl">{v.title}</h2><p className="text-sm text-muted">{v.channel}</p></div>
          <button className="btn btn-ghost !min-h-10 !px-4" onClick={onClose} aria-label="Chiudi">Chiudi</button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border-2 border-ink bg-black">
          <iframe src={`https://www.youtube-nocookie.com/embed/${v.id}?rel=0&autoplay=1`} title={v.title} className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      </div>
    </div>
  );
}
