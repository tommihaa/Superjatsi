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

describe("GameState — lastMove (vuoronvaihdon kuittaus)", () => {
  it("on aluksi null ja tallentuu vasta confirmissa", () => {
    const g = new GameState(["Tommi", "B"], 6, rng4);
    expect(g.lastMove).toBeNull();
    g.roll();
    g.commit("III", "fours", {});
    expect(g.lastMove).toBeNull(); // pending ei vielä kirjaa
    g.confirm();
    expect(g.lastMove).toEqual({ player: "Tommi", columnId: "III", rowId: "fours", score: 24 });
  });

  it("cancel ei muuta lastMovea", () => {
    const g = new GameState(["A", "B"], 6, rng4);
    g.roll();
    g.commit("III", "fours", {});
    g.cancel();
    expect(g.lastMove).toBeNull();
  });

  it("poltto näkyy score 0:na", () => {
    const g = new GameState(["A", "B"], 6, rng4);
    g.roll();
    g.commit("III", "yatzy", { burn: true });
    g.confirm();
    expect(g.lastMove).toEqual({ player: "A", columnId: "III", rowId: "yatzy", score: 0 });
  });

  it("ei persistoidu snapshotin yli (transientti)", () => {
    const g = new GameState(["A", "B"], 6, rng4);
    g.roll();
    g.commit("III", "fours", {});
    g.confirm();
    const restored = GameState.fromSnapshot(g.toSnapshot(), rng4);
    expect(restored.lastMove).toBeNull();
  });
});

describe("GameState — anti-jumi (poltto heittorajan yli)", () => {
  /** Täytä kaikki solut arvolla 5 paitsi listatut. */
  function fillAllExcept(g: GameState, open: Array<[string, string]>): void {
    const card = g.players[0].card;
    for (const col of COLUMN_IDS) {
      for (const row of g.rowOrder) {
        if (open.some(([c, r]) => c === col && r === row)) continue;
        card.set(col, row, 5);
      }
    }
  }

  it("vain I-soluja auki + 3 heittoa → avoimet solut saa polttaa (ei jumia)", () => {
    const g = new GameState(["A"], 6, rng4);
    fillAllExcept(g, [["I", "ones"], ["I", "pair"]]);
    g.roll();
    g.roll();
    g.roll();
    const moves = g.availableMoves();
    expect(moves.length).toBe(2); // molemmat avoimet I-solut polttona
    expect(moves.every((m) => m.burn === true && m.score === 0)).toBe(true);

    g.commit("I", "ones", {});
    g.confirm();
    expect(g.players[0].card.get("I", "ones")).toBe(0); // poltto, ei noppapisteitä
  });

  it("heittorajan sisällä I-solu kirjautuu normaalisti pistein (ei burn-lippua)", () => {
    const g = new GameState(["A"], 6, rng4);
    fillAllExcept(g, [["I", "fours"]]);
    g.roll();
    const moves = g.availableMoves();
    expect(moves).toEqual([{ columnId: "I", rowId: "fours", score: 24 }]); // 6×4
  });

  it("poltto-fallback kunnioittaa ALAS-järjestystä", () => {
    const g = new GameState(["A"], 6, rng4);
    // Auki: I/ones (heittoraja ylittyy) — ALAS-sarake kokonaan auki.
    const card = g.players[0].card;
    for (const col of COLUMN_IDS) {
      if (col === "ALAS") continue;
      for (const row of g.rowOrder) {
        if (col === "I" && row === "ones") continue;
        card.set(col, row, 5);
      }
    }
    g.roll();
    g.roll();
    // ALAS on normaalisti kirjattavissa → EI fallbackia, I/ones ei tarjolla.
    const moves = g.availableMoves();
    expect(moves.some((m) => m.columnId === "I")).toBe(false);
    expect(moves.filter((m) => m.columnId === "ALAS").length).toBe(1); // vain seuraava rivi
  });
});

describe("GameState — pelin viimeinen kirjaus vaatii vahvistuksen", () => {
  it("isOver on false pending-tilassa; peru palauttaa pelin, vahvistus päättää", () => {
    const g = new GameState(["A"], 6, rng4);
    const card = g.players[0].card;
    for (const col of COLUMN_IDS) {
      for (const row of g.rowOrder) {
        if (col === "III" && row === "chance") continue;
        card.set(col, row, 5);
      }
    }
    g.roll();
    g.commit("III", "chance", {});
    expect(g.isOver()).toBe(false); // kortti täynnä, mutta vahvistus puuttuu
    g.cancel();
    expect(g.isOver()).toBe(false);
    g.commit("III", "chance", {});
    g.confirm();
    expect(g.isOver()).toBe(true);
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
