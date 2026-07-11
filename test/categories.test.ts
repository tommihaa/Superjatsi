import { describe, expect, it } from "vitest";
import { ALL_ROWS, rowsForVariant, rowDef } from "../src/domain/categories";

const SIX_ONLY = ["threePairs", "fullStraight", "huvila", "torni", "superyatzy"];

describe("categories — variantin rivit", () => {
  it("5 nopan variantti pudottaa kaikki sixOnly-rivit", () => {
    const rows = rowsForVariant(5);
    for (const id of SIX_ONLY) {
      expect(rows.some((r) => r.id === id)).toBe(false);
    }
    expect(rows.length).toBe(ALL_ROWS.length - SIX_ONLY.length);
  });

  it("6 nopan variantti sisältää sixOnly-rivit", () => {
    const rows = rowsForVariant(6);
    for (const id of SIX_ONLY) {
      expect(rows.some((r) => r.id === id)).toBe(true);
    }
    expect(rows.length).toBe(ALL_ROWS.length);
  });

  it("säilyttää kanonisen rivijärjestyksen variantissa", () => {
    const full = ALL_ROWS.map((r) => r.id);
    const five = rowsForVariant(5).map((r) => r.id);
    // 5 nopan lista on ALL_ROWS ilman sixOnly-rivejä, järjestys ennallaan.
    expect(five).toEqual(full.filter((id) => !SIX_ONLY.includes(id)));
  });

  it("rowDef palauttaa oikean määritelmän ja heittää tuntemattomalla", () => {
    expect(rowDef("fours")).toEqual({ id: "fours", label: "Neloset", section: "upper", face: 4 });
    expect(rowDef("superyatzy").sixOnly).toBe(true);
    // @ts-expect-error tarkoituksellinen tuntematon id ajonaikaista tarkistusta varten
    expect(() => rowDef("eiOle")).toThrow();
  });
});
