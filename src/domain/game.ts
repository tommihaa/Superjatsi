import { rowsForVariant } from "./categories";
import { COLUMN_IDS, createColumns, type ColumnRule } from "./columns";
import { DiceSet, defaultRng, type Rng } from "./dice";
import { Scorecard } from "./scorecard";
import { scoreFor } from "./scoring";
import type { ColumnId, DiceCount, GameSnapshot, Move, PendingCommit, RowId } from "./types";

export const MAX_ROLLS = 3;
const SNAPSHOT_VERSION = 1;

export interface Player {
  name: string;
  card: Scorecard;
}

// Pelin tila ja kulku. Service-kerros: UI ei kutsu Scorecardia tai sääntöjä suoraan,
// vaan tätä. availableMoves() on ainoa lähde UI:n korostuksille.
export class GameState {
  readonly players: Player[];
  readonly columns: ColumnRule[] = createColumns();
  readonly rowOrder: RowId[];
  readonly dice: DiceSet;
  rollsUsed = 0;
  currentPlayerIndex = 0;
  /** Väliaikainen kirjaus joka odottaa vahvistusta tai peruutusta. */
  pending: PendingCommit | null = null;

  constructor(
    playerNames: string[],
    readonly diceCount: DiceCount,
    rng: Rng = defaultRng,
  ) {
    if (playerNames.length < 1) throw new Error("Vähintään 1 pelaaja");
    this.players = playerNames.map((name) => ({ name, card: new Scorecard(diceCount) }));
    this.rowOrder = rowsForVariant(diceCount).map((r) => r.id);
    this.dice = new DiceSet(diceCount, rng);
  }

  currentPlayer(): Player {
    return this.players[this.currentPlayerIndex];
  }

  currentCard(): Scorecard {
    return this.currentPlayer().card;
  }

  canRoll(): boolean {
    return !this.isOver() && !this.pending && this.rollsUsed < MAX_ROLLS;
  }

  roll(): void {
    if (!this.canRoll()) throw new Error("Ei heittoja jäljellä");
    this.dice.roll();
    this.rollsUsed++;
  }

  toggleHold(i: number): void {
    this.dice.toggleHold(i);
  }

  /** Solut joihin nykyisillä nopilla saa kirjata, ehdotuspisteineen. */
  availableMoves(): Move[] {
    if (this.rollsUsed < 1 || this.isOver() || this.pending) return [];
    const card = this.currentCard();
    const moves: Move[] = [];
    for (const col of this.columns) {
      const filled = card.filledRows(col.id);
      for (const rowId of this.rowOrder) {
        if (filled.has(rowId)) continue;
        if (col.canWrite(rowId, filled, this.rollsUsed, this.rowOrder)) {
          moves.push({ columnId: col.id, rowId, score: scoreFor(rowId, this.dice.values, this.diceCount) });
        }
      }
    }
    return moves;
  }

  private isMoveAllowed(columnId: ColumnId, rowId: RowId): boolean {
    return this.availableMoves().some((m) => m.columnId === columnId && m.rowId === rowId);
  }

  /**
   * Kirjaa tulos soluun (tai polta = 0) VÄLIAIKAISESTI. Vuoro ei siirry vielä;
   * pelaaja joko vahvistaa (confirm) tai peruu (cancel).
   */
  commit(columnId: ColumnId, rowId: RowId, opts: { burn?: boolean } = {}): void {
    if (this.pending) throw new Error("Edellinen kirjaus odottaa vahvistusta");
    if (!this.isMoveAllowed(columnId, rowId)) {
      throw new Error(`Siirto ${columnId}/${rowId} ei ole sallittu nyt`);
    }
    const value = opts.burn ? 0 : scoreFor(rowId, this.dice.values, this.diceCount);
    this.currentCard().set(columnId, rowId, value);
    this.pending = { columnId, rowId };
  }

  hasPending(): boolean {
    return this.pending !== null;
  }

  /** Vahvista väliaikainen kirjaus ja siirrä vuoro seuraavalle. */
  confirm(): void {
    if (!this.pending) throw new Error("Ei vahvistettavaa kirjausta");
    this.pending = null;
    this.endTurn();
  }

  /** Peru väliaikainen kirjaus; jää samaan vuoroon (nopat ja heitot ennallaan). */
  cancel(): void {
    if (!this.pending) throw new Error("Ei peruttavaa kirjausta");
    this.currentCard().clear(this.pending.columnId, this.pending.rowId);
    this.pending = null;
  }

  private endTurn(): void {
    this.dice.reset();
    this.rollsUsed = 0;
    this.advancePlayer();
  }

  private advancePlayer(): void {
    const n = this.players.length;
    for (let step = 1; step <= n; step++) {
      const idx = (this.currentPlayerIndex + step) % n;
      if (!this.players[idx].card.isComplete()) {
        this.currentPlayerIndex = idx;
        return;
      }
    }
    // Kaikki valmiita: peli ohi, jätetään indeksi ennalleen.
  }

  isOver(): boolean {
    return this.players.every((p) => p.card.isComplete());
  }

  /** Voittaja(t) suurimmalla loppusummalla; tasapelissä useampi. */
  winners(): Player[] {
    const top = Math.max(...this.players.map((p) => p.card.grandTotal()));
    return this.players.filter((p) => p.card.grandTotal() === top);
  }

  // --- Persistointi ---

  toSnapshot(): GameSnapshot {
    return {
      version: SNAPSHOT_VERSION,
      diceCount: this.diceCount,
      currentPlayerIndex: this.currentPlayerIndex,
      dice: [...this.dice.values],
      held: [...this.dice.held],
      rollsUsed: this.rollsUsed,
      pending: this.pending ? { ...this.pending } : null,
      players: this.players.map((p) => {
        const cells: Record<string, Record<string, number | null>> = {};
        for (const col of COLUMN_IDS) {
          cells[col] = {};
          for (const r of p.card.rows) cells[col][r.id] = p.card.get(col, r.id);
        }
        return { name: p.name, cells };
      }),
    };
  }

  static fromSnapshot(snap: GameSnapshot, rng: Rng = defaultRng): GameState {
    if (snap.version !== SNAPSHOT_VERSION) throw new Error("Eri tallennusversio");
    const game = new GameState(
      snap.players.map((p) => p.name),
      snap.diceCount,
      rng,
    );
    snap.players.forEach((p, i) => {
      const card = game.players[i].card;
      for (const col of COLUMN_IDS) {
        for (const r of card.rows) {
          const v = p.cells[col]?.[r.id];
          if (typeof v === "number") card.set(col, r.id, v);
        }
      }
    });
    game.currentPlayerIndex = snap.currentPlayerIndex;
    game.rollsUsed = snap.rollsUsed;
    game.dice.values = [...snap.dice];
    game.dice.held = [...snap.held];
    game.pending = snap.pending ? { ...snap.pending } : null;
    return game;
  }
}
