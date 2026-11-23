export const metadata = { title: "Termini di utilizzo" };

const TITOLARE = process.env.NEXT_PUBLIC_TITOLARE || "";

export default function Termini() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <a href="/" className="font-display text-2xl text-accent">Filo &amp; Fantasia</a>
      <h1 className="mt-6 text-4xl">Termini di utilizzo</h1>
      <p className="mt-2 text-sm text-muted">Ultimo aggiornamento: 23 novembre 2026</p>
      {!TITOLARE && <p className="mt-4 rounded-xl border-2 border-ink bg-giallo px-4 py-2 font-bold">I dati del gestore sono in fase di definizione.</p>}
      <div className="mt-6 grid gap-5 leading-relaxed">
        <section><h2 className="text-2xl">Il servizio</h2>
          <p className="mt-1">Filo &amp; Fantasia{TITOLARE ? `, gestito da ${TITOLARE},` : ""} è uno strumento gratuito per creare schemi all&apos;uncinetto da una foto, calcolare i giri di un amigurumi, seguire i passi, cercare tutorial, chiedere consigli a un assistente e trovare i materiali.</p></section>
        <section><h2 className="text-2xl">Il tuo account</h2>
          <p className="mt-1">Sei responsabile della riservatezza della tua password. Puoi eliminare l&apos;account in qualsiasi momento dalla pagina Account. Possiamo sospendere gli account usati in modo abusivo.</p></section>
        <section><h2 className="text-2xl">Assistente e schemi generati</h2>
          <p className="mt-1">Risposte, schemi e passi sono generati automaticamente e possono contenere errori. Controlla sempre misure, quantità e istruzioni sulla fascetta del filato prima di iniziare un lavoro.</p></section>
        <section><h2 className="text-2xl">Le tue foto e i tuoi progetti</h2>
          <p className="mt-1">Restano tuoi. Carica solo foto di cui hai i diritti e che non ritraggono altre persone senza il loro consenso. Ci autorizzi a conservare i progetti che salvi per mostrarteli.</p></section>
        <section><h2 className="text-2xl">Video di terzi</h2>
          <p className="mt-1">I video sono di proprietà dei loro autori e provengono da YouTube. Li mostriamo tramite il player incorporato. Escludiamo i video che dichiarano di essere generati con l&apos;AI, ma non possiamo verificare ogni canale.</p></section>
        <section><h2 className="text-2xl">Uso corretto</h2>
          <p className="mt-1">Chat e ricerca video hanno limiti giornalieri per utente. Non usare il servizio con strumenti automatici, per aggirare i limiti o per attività illecite.</p></section>
        <section><h2 className="text-2xl">Link affiliati</h2>
          <p className="mt-1">Alcuni link ai materiali portano ad Amazon e possono essere affiliati: se acquisti, il sito può ricevere una commissione. Il prezzo per te non cambia.</p></section>
        <section><h2 className="text-2xl">Responsabilità</h2>
          <p className="mt-1">Il servizio è offerto così com&apos;è, senza garanzie di disponibilità continua. Nei limiti consentiti dalla legge non rispondiamo di danni derivanti dall&apos;uso di schemi, consigli o contenuti di terzi.</p></section>
        <section><h2 className="text-2xl">Modifiche</h2>
          <p className="mt-1">Possiamo aggiornare questi termini. La data in cima indica l&apos;ultima versione.</p></section>
      </div>
    </main>
  );
}
