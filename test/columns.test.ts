import { describe, expect, it } from "vitest";
import { OrderedColumn, ThrowLimitColumn } from "../src/domain/columns";
import { rowsForVariant } from "../src/domain/categories";
import type { RowId } from "../src/domain/types";

const rowOrder6: RowId[] = rowsForVariant(6).map((r) => r.id);
const empty = new Set<RowId>();

describe("ThrowLimitColumn (I/II/III)", () => {
  it("I sallii kirjauksen vain 1. heiton jälkeen", () => {
    const I = new ThrowLimitColumn("I", 1);
    expect(I.canWrite("pair", empty, 0, rowOrder6)).toBe(false); // ei heitetty
    expect(I.canWrite("pair", empty, 1, rowOrder6)).toBe(true);
    expect(I.canWrite("pair", empty, 2, rowOrder6)).toBe(false); // liikaa heittoja
  });
  it("II sallii kirjauksen ≤2 heitolla", () => {
    const II = new ThrowLimitColumn("II", 2);
    expect(II.canWrite("pair", empty, 1, rowOrder6)).toBe(true);
    expect(II.canWrite("pair", empty, 2, rowOrder6)).toBe(true);
    expect(II.canWrite("pair", empty, 3, rowOrder6)).toBe(false);
  });
  it("ei salli jo täytettyä riviä, mutta vapaa rivijärjestys", () => {
    const III = new ThrowLimitColumn("III", 3);
    const filled = new Set<RowId>(["ones"]);
    expect(III.canWrite("ones", filled, 3, rowOrder6)).toBe(false);
    expect(III.canWrite("yatzy", filled, 1, rowOrder6)).toBe(true);
  });
});

describe("OrderedColumn (ALAS/YLÖS)", () => {
  it("ALAS pakottaa ylhäältä alas", () => {
    const alas = new OrderedColumn("ALAS", "down");
    expect(alas.nextRow(empty, rowOrder6)).toBe("ones");
    expect(alas.canWrite("ones", empty, 1, rowOrder6)).toBe(true);
    expect(alas.canWrite("twos", empty, 1, rowOrder6)).toBe(false);
    const after = new Set<RowId>(["ones"]);
    expect(alas.nextRow(after, rowOrder6)).toBe("twos");
  });
  it("YLÖS pakottaa alhaalta ylös", () => {
    const ylos = new OrderedColumn("YLOS", "up");
    expect(ylos.nextRow(empty, rowOrder6)).toBe("superyatzy");
    expect(ylos.canWrite("superyatzy", empty, 1, rowOrder6)).toBe(true);
    expect(ylos.canWrite("ones", empty, 1, rowOrder6)).toBe(false);
  });
  it("vaatii vähintään yhden heiton", () => {
    const alas = new OrderedColumn("ALAS", "down");
    expect(alas.canWrite("ones", empty, 0, rowOrder6)).toBe(false);
  });
});
