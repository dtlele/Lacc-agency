export const metadata = { title: "Materiali" };

const TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || ""; // codice affiliato Amazon: vuoto finché non c'è

const MATERIALI = [
  ["Uncinetti in alluminio", "Set di misure da 2 a 6 mm", "uncinetti alluminio set"],
  ["Cotone per amigurumi", "Gomitoli colorati", "cotone amigurumi gomitoli"],
  ["Lana morbida", "Per scialli e coperte", "lana per uncinetto morbida"],
  ["Occhi di sicurezza", "Per pupazzi", "occhi sicurezza amigurumi"],
  ["Imbottitura", "Fibra siliconata", "imbottitura fibra siliconata"],
  ["Marcapunti e aghi", "Per le rifiniture", "marcapunti uncinetto aghi lana"],
];

export default function Materiali() {
  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-4xl">Materiali</h1>
        <p className="mt-2 max-w-prose text-muted">Ogni voce apre la ricerca su Amazon.{TAG ? " Se acquisti dal link, il sito riceve una piccola commissione senza costi per te." : ""}</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MATERIALI.map(([t, s, k]) => (
          <li key={t}>
            <a href={`https://www.amazon.it/s?k=${encodeURIComponent(k)}${TAG ? `&tag=${encodeURIComponent(TAG)}` : ""}`} target="_blank" rel={`noopener noreferrer${TAG ? " sponsored" : ""}`} className="card block h-full hover:bg-pesca/60">
              <b className="block font-display text-xl font-normal">{t}</b>
              <span className="text-sm text-muted">{s}</span>
              <span className="mt-2 block font-bold text-accent">Cerca su Amazon</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
