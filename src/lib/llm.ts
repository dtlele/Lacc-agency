/** Chiamata a OpenRouter (stessa chiave e stessi modelli di VolantiGo). */
export async function llm(model: string, messages: unknown[], opts: { max?: number; json?: boolean; timeoutMs?: number } = {}): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("chiave AI mancante");
  const body: Record<string, unknown> = { model, messages, max_tokens: opts.max ?? 700, temperature: 0.6 };
  if (opts.json) body.response_format = { type: "json_object" };
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + key, "X-Title": "Filo e Fantasia" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 45000),
  });
  if (!r.ok) throw new Error("ai " + r.status);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "";
}
export const MODEL_TEXT = () => process.env.LLM_MODEL_TEXT || "google/gemini-2.5-flash";
export const MODEL_VISION = () => process.env.LLM_MODEL_VISION || "google/gemini-2.5-flash";
