import { describe, it, expect } from "vitest";
import { cleanGuide, pickLang } from "./guide";

const steps = [{ t: "Anello magico", s: "6 maglie basse" }, { t: "Secondo giro", s: "Aumenti" }];
const meta = { videoId: "dQw4w9WgXcQ", videoTitle: "Titolo", channel: "Canale", lang: "it", difficulty: "Facile" };

describe("pickLang", () => {
  it("accetta le lingue supportate e ripiega su it", () => {
    expect(pickLang("en")).toBe("en");
    expect(pickLang("pt")).toBe("pt");
    expect(pickLang("ja")).toBe("it");
    expect(pickLang(undefined)).toBe("it");
  });
});

describe("cleanGuide", () => {
  it("accetta una scheda valida", () => {
    const g = cleanGuide(meta, steps);
    expect(g?.steps).toHaveLength(2);
    expect(g?.steps[0].r).toEqual([]);
    expect(g?.meta.difficulty).toBe("Facile");
  });
  it("rifiuta un id video non valido", () => {
    expect(cleanGuide({ ...meta, videoId: "a/b" }, steps)).toBeNull();
    expect(cleanGuide({}, steps)).toBeNull();
  });
  it("rifiuta meno di 2 passi (anche scartando quelli senza titolo)", () => {
    expect(cleanGuide(meta, [steps[0]])).toBeNull();
    expect(cleanGuide(meta, [steps[0], { t: "", s: "x" }])).toBeNull();
    expect(cleanGuide(meta, "no")).toBeNull();
  });
  it("tronca testi e liste", () => {
    const many = Array.from({ length: 60 }, (_, i) => ({ t: "t" + i, s: "x".repeat(900) }));
    const g = cleanGuide({ ...meta, summary: "y".repeat(2000), materials: Array(50).fill("m"), tips: Array(50).fill("c") }, many)!;
    expect(g.steps).toHaveLength(40);
    expect(g.steps[0].s).toHaveLength(800);
    expect(g.meta.summary).toHaveLength(600);
    expect(g.meta.materials).toHaveLength(20);
    expect(g.meta.tips).toHaveLength(12);
  });
  it("difficoltà non valida diventa vuota e lingua non supportata it", () => {
    const g = cleanGuide({ ...meta, difficulty: "Difficilissima", lang: "xx" }, steps)!;
    expect(g.meta.difficulty).toBe("");
    expect(g.meta.lang).toBe("it");
  });
  it("scarta voci di glossario incomplete", () => {
    const g = cleanGuide({ ...meta, glossary: [{ term: "mb", meaning: "maglia bassa" }, { term: "ma", meaning: "" }] }, steps)!;
    expect(g.meta.glossary).toEqual([{ term: "mb", meaning: "maglia bassa" }]);
  });
  it("tiene il secondo d'inizio del passo solo se valido", () => {
    const g = cleanGuide(meta, [{ t: "a", s: "x", at: 95.7 }, { t: "b", s: "y", at: -3 }, { t: "c", s: "z", at: "boh" }])!;
    expect(g.steps.map((p) => p.at)).toEqual([95, undefined, undefined]);
  });
});

describe("cleanGuide: fine del passo", () => {
  const m = { videoId: "abcdefghijk" };
  it("tiene la fine solo se dopo l'inizio e entro 15 minuti", () => {
    const g = cleanGuide(m, [{ t: "a", s: "x", at: 10, end: 40 }, { t: "b", s: "y", at: 50, end: 20 }, { t: "c", s: "z", at: 5, end: 5000 }])!;
    expect(g.steps.map((p) => p.end)).toEqual([40, undefined, undefined]);
  });
});
