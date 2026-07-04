import { describe, expect, it } from "vitest";
import { GameState } from "../src/domain/game";
import { COLUMN_IDS } from "../src/domain/columns";
import { buildView } from "../src/ui/view";

// Deterministinen rng: kaikki nopat 4 (1 + floor(0.5×6) = 4).
const rng4 = () => 0.5;

describe("buildView — juhlaportaat (celebration)", () => {
  it("ei juhli ennen heittoa", () => {
    const g = new GameState(["A"], 6, rng4);
    expect(buildView(g).celebration).toBeNull();
  });

  it("kuusi samaa: Superjatsi/Jatsi-maksimi tarjolla → TOP ja hehkusolut mukana", () => {
    const g = new GameState(["A"], 6, rng4);
    g.roll(); // kuusi nelosta → superyatzy 100 ja yatzy 50 tarjolla (kiinteä = max)
    const v = buildView(g);
    expect(v.celebration).toBe("top");
    expect(v.celebrationCells.length).toBeGreaterThan(0);
  });

  it("tavallinen sekakäsi ilman komboja → ei juhlita", () => {
    const g = new GameState(["A"], 6, rng4);
    g.roll();
    g.dice.values = [1, 2, 3, 3, 5, 6]; // ei suoraa (4 puuttuu), ei pareja kolmea
    expect(buildView(g).celebration).toBeNull();
  });

  it("pieni suora → GREAT (yleinen kombo, ei sadetta)", () => {
    const g = new GameState(["A"], 6, rng4);
    g.roll();
    g.dice.values = [1, 2, 3, 4, 5, 3];
    const v = buildView(g);
    expect(v.celebration).toBe("great");
    expect(v.celebrationCells.some((c) => c.rowId === "smallStraight")).toBe(true);
  });

  it("Täyskäsi maksimina (666 55) → TOP; vaatimattomampi täyskäsi ei juhli", () => {
    const g = new GameState(["A"], 6, rng4);
    g.roll();
    g.dice.values = [6, 6, 6, 5, 5, 1]; // täyskäsi 28 = kategorian max
    expect(buildView(g).celebration).toBe("top");
    g.dice.values = [3, 3, 3, 2, 2, 1]; // täyskäsi 13 — kelpo, muttei maksimi
    expect(buildView(g).celebration).toBeNull();
  });

  it("Neljä samaa maksimina (neljä kutosta) → TOP", () => {
    const g = new GameState(["A"], 6, rng4);
    g.roll();
    g.dice.values = [6, 6, 6, 6, 2, 1]; // 24 = max (ei suoraa/huvilaa/tornia)
    expect(buildView(g).celebration).toBe("top");
  });

  it("Kolme paria: maksimina (66 55 44) → TOP, muuten → GREAT", () => {
    const g = new GameState(["A"], 6, rng4);
    g.roll();
    g.dice.values = [6, 6, 5, 5, 4, 4]; // 30 = kategorian max
    expect(buildView(g).celebration).toBe("top");
    g.dice.values = [2, 2, 4, 4, 5, 5]; // kolme paria 22 — hieno muttei maksimi
    const v = buildView(g);
    expect(v.celebration).toBe("great");
    expect(v.celebrationCells.some((c) => c.rowId === "threePairs")).toBe(true);
  });

  it("yläbonuksen varmistava kirjaus → GREAT; yhden pisteen vajaus → ei juhlaa", () => {
    // Kaikki muut solut täyteen paitsi III/neloset; III-sarakkeen muu yläosa
    // säädetään niin, että kuusi nelosta (24 p) joko ylittää kynnyksen 84 tai ei.
    const setup = (upperOthers: number): GameState => {
      const g = new GameState(["A"], 6, rng4);
      const card = g.players[0].card;
      for (const col of COLUMN_IDS) {
        for (const row of g.rowOrder) {
          if (col === "III" && row === "fours") continue;
          const isUpperIII = col === "III" && card.rows.find((r) => r.id === row)?.section === "upper";
          card.set(col, row, isUpperIII ? upperOthers : 5);
        }
      }
      g.roll(); // kuusi nelosta → III/neloset 24 p
      return g;
    };
    // 5 muuta ylärkiviä à 12 = 60; 60 + 24 = 84 = kynnys → bonus varmistuu.
    const v = buildView(setup(12));
    expect(v.celebration).toBe("great");
    expect(v.celebrationCells).toEqual([{ columnId: "III", rowId: "fours" }]);
    // à 11 = 55; 55 + 24 = 79 < 84 → ei juhlaa.
    expect(buildView(setup(11)).celebration).toBeNull();
  });
});
