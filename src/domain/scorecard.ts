import { COLUMN_IDS } from "./columns";
import { rowsForVariant } from "./categories";
import type { CellValue, ColumnId, DiceCount, RowDef, RowId } from "./types";

// Yhden pelaajan tulokortti. Jokainen sarake on itsenäinen "minijatsi" omalla
// yläbonuksellaan; pelin loppusumma on sarakkeiden summa.
export class Scorecard {
  readonly rows: readonly RowDef[];
  /** Yläbonuksen kynnys: 63 viidellä nopalla (3×21), 76 kuudella (Tommin päätös
   *  2.9.2026 mittauksen docs/ylabonus-mittaus.md perusteella; aiemmin 4×21 = 84). */
  readonly bonusThreshold: number;
  /** Yläbonuksen arvo: +50 kummassakin variantissa (6 nopalla aiemmin 100, kun
   *  kynnys oli 84). */
  readonly bonusValue: number;
  private readonly cells = new Map<ColumnId, Map<RowId, CellValue>>();

  constructor(readonly diceCount: DiceCount) {
    this.rows = rowsForVariant(diceCount);
    this.bonusThreshold = diceCount === 6 ? 76 : 63;
    this.bonusValue = 50;
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

  /** Poikkeaman rivitahti: silmäluku × kynnys/21 pyöristettynä kokonaisluvuksi.
   *  Viidellä nopalla 3×silmäluku (summa 63), kuudella 4, 7, 11, 14, 18, 22
   *  (summa 76). Tahtien summa on täsmälleen kynnys, joten poikkeama pysyy
   *  kokonaislukuna ja on lopussa ≥ 0 täsmälleen silloin kun bonus tulee. */
  upperPace(face: number): number {
    return Math.round((face * this.bonusThreshold) / 21);
  }

  /** Juokseva poikkeama odotusarvosta: Σ(kirjattu − rivitahti) täytetyille yläsoluille. */
  upperDeviation(col: ColumnId): number {
    let dev = 0;
    for (const r of this.upperRows()) {
      const v = this.get(col, r.id);
      if (v !== null) dev += v - this.upperPace(r.face!);
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

  /** Yhtään solua ei ole vielä täytetty. Keskeytetty peli kirjataan keskiarvoon
   *  vain jos pelaaja ehti kirjata jotain — vahingossa aloitettu tyhjä peli
   *  ei saa painaa keskiarvoa nollalla. */
  isEmpty(): boolean {
    for (const col of COLUMN_IDS) {
      for (const r of this.rows) if (this.get(col, r.id) !== null) return false;
    }
    return true;
  }

  isComplete(): boolean {
    for (const col of COLUMN_IDS) {
      for (const r of this.rows) if (this.get(col, r.id) === null) return false;
    }
    return true;
  }
}
