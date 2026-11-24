import { describe, it, expect } from "vitest";
import { parseCommand } from "@/components/WorkMode";

const c = (t: string) => parseCommand(t);
describe("parseCommand", () => {
  it("passi", () => {
    expect(c("Avanti")).toEqual({ k: "next" });
    expect(c("ho finito")).toEqual({ k: "next" });
    expect(c("torna indietro")).toEqual({ k: "back" });
    expect(c("ripeti per favore")).toEqual({ k: "read" });
    expect(c("vai al passo cinque")).toEqual({ k: "goto", n: 5 });
  });
  it("video: salti e controlli", () => {
    expect(c("indietro di dieci secondi")).toEqual({ k: "vSeek", rel: -10 });
    expect(c("avanti di 20 secondi")).toEqual({ k: "vSeek", rel: 20 });
    expect(c("vai al minuto 3 e 20")).toEqual({ k: "vSeek", abs: 200 });
    expect(c("rivedi")).toEqual({ k: "vReplay" });
    expect(c("metti in pausa")).toEqual({ k: "vPause" });
    expect(c("riprendi")).toEqual({ k: "vPlay" });
    expect(c("più lento")).toEqual({ k: "vRate", r: 0.5 });
    expect(c("mostra il video")).toEqual({ k: "vShow" });
    expect(c("non ho capito")).toEqual({ k: "vSeek", rel: -10 });
  });
  it("timer e contagiri", () => {
    expect(c("timer di dieci minuti")).toEqual({ k: "timer", min: 10 });
    expect(c("ferma il timer")).toEqual({ k: "timerStop" });
    expect(c("più uno")).toEqual({ k: "count", d: 1 });
    expect(c("meno")).toEqual({ k: "count", d: -1 });
    expect(c("azzera")).toEqual({ k: "reset" });
  });
  it("frasi senza senso non fanno nulla", () => {
    expect(c("")).toBeNull();
    expect(c("buongiorno signora")).toBeNull();
  });
});
