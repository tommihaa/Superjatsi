import type { ColumnId, RowId } from "./types";

// Sarakerajoitteet strategiakuviona (Java-analogia: yksi interface, monta toteutusta).
// canWrite kertoo, saako annettuun soluun kirjata juuri nyt.

export interface ColumnRule {
  readonly id: ColumnId;
  /** Montako heittoa sarakkeeseen saa enintään käyttää ennen kirjausta. */
  readonly maxRolls: number;
  /**
   * Saako (rowId) kirjata tähän sarakkeeseen nyt?
   * @param filled  jo täytetyt rivit tässä sarakkeessa
   * @param rollsUsed heittoja käytetty tällä vuorolla (1..3)
   * @param rowOrder variantin rivit kanonisessa järjestyksessä
   */
  canWrite(rowId: RowId, filled: ReadonlySet<RowId>, rollsUsed: number, rowOrder: readonly RowId[]): boolean;
}

/** I/II/III: vapaa rivijärjestys, mutta heittoja saa olla enintään maxRolls. */
export class ThrowLimitColumn implements ColumnRule {
  constructor(readonly id: ColumnId, readonly maxRolls: number) {}

  canWrite(rowId: RowId, filled: ReadonlySet<RowId>, rollsUsed: number, _rowOrder: readonly RowId[]): boolean {
    if (rollsUsed < 1 || rollsUsed > this.maxRolls) return false;
    return !filled.has(rowId);
  }
}

/** ALAS/YLÖS: 3 heittoa, mutta rivit on täytettävä pakkojärjestyksessä. */
export class OrderedColumn implements ColumnRule {
  readonly maxRolls = 3;
  constructor(readonly id: ColumnId, readonly direction: "down" | "up") {}

  /** Järjestyksen seuraava täytettävä rivi, tai null jos sarake täynnä. */
  nextRow(filled: ReadonlySet<RowId>, rowOrder: readonly RowId[]): RowId | null {
    const seq = this.direction === "down" ? rowOrder : [...rowOrder].reverse();
    for (const id of seq) if (!filled.has(id)) return id;
    return null;
  }

  canWrite(rowId: RowId, filled: ReadonlySet<RowId>, rollsUsed: number, rowOrder: readonly RowId[]): boolean {
    if (rollsUsed < 1) return false;
    return this.nextRow(filled, rowOrder) === rowId;
  }
}

/** Pelin sarakkeet vasemmalta oikealle. */
export function createColumns(): ColumnRule[] {
  return [
    new ThrowLimitColumn("I", 1),
    new ThrowLimitColumn("II", 2),
    new ThrowLimitColumn("III", 3),
    new OrderedColumn("ALAS", "down"),
    new OrderedColumn("YLOS", "up"),
  ];
}

export const COLUMN_IDS: readonly ColumnId[] = ["I", "II", "III", "ALAS", "YLOS"];
