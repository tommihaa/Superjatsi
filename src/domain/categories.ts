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
  { id: "pair", label: "Pari", section: "lower", description: "2 samaa silmälukua" },
  { id: "twoPairs", label: "Kaksi paria", section: "lower", description: "2 eri paria" },
  {
    id: "threePairs",
    label: "Kolme paria",
    section: "lower",
    sixOnly: true,
    description: "3 eri paria (kaikki 6 noppaa)",
  },
  { id: "threeKind", label: "Kolme samaa", section: "lower", description: "3 samaa silmälukua" },
  { id: "fourKind", label: "Neljä samaa", section: "lower", description: "4 samaa silmälukua" },
  {
    id: "fullHouse",
    label: "Täyskäsi",
    section: "lower",
    description: "3 + 2 samaa (kaksi eri silmälukua)",
  },
  { id: "smallStraight", label: "Pieni suora", section: "lower", description: "1-2-3-4-5" },
  { id: "largeStraight", label: "Suuri suora", section: "lower", description: "2-3-4-5-6" },
  {
    id: "fullStraight",
    label: "Täyssuora",
    section: "lower",
    sixOnly: true,
    description: "1-2-3-4-5-6 (kaikki 6 noppaa)",
  },
  {
    id: "huvila",
    label: "Huvila",
    section: "lower",
    sixOnly: true,
    description: "3 + 3 samaa (kaksi eri kolmikkoa)",
  },
  {
    id: "torni",
    label: "Torni",
    section: "lower",
    sixOnly: true,
    description: "4 + 2 samaa (kaksi eri silmälukua)",
  },
  { id: "chance", label: "Sattuma", section: "lower", description: "Mikä tahansa yhdistelmä" },
  { id: "yatzy", label: "Jatsi", section: "lower", description: "5 samaa silmälukua" },
  {
    id: "superyatzy",
    label: "Superjatsi",
    section: "lower",
    sixOnly: true,
    description: "6 samaa silmälukua",
  },
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
