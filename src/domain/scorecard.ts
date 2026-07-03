import { COLUMN_IDS } from "./columns";
import { rowsForVariant } from "./categories";
import type { CellValue, ColumnId, DiceCount, RowDef, RowId } from "./types";

// Yhden pelaajan tulokortti. Jokainen sarake on itsenäinen "minijatsi" omalla
// yläbonuksellaan; pelin loppusumma on sarakkeiden summa.
export class Scorecard {
  readonly rows: readonly RowDef[];
  /** Yläbonuksen kynnys: k×21, missä k=3 (5 noppaa) tai k=4 (6 noppaa). */
  readonly bonusThreshold: number;
  /** Yläbonuksen arvo: 6 nopalla (kynnys 84) korotettu 100:aan, muuten 50. */
  private readonly bonusValue: number;
  private readonly cells = new Map<ColumnId, Map<RowId, CellValue>>();

  constructor(readonly diceCount: DiceCount) {
    this.rows = rowsForVariant(diceCount);
    this.bonusThreshold = (diceCount === 6 ? 4 : 3) * 21;
    this.bonusValue = diceCount === 6 ? 100 : 50;
    for (const col of COLUMN_IDS) {
      const m = new Map<RowId, CellValue>();
      for (const r of this.rows) m.set(r.id, null);
      this.cells.set(col, m);
    }
  }

  get(col: ColumnId, row: RowId): CellValue {
    return this.cells.get(col)!.get(row) ?? null;
  }

  isFilled(col: ColumnId, row: RowId): boolean {
    return this.get(col, row) !== null;
  }

  set(col: ColumnId, row: RowId, value: number): void {
    const m = this.cells.get(col)!;
    if (!m.has(row)) throw new Error(`Rivi ${row} ei kuulu tähän varianttiin`);
    if (m.get(row) !== null) throw new Error(`Solu ${col}/${row} on jo täytetty`);
    m.set(row, value);
  }

  /** Tyhjennä solu (väliaikaisen kirjauksen peruutus). */
  clear(col: ColumnId, row: RowId): void {
    this.cells.get(col)!.set(row, null);
  }

  /** Tässä sarakkeessa jo täytetyt rivit. */
  filledRows(col: ColumnId): Set<RowId> {
    const set = new Set<RowId>();
    for (const [row, val] of this.cells.get(col)!) if (val !== null) set.add(row);
    return set;
  }

  private upperRows(): RowDef[] {
    return this.rows.filter((r) => r.section === "upper");
  }

  upperSubtotal(col: ColumnId): number {
    return this.upperRows().reduce((acc, r) => acc + (this.get(col, r.id) ?? 0), 0);
  }

  upperBonus(col: ColumnId): number {
    return this.upperSubtotal(col) >= this.bonusThreshold ? this.bonusValue : 0;
  }

  /** Juokseva poikkeama odotusarvosta: Σ(kirjattu − silmäluku×k) täytetyille yläsoluille. */
  upperDeviation(col: ColumnId): number {
    const k = this.diceCount === 6 ? 4 : 3;
    let dev = 0;
    for (const r of this.upperRows()) {
      const v = this.get(col, r.id);
      if (v !== null) dev += v - r.face! * k;
    }
    return dev;
  }

  lowerSubtotal(col: ColumnId): number {
    return this.rows
      .filter((r) => r.section === "lower")
      .reduce((acc, r) => acc + (this.get(col, r.id) ?? 0), 0);
  }

  columnTotal(col: ColumnId): number {
    return this.upperSubtotal(col) + this.upperBonus(col) + this.lowerSubtotal(col);
  }

  /** Pelin loppusumma = sarakkeiden summa. */
  grandTotal(): number {
    return COLUMN_IDS.reduce((acc, col) => acc + this.columnTotal(col), 0);
  }

  /** Rivin yhteissumma sarakkeiden yli ("="-sarake näytöllä). */
  rowSum(row: RowId): number {
    return COLUMN_IDS.reduce((acc, col) => acc + (this.get(col, row) ?? 0), 0);
  }

  isComplete(): boolean {
    for (const col of COLUMN_IDS) {
      for (const r of this.rows) if (this.get(col, r.id) === null) return false;
    }
    return true;
  }
}
