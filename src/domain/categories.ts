import type { DiceCount, RowDef, RowId } from "./types";

// Rivien kanoninen järjestys (ylhäältä alas tulokortissa). ALAS/YLÖS-sarakkeiden
// pakkojärjestys seuraa tätä listaa. Yläosa ensin, sitten alaosa.
export const ALL_ROWS: readonly RowDef[] = [
  { id: "ones", label: "Ykköset", section: "upper", face: 1 },
  { id: "twos", label: "Kakkoset", section: "upper", face: 2 },
  { id: "threes", label: "Kolmoset", section: "upper", face: 3 },
  { id: "fours", label: "Neloset", section: "upper", face: 4 },
  { id: "fives", label: "Vitoset", section: "upper", face: 5 },
  { id: "sixes", label: "Kutoset", section: "upper", face: 6 },
  { id: "pair", label: "Pari", section: "lower" },
  { id: "twoPairs", label: "Kaksi paria", section: "lower" },
  { id: "threePairs", label: "Kolme paria", section: "lower", sixOnly: true },
  { id: "threeKind", label: "Kolme samaa", section: "lower" },
  { id: "fourKind", label: "Neljä samaa", section: "lower" },
  { id: "fullHouse", label: "Täyskäsi", section: "lower" },
  { id: "smallStraight", label: "Pieni suora", section: "lower" },
  { id: "largeStraight", label: "Suuri suora", section: "lower" },
  { id: "fullStraight", label: "Täyssuora", section: "lower", sixOnly: true },
  { id: "huvila", label: "Huvila", section: "lower", sixOnly: true },
  { id: "torni", label: "Torni", section: "lower", sixOnly: true },
  { id: "chance", label: "Sattuma", section: "lower" },
  { id: "yatzy", label: "Jatsi", section: "lower" },
  { id: "superyatzy", label: "Superjatsi", section: "lower", sixOnly: true },
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
