// Chiamata a OpenRouter (stessa chiave di Fresho). Limiti prudenziali: endpoint pubblico.
async function llm(model, messages, { max = 700, json = false } = {}) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('chiave mancante');
  const body = { model, messages, max_tokens: max, temperature: 0.6 };
  if (json) body.response_format = { type: 'json_object' };
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key, 'X-Title': 'Filo e Fantasia' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(40000)
  });
  if (!r.ok) throw new Error('llm ' + r.status);
  const j = await r.json();
  return j.choices?.[0]?.message?.content || '';
}
function leggi(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}
module.exports = { llm, leggi };
