import { describe, it, expect } from "vitest";
import { stitchesIn } from "@/components/StitchSymbols";

describe("stitchesIn", () => {
  it("riconosce sigle e nomi", () => {
    expect(stitchesIn("Lavora 6 mb nel cerchio magico")).toEqual(["cm", "mb"]);
    expect(stitchesIn("fai 3 catenelle e una maglia bassissima")).toEqual(["mbss", "cat"]);
  });
  it("non confonde mb dentro mbss e la congiunzione 'ma'", () => {
    expect(stitchesIn("Fai 2 mbss")).toEqual(["mbss"]);
    expect(stitchesIn("Va bene ma non stringere troppo")).toEqual([]);
    expect(stitchesIn("lavora 5 ma nel giro")).toEqual(["ma"]);
  });
  it("niente punti nel testo senza punti", () => {
    expect(stitchesIn("Taglia il filo e nascondi la coda")).toEqual([]);
  });
});
