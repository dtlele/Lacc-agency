import { createHash } from "node:crypto";

export const VOICE_MAX_CHARS = 240;

/** Testo ripulito per la sintesi vocale: niente caratteri di controllo, spazi singoli, massimo 240 caratteri. */
export function normalizeVoiceText(input: unknown): string {
  if (typeof input !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, VOICE_MAX_CHARS).trim();
}

/** Chiave di cache: stesso testo (normalizzato) + stessa voce = stesso audio, senza rifare la chiamata a pagamento. */
export function voiceCacheKey(text: string, voiceId: string): string {
  return createHash("sha1").update(`${normalizeVoiceText(text)}|${voiceId}|v1`).digest("hex");
}
