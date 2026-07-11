import { describe, expect, it } from "vitest";
import { DiceSet } from "../src/domain/dice";

// Deterministinen rng-generaattori: kierrättää annetut arvot.
function seqRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("DiceSet — nopat", () => {
  it("reset nollaa arvot ja lukot", () => {
    const d = new DiceSet(6, () => 0.5);
    d.roll();
    d.toggleHold(0);
    d.reset();
    expect(d.values).toEqual([0, 0, 0, 0, 0, 0]);
    expect(d.held).toEqual([false, false, false, false, false, false]);
  });

  it("roll heittää vain lukitsemattomat, lukittu arvo säilyy", () => {
    // rng antaa ensin kuutosia (0.999), sitten ykkösiä (0).
    const d = new DiceSet(5, seqRng([0.999, 0.999, 0.999, 0.999, 0.999, 0, 0, 0, 0, 0]));
    d.roll();
    expect(d.values).toEqual([6, 6, 6, 6, 6]);
    d.toggleHold(2); // lukitaan yksi kuutonen
    d.roll();
    expect(d.values[2]).toBe(6); // lukittu säilyi
    expect(d.values.filter((v) => v === 1).length).toBe(4); // muut heitetty uudelleen
  });

  it("arvot pysyvät välillä 1..6 ääriarvoilla 0 ja ~1", () => {
    const dMin = new DiceSet(6, () => 0);
    dMin.roll();
    expect(dMin.values).toEqual([1, 1, 1, 1, 1, 1]);

    const dMax = new DiceSet(6, () => 0.999999);
    dMax.roll();
    expect(dMax.values).toEqual([6, 6, 6, 6, 6, 6]);
  });

  it("toggleHold togglaa ja hylkää laittoman indeksin", () => {
    const d = new DiceSet(5, () => 0.5);
    expect(d.held[1]).toBe(false);
    d.toggleHold(1);
    expect(d.held[1]).toBe(true);
    d.toggleHold(1);
    expect(d.held[1]).toBe(false);
    expect(() => d.toggleHold(-1)).toThrow();
    expect(() => d.toggleHold(5)).toThrow();
  });
});
