import { describe, expect, it } from "vitest";
import { GameState } from "../src/domain/game";
import { COLUMN_IDS } from "../src/domain/columns";
import type { DiceCount } from "../src/domain/types";

// Seedattu PRNG (mulberry32): sama seed → toistettava failure.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Aikabudjetti: 1000 peliä (500 per variantti). Jos hidas, pudota tästä.
const GAMES_PER_VARIANT = 500;

function playRandomGame(dice: DiceCount, rng: () => number): GameState {
  // Peli käyttää omaa seedattua rng:tä nopille; botin päätökset toisesta virrasta,
  // jotta molemmat ovat toistettavia mutta riippumattomia.
  const g = new GameState(["Botti"], dice, rng);
  let guard = 0;
  while (!g.isOver()) {
    if (guard++ > 100000) throw new Error("Peli ei pääty (soft-lock?)");
    // Satunnainen määrä heittoja (1..3), togglaten välillä holdeja.
    const throws = 1 + Math.floor(rng() * 3);
    for (let t = 0; t < throws && g.canRoll(); t++) {
      g.roll();
      if (rng() < 0.4) {
        const i = Math.floor(rng() * dice);
        g.toggleHold(i);
      }
    }
    const moves = g.availableMoves();
    // Anti-jumi-invariantti: heiton jälkeen aina vähintään yksi laillinen siirto.
    expect(moves.length).toBeGreaterThan(0);
    const pick = moves[Math.floor(rng() * moves.length)];
    g.commit(pick.columnId, pick.rowId, {});
    g.confirm();
  }
  return g;
}

describe("Superjatsi — satunnaisbottisimulaatio", () => {
  for (const dice of [5, 6] as DiceCount[]) {
    it(`${GAMES_PER_VARIANT} peliä ${dice} nopalla: invariantit pitävät`, () => {
      for (let s = 0; s < GAMES_PER_VARIANT; s++) {
        const rng = mulberry32(dice * 1_000_000 + s);
        const g = playRandomGame(dice, rng);
        const card = g.players[0].card;

        // 1) Peli valmistui.
        expect(card.isComplete()).toBe(true);

        // 2) grandTotal = sarakkeiden columnTotal-summa.
        const colSum = COLUMN_IDS.reduce((a, c) => a + card.columnTotal(c), 0);
        expect(card.grandTotal()).toBe(colSum);

        // 3) columnTotal = upperSubtotal + upperBonus + lowerSubtotal (per sarake).
        for (const col of COLUMN_IDS) {
          const expected =
            card.upperSubtotal(col) + card.upperBonus(col) + card.lowerSubtotal(col);
          expect(card.columnTotal(col)).toBe(expected);

          // 4) Yläbonus: oikea kynnys ja arvo per variantti.
          const threshold = dice === 6 ? 84 : 63;
          const value = dice === 6 ? 100 : 50;
          const bonus = card.upperSubtotal(col) >= threshold ? value : 0;
          expect(card.upperBonus(col)).toBe(bonus);
        }
      }
    });
  }
});
