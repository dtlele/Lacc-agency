import { describe, it, expect } from "vitest";
import { cleanRows, cleanSteps } from "./pattern";

describe("cleanRows", () => {
  it("accetta una griglia valida", () => {
    const rows = ["#..#", ".##.", "#..#", "...."];
    expect(cleanRows(rows)).toEqual(rows);
  });

  it("rifiuta meno di 4 righe", () => {
    expect(cleanRows(["#..#", ".##.", "#..#"])).toBeNull();
  });

  it("rifiuta più di 40 righe", () => {
    expect(cleanRows(Array.from({ length: 41 }, () => "#..#"))).toBeNull();
  });

  it("accetta esattamente 40 righe", () => {
    expect(cleanRows(Array.from({ length: 40 }, () => "#..#"))).not.toBeNull();
  });

  it("rifiuta caratteri diversi da # e .", () => {
    expect(cleanRows(["#..#", ".x#.", "#..#", "...."])).toBeNull();
    expect(cleanRows(["#..#", ". #.", "#..#", "...."])).toBeNull();
  });

  it("rifiuta righe di lunghezze diverse", () => {
    expect(cleanRows(["#..#", ".##", "#..#", "...."])).toBeNull();
  });

  it("rifiuta input che non è un array", () => {
    expect(cleanRows("#..#")).toBeNull();
    expect(cleanRows(null)).toBeNull();
    expect(cleanRows(undefined)).toBeNull();
    expect(cleanRows({ 0: "#..#" })).toBeNull();
  });

  it("rifiuta righe non stringa", () => {
    expect(cleanRows(["#..#", 42, "#..#", "...."])).toBeNull();
  });
});

describe("cleanSteps", () => {
  it("taglia il titolo a 60 caratteri e il testo a 240", () => {
    const [step] = cleanSteps([{ t: "a".repeat(100), s: "b".repeat(300), r: [0] }], 5);
    expect(step.t).toHaveLength(60);
    expect(step.s).toHaveLength(240);
  });

  it("scarta i passi senza titolo", () => {
    const steps = cleanSteps(
      [
        { t: "", s: "x", r: [0] },
        { s: "x", r: [0] },
        { t: "ok", s: "x", r: [0] },
      ],
      5,
    );
    expect(steps.map((s) => s.t)).toEqual(["ok"]);
  });

  it("filtra indici di riga fuori intervallo o non interi", () => {
    const [step] = cleanSteps([{ t: "t", s: "s", r: [-1, 0, 2, 4, 5, 1.5, "3", NaN, null] }], 5);
    expect(step.r).toEqual([0, 2, 4]);
  });

  it("mantiene al massimo 10 passi", () => {
    const input = Array.from({ length: 15 }, (_, i) => ({ t: `p${i}`, s: "", r: [] }));
    const steps = cleanSteps(input, 5);
    expect(steps).toHaveLength(10);
    expect(steps[9].t).toBe("p9");
  });

  it("gestisce input non array come lista vuota", () => {
    expect(cleanSteps(null, 5)).toEqual([]);
    expect(cleanSteps("abc", 5)).toEqual([]);
  });
});
