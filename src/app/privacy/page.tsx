
export const metadata = { title: "Privacy" };

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <a href="/" className="font-display text-2xl text-accent">Filo &amp; Fantasia</a>
      <h1 className="mt-6 text-4xl">Informativa privacy</h1>
      <p className="mt-2 text-sm text-muted">Bozza di lavoro: da completare con i dati del titolare prima del lancio pubblico.</p>
      <div className="mt-6 grid gap-4">
        <p><b>Dati che conserviamo.</b> Email, nome (se lo inserisci), password (solo in forma cifrata irreversibile), i progetti che salvi con le relative miniature.</p>
        <p><b>Foto.</b> La foto che carichi per creare uno schema viene ridotta nel tuo browser. Ne inviamo a un servizio di intelligenza artificiale solo una miniatura, per scrivere i passi. La foto originale non lascia il tuo dispositivo e non viene salvata.</p>
        <p><b>Chat.</b> I messaggi inviati all&apos;assistente vengono inoltrati al servizio AI per ottenere la risposta e non vengono salvati da noi.</p>
        <p><b>Cookie.</b> Usiamo solo un cookie tecnico di sessione, necessario per tenerti collegata. Nessun cookie di profilazione.</p>
        <p><b>Cancellazione.</b> Puoi chiedere la cancellazione dell&apos;account e di tutti i dati scrivendo al titolare del sito.</p>
      </div>
    </main>
  );
}
