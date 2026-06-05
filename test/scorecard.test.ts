import { describe, expect, it } from "vitest";
import { Scorecard } from "../src/domain/scorecard";
import type { RowId } from "../src/domain/types";

const UPPER: { row: RowId; face: number }[] = [
  { row: "ones", face: 1 },
  { row: "twos", face: 2 },
  { row: "threes", face: 3 },
  { row: "fours", face: 4 },
  { row: "fives", face: 5 },
  { row: "sixes", face: 6 },
];

describe("Scorecard — bonuskynnys", () => {
  it("on 84 kuudella ja 63 viidellä nopalla", () => {
    expect(new Scorecard(6).bonusThreshold).toBe(84);
    expect(new Scorecard(5).bonusThreshold).toBe(63);
  });
});

describe("Scorecard — yläbonus ja poikkeama", () => {
  it("antaa +50 kun kynnys täyttyy täsmälleen (k×silmäluku)", () => {
    const card = new Scorecard(6);
    for (const { row, face } of UPPER) card.set("I", row, face * 4);
    expect(card.upperSubtotal("I")).toBe(84);
    expect(card.upperBonus("I")).toBe(50);
    expect(card.upperDeviation("I")).toBe(0);
  });
  it("ei bonusta kynnyksen alle, ja poikkeama on negatiivinen", () => {
    const card = new Scorecard(6);
    card.set("I", "ones", 2); // 2 vs odotus 4 → −2
    expect(card.upperBonus("I")).toBe(0);
    expect(card.upperDeviation("I")).toBe(-2);
  });
  it("poikkeama positiivinen kun yli odotuksen", () => {
    const card = new Scorecard(6);
    card.set("I", "ones", 5); // +1
    card.set("I", "twos", 8); // 8 vs 8 → 0
    expect(card.upperDeviation("I")).toBe(1);
  });
});

describe("Scorecard — summat", () => {
  it("columnTotal = yläosa + bonus + alaosa", () => {
    const card = new Scorecard(6);
    for (const { row, face } of UPPER) card.set("I", row, face * 4); // 84 + 50
    card.set("I", "chance", 20);
    expect(card.columnTotal("I")).toBe(84 + 50 + 20);
  });
  it("rowSum summaa rivin sarakkeiden yli", () => {
    const card = new Scorecard(6);
    card.set("I", "chance", 10);
    card.set("II", "chance", 15);
    expect(card.rowSum("chance")).toBe(25);
  });
  it("estää saman solun täyttämisen kahdesti", () => {
    const card = new Scorecard(6);
    card.set("I", "ones", 3);
    expect(() => card.set("I", "ones", 4)).toThrow();
  });
});

describe("Scorecard — valmius", () => {
  it("isComplete vasta kun kaikki solut täytetty", () => {
    const card = new Scorecard(6);
    expect(card.isComplete()).toBe(false);
    for (const col of ["I", "II", "III", "ALAS", "YLOS"] as const) {
      for (const r of card.rows) card.set(col, r.id, 0);
    }
    expect(card.isComplete()).toBe(true);
  });
});
