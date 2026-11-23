// Motore amigurumi "a giri": puro TypeScript, nessuna dipendenza.

export type Shape = "sfera" | "cilindro" | "cono" | "uovo";
export type AmiStep = { t: string; s: string; r: number[] };
export type MeshRing = { y: number; radius: number; n: number };

export const SHAPES: Shape[] = ["sfera", "cilindro", "cono", "uovo"];
export const MIN_DIAMETER = 3;
export const MAX_DIAMETER = 40;
const MAX_ROUNDS = 80;
const MAX_STITCHES = 400;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Prova le combinazioni (k = giri di aumento, s = giri dritti desiderati) dalla più grande finché stanno in 80 giri. */
function fit(kWanted: number, sWanted: number, build: (k: number, s: number) => number[]): number[] {
  for (let k = kWanted; k >= 1; k--) {
    for (let s = k === kWanted ? sWanted : Math.min(sWanted, Math.round(k / 2)); s >= 0; s--) {
      const seq = build(k, s);
      if (seq.length <= MAX_ROUNDS) return seq;
    }
  }
  return [6];
}

const range = (from: number, to: number, step: number) => {
  const out: number[] = [];
  for (let v = from; step > 0 ? v <= to : v >= to; v += step) out.push(v);
  return out;
};
const repeat = (n: number, times: number) => Array(Math.max(0, times)).fill(n) as number[];


/** Giri che seguono un profilo tondo f(t) (t da 0 a 1): multipli di 6, mai più di 6 maglie di differenza tra due giri, partenza 6 e chiusura al massimo 12. */
function fromProfile(maxN: number, rounds: number, f: (t: number) => number): number[] {
  const L = clamp(rounds, 5, MAX_ROUNDS);
  const n = Array.from({ length: L }, (_, k) => clamp(6 * Math.round((maxN * f((k + 0.5) / L)) / 6), 6, maxN));
  n[0] = 6;
  n[L - 1] = Math.min(n[L - 1], 12);
  for (let k = 1; k < L; k++) n[k] = Math.min(n[k], n[k - 1] + 6); // salita al massimo +6
  for (let k = L - 2; k >= 0; k--) n[k] = Math.min(n[k], n[k + 1] + 6); // discesa al massimo -6
  return n;
}

/** Punti per giro dal basso. Il primo giro è l'anello magico di 6 maglie basse. */
export function amigurumiRounds(shape: Shape, diameterCm: number, gaugeStitchesPerCm = 2.2): number[] {
  const d = clamp(Number.isFinite(diameterCm) ? diameterCm : MIN_DIAMETER, MIN_DIAMETER, MAX_DIAMETER);
  const g = clamp(Number.isFinite(gaugeStitchesPerCm) && gaugeStitchesPerCm > 0 ? gaugeStitchesPerCm : 2.2, 0.5, 6);
  // maglie al giro più largo: circa pi*diametro*gauge, multiplo di 6 (minimo 12)
  const maxN = clamp(Math.round((Math.PI * d * g) / 6) * 6, 12, MAX_STITCHES - (MAX_STITCHES % 6));
  const k = Math.min(maxN / 6, MAX_ROUNDS / 2); // quanti giri di aumento (6, 12, ... 6k)
  const up = (kk: number) => range(6, 6 * kk, 6);
  const down = (kk: number) => range(6 * (kk - 1), 6, -6);

  let seq: number[];
  if (shape === "cilindro") {
    const h = Math.max(1, Math.round(d * 1.2 * g)); // altezza = diametro * 1,2
    seq = fit(k, h, (kk, s) => [...up(kk), ...repeat(6 * kk, s), ...down(kk)]);
  } else if (shape === "cono") {
    // la punta è in basso: si allarga piano (ogni misura due volte se c'è spazio), poi base piatta
    const rep = 3 * k - 1 <= MAX_ROUNDS ? 2 : 1;
    seq = fit(k, 0, (kk) => [...up(kk).flatMap((n) => repeat(n, rep)), ...down(kk)]);
  } else if (shape === "uovo") {
    // uovo: più largo in basso e più stretto in cima, profilo tondo
    seq = fromProfile(maxN, Math.round((maxN / 2.4) * 1.15), (t) => Math.sin(Math.PI * Math.pow(t, 0.75)));
  } else {
    // sfera: profilo tondo (gli aumenti rallentano verso la parte larga, poi i cali accelerano)
    seq = fromProfile(maxN, Math.round(maxN / 2.4), (t) => Math.sin(Math.PI * t));
  }
  return seq.slice(0, MAX_ROUNDS).map((n) => Math.min(n, MAX_STITCHES));
}

