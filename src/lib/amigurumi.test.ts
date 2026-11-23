import { describe, it, expect } from "vitest";
import { amigurumiRounds, roundsToSteps, roundsToMesh, SHAPES } from "./amigurumi";

const diametri = [3, 5, 8, 10, 15, 20, 25, 30];

describe("amigurumiRounds", () => {
  it("il primo giro è 6", () => {
    for (const s of SHAPES) for (const d of diametri) expect(amigurumiRounds(s, d)[0]).toBe(6);
  });
  it("tra giri consecutivi la differenza è 0 o ±6", () => {
    for (const s of SHAPES) for (const d of [...diametri, 40]) {
      const r = amigurumiRounds(s, d);
      for (let i = 1; i < r.length; i++) expect([0, 6, -6]).toContain(r[i] - r[i - 1]);
    }
  });
  it("l'ultimo giro è al massimo 12", () => {
    for (const s of SHAPES) for (const d of [...diametri, 40]) {
      const r = amigurumiRounds(s, d);
      expect(r[r.length - 1]).toBeLessThanOrEqual(12);
    }
  });
  it("il massimo è circa pi*d*gauge (±15%)", () => {
    for (const s of SHAPES) for (const d of [8, 10, 15, 20]) {
      const max = Math.max(...amigurumiRounds(s, d));
      const target = Math.PI * d * 2.2;
      expect(Math.abs(max - target) / target).toBeLessThanOrEqual(0.15);
    }
  });
  it("rispetta i limiti di diametro, giri e maglie", () => {
    expect(amigurumiRounds("sfera", 1)).toEqual(amigurumiRounds("sfera", 3));
    expect(amigurumiRounds("sfera", 100)).toEqual(amigurumiRounds("sfera", 40));
    for (const s of SHAPES) {
      const r = amigurumiRounds(s, 40, 6);
      expect(r.length).toBeLessThanOrEqual(80);
      expect(Math.max(...r)).toBeLessThanOrEqual(400);
    }
  });
  it("il cilindro è più alto della sfera", () => {
    expect(amigurumiRounds("cilindro", 10).length).toBeGreaterThan(amigurumiRounds("sfera", 10).length);
  });
});

describe("roundsToSteps", () => {
  it("copre tutti i giri esattamente una volta, con al massimo 10 passi", () => {
    for (const s of SHAPES) for (const d of [...diametri, 40]) {
      const r = amigurumiRounds(s, d);
      const steps = roundsToSteps(r);
      expect(steps.length).toBeLessThanOrEqual(10);
      const all = steps.flatMap((p) => p.r).sort((a, b) => a - b);
      expect(all).toEqual(r.map((_, i) => i));
      expect(steps[0].t).toBe("Giro 1");
      expect(steps[steps.length - 1].t).toBe("Chiudi");
    }
  });
});

describe("roundsToMesh", () => {
  it("tiene la forma dentro il riquadro 1x1 con proporzioni reali", () => {
    const m = roundsToMesh(amigurumiRounds("sfera", 10));
    const alt = m[m.length - 1].y - m[0].y;
    const larg = 2 * Math.max(...m.map((p) => p.radius));
    expect(m.every((p) => p.y >= -1e-9 && p.y <= 1 + 1e-9 && p.radius <= 0.5 + 1e-9)).toBe(true);
    expect(Math.max(alt, larg)).toBeCloseTo(1); // il lato più lungo riempie il riquadro
    for (let i = 1; i < m.length; i++) expect(m[i].y).toBeGreaterThan(m[i - 1].y); // i giri salgono sempre
  });
  it("i primi giri formano un disco: salgono meno dei giri dritti", () => {
    const m = roundsToMesh([6, 12, 18, 24, 24, 24, 24]);
    expect(m[1].y - m[0].y).toBeLessThan(m[5].y - m[4].y);
  });
});
