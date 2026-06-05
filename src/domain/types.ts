// Domain-tyypit. Tämä moduuli ei tunne DOMia eikä UI:ta.

/** Pelisarakkeet. "=" (rivisumma) on vain näyttöä, ei pelisarake. */
export type ColumnId = "I" | "II" | "III" | "ALAS" | "YLOS";

/** Kaikki mahdolliset rivit. Osa on vain 6 nopan variantissa. */
export type RowId =
  | "ones"
  | "twos"
  | "threes"
  | "fours"
  | "fives"
  | "sixes"
  | "pair"
  | "twoPairs"
  | "threePairs"
  | "threeKind"
  | "fourKind"
  | "fullHouse"
  | "smallStraight"
  | "largeStraight"
  | "fullStraight"
  | "chance"
  | "yatzy"
  | "superyatzy";

/** Variantti: noppien määrä. */
export type DiceCount = 5 | 6;

/** Rivin metatieto. */
export interface RowDef {
  id: RowId;
  /** Suomenkielinen otsikko (i18n myöhemmin keskitetysti). */
  label: string;
  section: "upper" | "lower";
  /** Yläosan riveillä silmäluku 1..6, muuten undefined. */
  face?: number;
  /** Vain 6 nopan variantissa mukana. */
  sixOnly?: boolean;
}

/** Yhden solun tila: null = tyhjä, luku = kirjattu (0 = poltettu). */
export type CellValue = number | null;

/** Mahdollinen siirto, jonka UI voi tarjota pelaajalle. */
export interface Move {
  columnId: ColumnId;
  rowId: RowId;
  /** Ehdotuspisteet nykyisillä nopilla jos solu täytetään. */
  score: number;
}

/** Serialisoitava tilannekuva persistointia varten. */
export interface PendingCommit {
  columnId: ColumnId;
  rowId: RowId;
}

export interface GameSnapshot {
  version: number;
  diceCount: DiceCount;
  players: PlayerSnapshot[];
  currentPlayerIndex: number;
  dice: number[];
  held: boolean[];
  rollsUsed: number;
  pending: PendingCommit | null;
}

export interface PlayerSnapshot {
  name: string;
  /** cells[columnId][rowId] = CellValue */
  cells: Record<string, Record<string, CellValue>>;
}
