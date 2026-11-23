import { aiGate, requireUser } from "@/lib/auth";
import { guard, json, readBody } from "@/lib/http";
import { llm, MODEL_TEXT, MODEL_VISION } from "@/lib/llm";
import { cleanRows, cleanSteps } from "@/lib/pattern";

/** Riceve la griglia a punti calcolata dal browser (+ miniatura) e chiede all'AI titolo e passi. */
export const POST = (req: Request) =>
  guard(async () => {
    const s = await requireUser();
    const b = await readBody(req);
    const rows = cleanRows(b.rows);
    if (!rows) return json({ error: "Schema non valido" }, 400);
    const thumb = typeof b.thumb === "string" && b.thumb.startsWith("data:image/jpeg;base64,") && b.thumb.length < 250000 ? b.thumb : null;
    const n = rows.length;
    await aiGate(s);
    const prompt = `Questa è la griglia a punti (# = maglia, . = vuoto) di un oggetto all'uncinetto, ${n} righe, la riga 0 è in alto. Si lavora dal basso (riga ${n - 1}) verso l'alto (riga 0).
${rows.map((r, i) => i + ": " + r).join("\n")}
${thumb ? "In allegato c'è la foto originale: usala per capire cos'è l'oggetto." : ""}
Rispondi SOLO con JSON: {"nome":"titolo breve in italiano","passi":[{"t":"titolo passo","s":"istruzione in una frase","r":[indici delle righe della griglia lavorate in questo passo]}]}.
Regole: da 5 a 7 passi; il primo e l'ultimo (materiale e rifinitura) hanno "r":[]; i passi intermedi hanno gli indici di riga in ordine dal basso verso l'alto, senza ripetizioni e coprendo tutte le righe con maglie.`;
    const content = thumb ? [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: thumb } }] : prompt;
    try {
      const out = await llm(thumb ? MODEL_VISION() : MODEL_TEXT(), [{ role: "user", content }], { max: 900, json: true });
      const j = JSON.parse(out.replace(/^```json|```$/g, "").trim());
      const steps = cleanSteps(j.passi, n);
      if (steps.length < 3) throw new Error("passi");
      return { name: String(j.nome || "Il tuo progetto").slice(0, 40), steps };
    } catch {
      return json({ error: "Non sono riuscita a scrivere i passi: riprova con la stessa foto." }, 502);
    }
  });
