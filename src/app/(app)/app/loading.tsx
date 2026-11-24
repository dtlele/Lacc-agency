/** Mostrato subito quando si cambia pagina dentro l'app, mentre il server prepara i dati. */
export default function Loading() {
  return (
    <div className="grid gap-5" role="status" aria-live="polite" aria-label="Caricamento">
      <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-rosa-chiaro" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-2xl bg-lilla" />
        <div className="h-24 animate-pulse rounded-2xl bg-menta" />
        <div className="h-24 animate-pulse rounded-2xl bg-pesca" />
        <div className="h-24 animate-pulse rounded-2xl bg-rosa-chiaro" />
      </div>
      <p className="font-bold text-muted">Sto caricando…</p>
    </div>
  );
}
