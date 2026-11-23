import { aiGate, requireUser } from "@/lib/auth";
import { guard, json, readBody } from "@/lib/http";
import { llm, MODEL_TEXT } from "@/lib/llm";

const SYSTEM = "Sei l'assistente di Filo & Fantasia, un'app italiana di uncinetto. Rispondi sempre in italiano, con tono caldo e chiaro, in massimo 6 frasi. Aiuti con punti, filati, uncinetti, misure, errori comuni e idee di progetto. Se la domanda non c'entra con l'uncinetto o i lavori a mano, riportala gentilmente al tema.";

export const POST = (req: Request) =>
  guard(async () => {
    const s = await requireUser();
    const { messages } = await readBody(req);
    if (!Array.isArray(messages) || !messages.length) return json({ error: "Scrivi un messaggio" }, 400);
    const recent = messages.slice(-8).map((m: { role?: string; content?: unknown }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? "").slice(0, 600),
    }));
    await aiGate(s);
    try {
      const reply = await llm(MODEL_TEXT(), [{ role: "system", content: SYSTEM }, ...recent], { max: 500 });
      return { reply: reply.trim() };
    } catch {
      return json({ error: "L'assistente non risponde in questo momento: riprova tra poco." }, 502);
    }
  });
