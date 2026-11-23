const { llm, leggi } = require('./_llm');
const SYSTEM = "Sei l'assistente di Filo & Fantasia, un sito italiano di uncinetto. Rispondi sempre in italiano, con tono caldo e chiaro, in massimo 6 frasi. Aiuti con punti, filati, uncinetti, misure, errori comuni e idee di progetto. Se la domanda non c'entra con l'uncinetto o i lavori a mano, riportala gentilmente al tema.";
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'metodo' });
  const { messages } = leggi(req);
  if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: 'vuoto' });
  const pulita = messages.slice(-8).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 600) }));
  try {
    const testo = await llm(process.env.LLM_MODEL_TEXT || 'google/gemini-2.5-flash', [{ role: 'system', content: SYSTEM }, ...pulita], { max: 500 });
    res.status(200).json({ reply: testo.trim() });
  } catch (e) {
    res.status(502).json({ error: 'ai' });
  }
};
