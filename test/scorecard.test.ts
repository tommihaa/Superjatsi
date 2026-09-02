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
  it("on 76 kuudella ja 63 viidellä nopalla, bonus +50 kummassakin", () => {
    expect(new Scorecard(6).bonusThreshold).toBe(76);
    expect(new Scorecard(5).bonusThreshold).toBe(63);
    expect(new Scorecard(6).bonusValue).toBe(50);
    expect(new Scorecard(5).bonusValue).toBe(50);
  });
  it("rivitahtien summa on täsmälleen kynnys kummassakin variantissa", () => {
    for (const dice of [5, 6] as const) {
      const card = new Scorecard(dice);
      const sum = UPPER.reduce((a, { face }) => a + card.upperPace(face), 0);
      expect(sum).toBe(card.bonusThreshold);
    }
    const six = new Scorecard(6);
    expect(UPPER.map(({ face }) => six.upperPace(face))).toEqual([4, 7, 11, 14, 18, 22]);
  });
});

describe("Scorecard — yläbonus ja poikkeama", () => {
  it("antaa +50 kun 6 nopan kynnys (76) täyttyy täsmälleen rivitahdeilla", () => {
    const card = new Scorecard(6);
    for (const { row, face } of UPPER) card.set("I", row, card.upperPace(face));
    expect(card.upperSubtotal("I")).toBe(76);
    expect(card.upperBonus("I")).toBe(50);
    expect(card.upperDeviation("I")).toBe(0);
  });
  it("ei bonusta 75:llä, mutta 76 riittää", () => {
    const card = new Scorecard(6);
    for (const { row, face } of UPPER) card.set("I", row, face === 6 ? 21 : card.upperPace(face));
    expect(card.upperSubtotal("I")).toBe(75);
    expect(card.upperBonus("I")).toBe(0);
    expect(card.upperDeviation("I")).toBe(-1);
  });
  it("antaa +50 kun 5 nopan kynnys (63) täyttyy täsmälleen", () => {
    const card = new Scorecard(5);
    for (const { row, face } of UPPER) card.set("I", row, face * 3);
    expect(card.upperSubtotal("I")).toBe(63);
    expect(card.upperBonus("I")).toBe(50);
  });
  it("ei bonusta kynnyksen alle, ja poikkeama on negatiivinen", () => {
    const card = new Scorecard(6);
    card.set("I", "ones", 2); // 2 vs odotus 4 → −2
    expect(card.upperBonus("I")).toBe(0);
    expect(card.upperDeviation("I")).toBe(-2);
  });
  it("poikkeama positiivinen kun yli odotuksen", () => {
    const card = new Scorecard(6);
    card.set("I", "ones", 5); // 5 vs tahti 4 → +1
    card.set("I", "twos", 8); // 8 vs tahti 7 → +1
    expect(card.upperDeviation("I")).toBe(2);
  });
});

describe("Scorecard — summat", () => {
  it("columnTotal = yläosa + bonus + alaosa", () => {
    const card = new Scorecard(6);
    for (const { row, face } of UPPER) card.set("I", row, face * 4); // 84 ≥ 76 → +50
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
