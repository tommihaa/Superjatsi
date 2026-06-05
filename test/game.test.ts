import { describe, expect, it } from "vitest";
import { GameState, MAX_ROLLS } from "../src/domain/game";
import { COLUMN_IDS } from "../src/domain/columns";

// Deterministinen "rng": kaikki nopat näyttävät 4 (1 + floor(0.5×6) = 4).
const rng4 = () => 0.5;

describe("GameState — vuoro ja heitot", () => {
  it("ei tarjoa siirtoja ennen heittoa", () => {
    const g = new GameState(["A", "B"], 6, rng4);
    expect(g.rollsUsed).toBe(0);
    expect(g.availableMoves()).toEqual([]);
    expect(g.canRoll()).toBe(true);
  });

  it("heitto kasvattaa rollsUsediä ja avaa siirtoja", () => {
    const g = new GameState(["A"], 6, rng4);
    g.roll();
    expect(g.rollsUsed).toBe(1);
    expect(g.availableMoves().length).toBeGreaterThan(0);
  });

  it("ei salli yli kolmea heittoa", () => {
    const g = new GameState(["A"], 6, rng4);
    g.roll();
    g.roll();
    g.roll();
    expect(g.canRoll()).toBe(false);
    expect(() => g.roll()).toThrow();
    expect(g.rollsUsed).toBe(MAX_ROLLS);
  });

  it("I-sarake ei ole tarjolla enää 2. heiton jälkeen", () => {
    const g = new GameState(["A"], 6, rng4);
    g.roll();
    g.roll();
    expect(g.availableMoves().some((m) => m.columnId === "I")).toBe(false);
    expect(g.availableMoves().some((m) => m.columnId === "III")).toBe(true);
  });

  it("commit on väliaikainen: ei siirrä vuoroa ennen confirmia", () => {
    const g = new GameState(["A", "B"], 6, rng4);
    g.roll();
    g.commit("III", "fours", {});
    expect(g.players[0].card.get("III", "fours")).toBe(24); // kuusi neloista (6×4)
    expect(g.hasPending()).toBe(true);
    expect(g.currentPlayerIndex).toBe(0); // vuoro EI vielä vaihtunut
    expect(g.canRoll()).toBe(false); // ei heittoja kun kirjaus odottaa
    expect(g.availableMoves()).toEqual([]); // ei muita siirtoja kesken vahvistuksen

    g.confirm();
    expect(g.currentPlayerIndex).toBe(1);
    expect(g.rollsUsed).toBe(0);
    expect(g.hasPending()).toBe(false);
  });

  it("cancel peruu kirjauksen ja jää samaan vuoroon", () => {
    const g = new GameState(["A", "B"], 6, rng4);
    g.roll();
    g.commit("III", "fours", {});
    g.cancel();
    expect(g.players[0].card.get("III", "fours")).toBeNull();
    expect(g.currentPlayerIndex).toBe(0);
    expect(g.hasPending()).toBe(false);
    expect(g.availableMoves().length).toBeGreaterThan(0); // voi valita uudelleen
  });

  it("poltto kirjaa nollan (vahvistuksen jälkeen)", () => {
    const g = new GameState(["A"], 6, rng4);
    g.roll();
    g.commit("III", "yatzy", { burn: true });
    g.confirm();
    expect(g.players[0].card.get("III", "yatzy")).toBe(0);
  });

  it("hylkää laittoman siirron", () => {
    const g = new GameState(["A"], 6, rng4);
    g.roll();
    g.roll(); // rollsUsed 2 → I kielletty
    expect(() => g.commit("I", "fours", {})).toThrow();
  });
});

describe("GameState — koko peli loppuun", () => {
  function playToEnd(players: string[], dice: 5 | 6): GameState {
    const g = new GameState(players, dice, rng4);
    let guard = 0;
    while (!g.isOver()) {
      if (guard++ > 10000) throw new Error("Peli ei pääty");
      g.roll();
      const moves = g.availableMoves();
      expect(moves.length).toBeGreaterThan(0);
      g.commit(moves[0].columnId, moves[0].rowId, {});
      g.confirm();
    }
    return g;
  }

  it("yksinpeli täyttyy ja loppusumma = sarakkeiden summa", () => {
    const g = playToEnd(["Yksin"], 6);
    expect(g.isOver()).toBe(true);
    const card = g.players[0].card;
    const colSum = COLUMN_IDS.reduce((a, c) => a + card.columnTotal(c), 0);
    expect(card.grandTotal()).toBe(colSum);
  });

  it("kuusi pelaajaa, 5 noppaa: kaikki valmistuvat ja voittaja löytyy", () => {
    const g = playToEnd(["A", "B", "C", "D", "E", "F"], 5);
    expect(g.isOver()).toBe(true);
    expect(g.players.every((p) => p.card.isComplete())).toBe(true);
    expect(g.winners().length).toBeGreaterThanOrEqual(1);
  });
});
