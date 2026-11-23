# Piano Filo & Fantasia (23/11/2026)

Stato di partenza: webapp Next 16 + Neon + Vercel, account, foto->schema, chat AI, ricerca YouTube con player, materiali.
Regole: un solo deploy a fine ondata (Hobby 10 GB); nessun agente fa deploy, commit, modifiche a env Vercel o al database di produzione; solo `npx tsc --noEmit` e `npx vitest run` (niente `next build`, niente browser: il PC ha poca RAM libera). Codice nuovo = file nuovi; riuso di `src/lib/*` e delle classi di `globals.css`.

## Priorità e assegnazione

| # | Funzione | Valore | Modello | File (esclusivi dell'agente) |
|---|----------|--------|---------|------------------------------|
| P1 | Animazione dello schema + video scaricabile (WebM da canvas) | alto: è il "video" del progetto, riusa lo schema | Sonnet 5.5 | `src/components/PatternPlayer.tsx`, `src/components/PatternView.tsx` |
| P2 | Motore amigurumi a giri + anteprima 3D (canvas, senza librerie) | alto: seconda metà del motore 2D/3D | Sonnet 5.5 | `src/lib/amigurumi.ts`, `src/lib/amigurumi.test.ts`, `src/components/RoundsView.tsx`, `src/components/AmigurumiPreview.tsx`, `src/app/(app)/app/amigurumi/page.tsx` |
| P3 | Account (cambio password, esporta dati, elimina account) + pannello admin (utenti, consumi AI/video) | alto: autorizzazioni e GDPR | Sonnet 5.5 | `src/app/api/account/**`, `src/app/(app)/app/account/**`, `src/app/(app)/app/admin/**`, `src/app/api/admin/**` |
| P4 | Libreria progetti con categorie, difficoltà e colore (filtri) | medio | Sonnet 5.5 | `src/app/(app)/app/progetti/page.tsx`, `src/components/ProjectFilters.tsx` |
| P5 | Test automatici delle parti critiche (token, password, convalide) | medio, meccanico | Haiku 5.5 | `vitest.config.ts`, `src/lib/*.test.ts` (tranne amigurumi) |

Ondata 1: P1 + P2 (le due novità visibili). Ondata 2: P3 + P4 + P5.

## Contratto condiviso (già pronto, non modificare)
- Tabella `projects`: colonne `kind` ('grid' | 'rounds'), `meta` JSONB, `category`, `difficulty`, `color`.
- `kind='grid'`: `rows` = griglia di '#'/'.'; `kind='rounds'`: `rows` = [] e `meta` = `{ shape, size, rounds: number[] }` (punti per giro, dal basso).
- `src/app/(app)/app/progetti/[id]/ProjectClient.tsx` sceglie `PatternView` (grid) o `RoundsView` (rounds, props `{ meta, steps, done, onToggle }`).
- `POST /api/projects` accetta `kind`, `meta`, `category`, `difficulty`, `color`.
- Voci di menu già presenti: Amigurumi (`/app/amigurumi`), Account (`/app/account`).

## Consumi e risorse
- Agenti a ondate di 2-3; Haiku per il meccanico, Sonnet per ciò che tocca sicurezza o logica.
- Controllo RAM/CPU prima e dopo ogni ondata; stop se RAM libera < 1,5 GB.
- Temperatura: il sensore ACPI non è leggibile su questo PC; si usa il carico CPU come indicatore.

## Verifiche di accettazione (23/11/2026, produzione https://filo-fantasia.vercel.app)

| Funzione | Esito | Come |
|----------|-------|------|
| Accesso, area /app protetta, isolamento tra utenti | OK | prova locale con due utenti: 404 su lettura/modifica/eliminazione di progetti altrui; CSRF 403 |
| Foto -> schema + passi AI + salvataggio | OK dal vivo | foto di prova -> "Cuore all'uncinetto", 6 passi, progetto salvato |
| Animazione schema + video WebM | OK dal vivo | file `Cuore-all-uncinetto.webm` scaricato |
| Amigurumi a giri + anteprima 3D + salvataggio | OK dal vivo | sfera 10 cm salvata come progetto |
| Ricerca YouTube + player | OK dal vivo | 8 tutorial per "amigurumi" e "granny square" |
| Chat AI | OK dal vivo | risposta in italiano |
| Libreria con filtri | OK in locale e dal vivo (schede) | filtro Accessori 2 -> 1 |
| Account e pannello admin | OK dal vivo (pagine) | codice rivisto a mano: password richiesta, ultimo admin protetto |
| Test automatici | 40/40 | vitest, eseguiti anche nella build Vercel |

| Voce narrante (livello A, voce del browser) | OK dal vivo (pulsante presente, video scaricato) | ascolto non verificabile da automazione |
| Voce di qualità (livello B, ElevenLabs) | Pronta, non attiva | `GET /api/voice` -> enabled:false, POST -> 501 finché manca `ELEVENLABS_API_KEY`; cache SQL provata in locale |
| Segnali canale YouTube (iscritti, AI in descrizione) | Pronti, non attivi dal vivo | YouTube blocca yt-dlp dai server Vercel; con `YOUTUBE_API_KEY` usa la API ufficiale (provata con risposta simulata) |

## Aperti, dipendono da Mauro
- Privacy e termini: testi completi scritti (23/11); mancano solo i dati del titolare, da impostare su Vercel in `NEXT_PUBLIC_TITOLARE` e `NEXT_PUBLIC_CONTATTO_PRIVACY` (finché mancano, le pagine dicono "in fase di definizione").
- `NEXT_PUBLIC_AMAZON_TAG`: serve il codice affiliato.
- `YOUTUBE_API_KEY` (Google, YouTube Data API v3): attiva iscritti del canale e controllo AI sulla descrizione.
- `ELEVENLABS_API_KEY` (e facoltativo `ELEVENLABS_VOICE_ID`): attiva la voce di qualità nel video scaricato.
- `NEXT_PUBLIC_TITOLARE` e `NEXT_PUBLIC_CONTATTO_PRIVACY`: dati del titolare per privacy e termini.
- Avviso React #418 visto una volta, non riprodotto.
