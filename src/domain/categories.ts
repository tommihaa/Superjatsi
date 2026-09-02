import type { DiceCount, RowDef, RowId } from "./types";

// Rivien kanoninen järjestys (ylhäältä alas tulokortissa). ALAS/YLÖS-sarakkeiden
// pakkojärjestys seuraa tätä listaa. Yläosa ensin, sitten alaosa.
// Rivien nimet ja selitteet ovat kieltä eivätkä sääntöä: ne asuvat
// ui/locales/*.ts:n `rows`-taulussa rivin id:llä (kielituki 3.9.2026).
export const ALL_ROWS: readonly RowDef[] = [
  { id: "ones", section: "upper", face: 1 },
  { id: "twos", section: "upper", face: 2 },
  { id: "threes", section: "upper", face: 3 },
  { id: "fours", section: "upper", face: 4 },
  { id: "fives", section: "upper", face: 5 },
  { id: "sixes", section: "upper", face: 6 },
  { id: "pair", section: "lower" },
  { id: "twoPairs", section: "lower" },
  { id: "threePairs", section: "lower", sixOnly: true },
  { id: "threeKind", section: "lower" },
  { id: "fourKind", section: "lower" },
  { id: "fullHouse", section: "lower" },
  { id: "smallStraight", section: "lower" },
  { id: "largeStraight", section: "lower" },
  { id: "fullStraight", section: "lower", sixOnly: true },
  { id: "huvila", section: "lower", sixOnly: true },
  { id: "torni", section: "lower", sixOnly: true },
  { id: "chance", section: "lower" },
  { id: "yatzy", section: "lower" },
  { id: "superyatzy", section: "lower", sixOnly: true },
] as const;

/** Variantin aktiiviset rivit: 5 nopalla pudotetaan sixOnly-rivit. */
export function rowsForVariant(diceCount: DiceCount): RowDef[] {
  return ALL_ROWS.filter((r) => diceCount === 6 || !r.sixOnly);
}

export function rowDef(id: RowId): RowDef {
  const def = ALL_ROWS.find((r) => r.id === id);
  if (!def) throw new Error(`Tuntematon rivi: ${id}`);
  return def;
}
