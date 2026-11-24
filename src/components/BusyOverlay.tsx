"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getBusy, subscribeBusy } from "@/lib/client";

/** Mentre il sito salva, cancella o analizza: velo che blocca i tocchi e dice che sta lavorando. Compare solo se l'attesa supera ~0,3 s, per non lampeggiare. */
export default function BusyOverlay({ force = false }: { force?: boolean }) {
  const n = useSyncExternalStore(subscribeBusy, getBusy, () => 0);
  const on = n > 0 || force;
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!on) { setShow(false); return; }
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, [on]);
  useEffect(() => {
    document.body.toggleAttribute("aria-busy", on);
    return () => document.body.removeAttribute("aria-busy");
  }, [on]);
  if (!on || !show) return <p role="status" aria-live="polite" className="sr-only" />;
  return (
    <div className="fixed inset-0 z-[60] grid cursor-wait place-items-center bg-bg/60" role="status" aria-live="assertive">
      <div className="card flex items-center gap-3 !p-4">
        <span className="h-7 w-7 animate-spin rounded-full border-4 border-line border-t-rosa" aria-hidden="true" />
        <b>Sto lavorando… un attimo</b>
      </div>
    </div>
  );
}
