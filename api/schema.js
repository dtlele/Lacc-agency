const { llm, leggi } = require('./_llm');
// Riceve la griglia a punti calcolata dal browser (+ miniatura) e chiede all'AI titolo e passi.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'metodo' });
  const { righe, thumb } = leggi(req);
  if (!Array.isArray(righe) || righe.length < 4 || righe.length > 40 || righe.some(r => typeof r !== 'string' || r.length > 40 || /[^#.]/.test(r)))
    return res.status(400).json({ error: 'griglia' });
  if (thumb && (typeof thumb !== 'string' || thumb.length > 250000 || !thumb.startsWith('data:image/'))) return res.status(400).json({ error: 'immagine' });
  const n = righe.length;
  const prompt = `Questa è la griglia a punti (# = maglia, . = vuoto) di un oggetto all'uncinetto, ${n} righe, la riga 0 è in alto. Si lavora dal basso (riga ${n - 1}) verso l'alto (riga 0).
${righe.map((r, i) => i + ': ' + r).join('\n')}
${thumb ? "In allegato c'è la foto originale: usala per capire cos'è l'oggetto." : ''}
Rispondi SOLO con JSON: {"nome":"titolo breve in italiano","passi":[{"t":"titolo passo","s":"istruzione in una frase","r":[indici delle righe della griglia lavorate in questo passo]}]}.
Regole: da 5 a 7 passi; il primo e l'ultimo (materiale e rifinitura) hanno "r":[]; i passi intermedi hanno gli indici di riga in ordine dal basso verso l'alto, senza ripetizioni e coprendo tutte le righe con maglie.`;
  const content = thumb ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: thumb } }] : prompt;
  try {
    const model = thumb ? (process.env.LLM_MODEL_VISION || 'google/gemini-2.5-flash') : (process.env.LLM_MODEL_TEXT || 'google/gemini-2.5-flash');
    const out = await llm(model, [{ role: 'user', content }], { max: 900, json: true });
    const j = JSON.parse(out.replace(/^```json|```$/g, '').trim());
    const passi = (Array.isArray(j.passi) ? j.passi : []).slice(0, 8).map(p => ({
      t: String(p.t || '').slice(0, 60), s: String(p.s || '').slice(0, 200),
      r: (Array.isArray(p.r) ? p.r : []).filter(x => Number.isInteger(x) && x >= 0 && x < n)
    })).filter(p => p.t);
    if (passi.length < 3) throw new Error('passi');
    res.status(200).json({ nome: String(j.nome || 'Il tuo progetto').slice(0, 40), passi });
  } catch (e) {
    res.status(502).json({ error: 'ai' });
  }
};
