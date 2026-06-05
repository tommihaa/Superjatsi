import { COLUMN_IDS } from "../domain/columns";
import type { GameState } from "../domain/game";
import type { ColumnId, DiceCount, RowId } from "../domain/types";

// Domainista johdettu, serialisoitava näkymämalli. UI-komponentit lukevat vain tätä
// eivätkä koskaan kutsu domainia suoraan (yksisuuntainen datavirta).

export interface DiceView {
  value: number; // 0 = ei vielä heitetty
  held: boolean;
}
export interface PlayerView {
  name: string;
  total: number;
}
export interface CellView {
  value: number | null;
  available: boolean;
  /** Ehdotuspisteet jos solu täytetään nyt (vain kun available). */
  score: number;
  /** Tämä solu on väliaikaisesti kirjattu ja odottaa vahvistusta. */
  pending: boolean;
}
export interface RowView {
  id: RowId;
  label: string;
  section: "upper" | "lower";
  cells: Record<ColumnId, CellView>;
  sum: number;
}
export interface ColumnSummary {
  subtotal: number;
  bonus: number;
  deviation: number;
  total: number;
}
export interface BoardView {
  columns: readonly ColumnId[];
  rows: RowView[];
  summary: Record<ColumnId, ColumnSummary>;
  grandTotal: number;
}
export interface GameView {
  diceCount: DiceCount;
  players: PlayerView[];
  currentPlayerIndex: number;
  currentName: string;
  rollsUsed: number;
  rollsLeft: number;
  canRoll: boolean;
  hasRolled: boolean;
  hasPending: boolean;
  dice: DiceView[];
  isOver: boolean;
  winners: string[];
  board: BoardView;
}

export function buildView(game: GameState): GameView {
  const card = game.currentCard();
  const moves = new Map<string, number>();
  for (const m of game.availableMoves()) moves.set(`${m.columnId}/${m.rowId}`, m.score);

  const rows: RowView[] = card.rows.map((r) => {
    const cells = {} as Record<ColumnId, CellView>;
    for (const col of COLUMN_IDS) {
      const key = `${col}/${r.id}`;
      const isPending = game.pending?.columnId === col && game.pending?.rowId === r.id;
      cells[col] = {
        value: card.get(col, r.id),
        available: moves.has(key),
        score: moves.get(key) ?? 0,
        pending: isPending,
      };
    }
    return { id: r.id, label: r.label, section: r.section, cells, sum: card.rowSum(r.id) };
  });

  const summary = {} as Record<ColumnId, ColumnSummary>;
  for (const col of COLUMN_IDS) {
    summary[col] = {
      subtotal: card.upperSubtotal(col),
      bonus: card.upperBonus(col),
      deviation: card.upperDeviation(col),
      total: card.columnTotal(col),
    };
  }

  return {
    diceCount: game.diceCount,
    players: game.players.map((p) => ({ name: p.name, total: p.card.grandTotal() })),
    currentPlayerIndex: game.currentPlayerIndex,
    currentName: game.currentPlayer().name,
    rollsUsed: game.rollsUsed,
    rollsLeft: 3 - game.rollsUsed,
    canRoll: game.canRoll(),
    hasRolled: game.rollsUsed > 0,
    hasPending: game.hasPending(),
    dice: game.dice.values.map((value, i) => ({ value, held: game.dice.held[i] })),
    isOver: game.isOver(),
    winners: game.winners().map((p) => p.name),
    board: { columns: COLUMN_IDS, rows, summary, grandTotal: card.grandTotal() },
  };
}
