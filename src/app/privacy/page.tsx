export const metadata = { title: "Informativa privacy" };

// Dati del titolare: si impostano su Vercel (NEXT_PUBLIC_TITOLARE, NEXT_PUBLIC_CONTATTO_PRIVACY) senza toccare il codice.
const TITOLARE = process.env.NEXT_PUBLIC_TITOLARE || "";
const CONTATTO = process.env.NEXT_PUBLIC_CONTATTO_PRIVACY || "";

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <a href="/" className="font-display text-2xl text-accent">Filo &amp; Fantasia</a>
      <h1 className="mt-6 text-4xl">Informativa sulla privacy</h1>
      <p className="mt-2 text-sm text-muted">Ultimo aggiornamento: 23 novembre 2026</p>
      {!TITOLARE && <p className="mt-4 rounded-xl border-2 border-ink bg-giallo px-4 py-2 font-bold">I dati del titolare sono in fase di definizione.</p>}
      <div className="mt-6 grid gap-5 leading-relaxed">
        <section><h2 className="text-2xl">Chi tratta i tuoi dati</h2>
          <p className="mt-1">Titolare del trattamento: {TITOLARE || "da definire"}.{CONTATTO ? <> Per esercitare i tuoi diritti scrivi a <a className="underline" href={`mailto:${CONTATTO}`}>{CONTATTO}</a>.</> : null}</p></section>
        <section><h2 className="text-2xl">Quali dati raccogliamo e perché</h2>
          <ul className="mt-1 list-disc pl-5">
            <li><b>Account:</b> email, nome (facoltativo) e password. La password è salvata solo in forma cifrata irreversibile. Serve per creare e proteggere il tuo account (base giuridica: esecuzione del servizio).</li>
            <li><b>Progetti:</b> gli schemi, i passi e le miniature che salvi. Servono a conservarli per te.</li>
            <li><b>Uso del servizio:</b> numero di richieste a chat e ricerca video, e data dell&apos;ultimo accesso. Servono a proteggere il servizio da abusi (interesse legittimo).</li>
            <li><b>Rete:</b> usiamo un&apos;impronta cifrata del tuo indirizzo IP per limitare i tentativi di accesso. L&apos;indirizzo non viene conservato in chiaro.</li>
          </ul></section>
        <section><h2 className="text-2xl">Foto e messaggi</h2>
          <p className="mt-1">La foto che scegli viene ridotta nel tuo browser. All&apos;intelligenza artificiale inviamo solo una miniatura e lo schema a punti, per scrivere i passi. La foto originale non lascia il tuo dispositivo e non viene salvata. I messaggi della chat vengono inoltrati al servizio AI per ottenere la risposta e non vengono salvati da noi.</p></section>
        <section><h2 className="text-2xl">Chi li riceve</h2>
          <ul className="mt-1 list-disc pl-5">
            <li>Vercel, per ospitare il sito.</li>
            <li>Neon, per conservare il database.</li>
            <li>OpenRouter e i modelli AI che instrada (come Google Gemini), per chat e schemi.</li>
            <li>YouTube (youtube-nocookie.com), quando apri un video nel player: Google può ricevere i dati tecnici della visione.</li>
          </ul>
          <p className="mt-1">Alcuni di questi fornitori sono fuori dallo Spazio economico europeo e operano con le garanzie previste dalla legge.</p></section>
        <section><h2 className="text-2xl">Cookie</h2>
          <p className="mt-1">Usiamo solo un cookie tecnico di sessione, necessario per tenerti collegata. Nessun cookie di profilazione né pubblicitario. I link ai materiali portano ad Amazon, che ha le sue regole.</p></section>
        <section><h2 className="text-2xl">Per quanto tempo</h2>
          <p className="mt-1">Fino a quando mantieni l&apos;account. I contatori di uso si cancellano dopo due giorni. Se elimini l&apos;account, i tuoi dati e progetti vengono cancellati subito.</p></section>
        <section><h2 className="text-2xl">I tuoi diritti</h2>
          <p className="mt-1">Dalla pagina Account puoi scaricare tutti i tuoi dati, cambiare la password ed eliminare l&apos;account. Hai inoltre diritto di accesso, rettifica, limitazione, opposizione e di reclamo al Garante per la protezione dei dati personali.</p></section>
      </div>
    </main>
  );
}
