import { describe, it, expect } from "vitest";
import { normalizeVoiceText, voiceCacheKey, VOICE_MAX_CHARS } from "./voice";

describe("voice", () => {
  it("ripulisce spazi e caratteri di controllo", () => {
    expect(normalizeVoiceText("  Ciao \n\t mondo\u0000 ")).toBe("Ciao mondo");
  });
  it("taglia a 240 caratteri e gestisce input non stringa", () => {
    expect(normalizeVoiceText("a".repeat(500)).length).toBe(VOICE_MAX_CHARS);
    expect(normalizeVoiceText(null)).toBe("");
    expect(normalizeVoiceText(42)).toBe("");
  });
  it("la chiave di cache e' stabile e dipende da testo e voce", () => {
    expect(voiceCacheKey("Ciao  mondo", "v1")).toBe(voiceCacheKey(" Ciao mondo ", "v1"));
    expect(voiceCacheKey("Ciao", "v1")).not.toBe(voiceCacheKey("Ciao", "v2"));
    expect(voiceCacheKey("Ciao", "v1")).toMatch(/^[0-9a-f]{40}$/);
  });
});