type Kind = "start" | "inc" | "str" | "dec";
const kindOf = (rounds: number[], i: number): Kind =>
  i === 0 ? "start" : rounds[i] > rounds[i - 1] ? "inc" : rounds[i] < rounds[i - 1] ? "dec" : "str";

/** Elenco di maglie leggibile: se è lungo, mostra solo inizio e fine. */
const listN = (ns: number[]) => (ns.length <= 6 ? ns.join(", ") : `${ns.slice(0, 3).join(", ")} … ${ns[ns.length - 1]}`);
const label = (a: number, b: number) => (a === b ? `Giro ${a + 1}` : `Giri ${a + 1}-${b + 1}`);

/** Passi leggibili: raggruppa i giri consecutivi con la stessa istruzione (max ~10 passi). */
export function roundsToSteps(rounds: number[]): AmiStep[] {
  const L = rounds.length;
  if (!L) return [];
  const idx = (a: number, b: number) => range(a, b, 1);
  const steps: AmiStep[] = [{ t: "Giro 1", s: `Anello magico con ${rounds[0]} maglie basse`, r: [0] }];

  // raggruppamento esatto: stesso tipo (e stesso numero di maglie per i giri dritti)
  const groups: { kind: Kind; a: number; b: number }[] = [];
  for (let i = 1; i < L; i++) {
    const kd = kindOf(rounds, i);
    const last = groups[groups.length - 1];
    if (last && last.kind === kd && (kd !== "str" || rounds[last.b] === rounds[i])) last.b = i;
    else groups.push({ kind: kd, a: i, b: i });
  }
  const describe = (kd: Kind, a: number, b: number): string => {
    const ns = rounds.slice(a, b + 1);
    if (kd === "inc") return `6 aumenti a ogni giro (${listN(ns)} maglie)`;
    if (kd === "dec") return `6 cali a ogni giro (${listN(ns)} maglie)`;
    return `Giri dritti da ${ns[0]} maglie: una maglia bassa in ogni punto`;
  };

  if (groups.length <= 8) {
    for (const g of groups) steps.push({ t: label(g.a, g.b), s: describe(g.kind, g.a, g.b), r: idx(g.a, g.b) });
  } else {
    // troppi gruppi (giri alternati): un passo per fase (sale, massimo, scende)
    const max = Math.max(...rounds);
    const first = rounds.indexOf(max);
    const lastMax = rounds.lastIndexOf(max);
    const phases: [number, number, string][] = [
      [1, first, `Aumenta fino a ${max} maglie: 6 aumenti ogni tanto, con giri dritti in mezzo (${listN(rounds.slice(1, first + 1))} maglie)`],
      [first + 1, lastMax, `Giri dritti da ${max} maglie`],
      [lastMax + 1, L - 1, `Cala fino a ${rounds[L - 1]} maglie: 6 cali ogni tanto, con giri dritti in mezzo (${listN(rounds.slice(lastMax + 1))} maglie)`],
    ];
    for (const [a, b, s] of phases) if (a <= b) steps.push({ t: label(a, b), s, r: idx(a, b) });
  }
  steps.push({ t: "Chiudi", s: "Taglia il filo, imbottisci e chiudi con l'ago", r: [] });
  return steps;
}

/** Profilo per il 3D: altezza totale 1 (dal basso), raggio massimo 0,5. */
export function roundsToMesh(rounds: number[]): MeshRing[] {
  // Geometria: il raggio di un giro è n/(2π) maglie e, lavorando stretto come negli amigurumi, ogni giro è alto circa 1,2 maglie (calibrato: una sfera esce alta quanto larga).
  // Quando il raggio cresce di quasi una maglia per giro (+6 maglie) il giro sale poco: i primi giri formano un disco, poi la forma si arrotonda.
  const r = rounds.map((n) => n / (2 * Math.PI));
  const ys = [0];
  for (let i = 1; i < r.length; i++) ys.push(ys[i - 1] + Math.sqrt(Math.max(0.05, 1.44 - (r[i] - r[i - 1]) ** 2)));
  const H = ys[ys.length - 1] || 1;
  const s = 1 / Math.max(H, 2 * Math.max(...r, 0.01)); // altezza e larghezza restano proporzionate dentro il riquadro 1 x 1
  return rounds.map((n, i) => ({ y: 0.5 + (ys[i] - H / 2) * s, radius: r[i] * s, n }));
}
