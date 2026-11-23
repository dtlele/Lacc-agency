import Link from "next/link";

export const metadata = { title: "Termini" };

export default function Termini() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/" className="font-display text-2xl text-accent">Filo &amp; Fantasia</Link>
      <h1 className="mt-6 text-4xl">Termini di utilizzo</h1>
      <p className="mt-2 text-sm text-muted">Bozza di lavoro: da completare con i dati del titolare prima del lancio pubblico.</p>
      <div className="mt-6 grid gap-4">
        <p><b>Servizio.</b> Filo &amp; Fantasia è uno strumento gratuito per creare schemi all&apos;uncinetto da una foto, seguire i passi, chiedere consigli a un assistente AI e trovare materiali.</p>
        <p><b>Assistente AI.</b> Le risposte e gli schemi sono generati automaticamente e possono contenere errori: controlla sempre misure, quantità e fascette dei filati.</p>
        <p><b>Uso corretto.</b> L&apos;assistente ha limiti giornalieri per utente. Non usare il servizio per attività automatizzate o abusive.</p>
        <p><b>Link affiliati.</b> Alcuni link ai materiali possono essere affiliati: il prezzo per te non cambia.</p>
      </div>
    </main>
  );
}
