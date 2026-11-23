"use client";
import { useEffect, useRef, useState } from "react";

/** Cuoricino per i preferiti: aggiornamento subito, ripristino e messaggio se il salvataggio fallisce. */
export default function HeartButton({ on, onChange, label }: { on: boolean; onChange: (next: boolean) => void | Promise<void>; label: string }) {
  const [shown, setShown] = useState(on);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { setShown(on); }, [on]);

  async function click(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (busy) return;
    const next = !shown;
    setShown(next); setErr(""); setBusy(true);
    if (next && !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      btn.current?.animate?.([{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }], { duration: 280, easing: "ease-out" });
    try { await onChange(next); }
    catch (x) { setShown(!next); setErr(x instanceof Error && x.message ? x.message : "Non sono riuscita a salvare. Riprova."); }
    finally { setBusy(false); }
  }

  return (
    <span className="relative inline-flex">
      <button ref={btn} type="button" aria-pressed={shown} aria-label={label} onClick={click}
        className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-ink bg-white">
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill={shown ? "#ff4f8b" : "none"} stroke="#3d1747" strokeWidth="2" strokeLinejoin="round">
          <path d="M12 21s-8.5-5.4-8.5-11.2A4.8 4.8 0 0 1 12 7.1a4.8 4.8 0 0 1 8.5 2.7C20.5 15.6 12 21 12 21z" />
        </svg>
      </button>
      {err && <span role="alert" className="absolute right-0 top-12 z-10 w-48 rounded-xl border-2 border-ink bg-white p-2 text-xs font-bold text-warn">{err}</span>}
    </span>
  );
}
