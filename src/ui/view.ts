import { COLUMN_IDS, OrderedColumn } from "../domain/columns";
import type { GameState } from "../domain/game";
import { maxScoreFor } from "../domain/scoring";
import type { ColumnId, DiceCount, Move, RowId } from "../domain/types";

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
  /** ALAS/YLÖS: tämä on järjestyksen seuraava täytettävä solu (indikaattori). */
  orderNext: boolean;
  /** Ehdotuspisteet ovat kategorian teoreettinen maksimi (vain kun available). */
  isMax: boolean;
}
export interface RowView {
  id: RowId;
  label: string;
  section: "upper" | "lower";
  /** Lyhyt kombivaatimuksen selite hover-tooltipiä varten (jos määritelty). */
  description?: string;
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
  /** Sarakkeet joihin ei tällä heittomäärällä voi enää kirjata (himmennys). */
  dimmedColumns: ColumnId[];
  /** Yläbonuksen kynnys ja arvo (variantin mukaan) bonusrivin selitettä varten. */
  bonusThreshold: number;
  bonusValue: number;
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
  /** Viimeisin vahvistettu kirjaus vuoronvaihdon kuittausta varten. */
  lastMove: LastMoveView | null;
  /** Juhlaporras heiton jälkeen: "top" = tähtisade + hehku (harvinaiset huippukombot),
   *  "great" = pelkkä hehku. Rajat kalibroitu simulaatiolla (ks. CHANGELOG 0.6.0). */
  celebration: "top" | "great" | null;
  /** Solut joihin hehku kohdistetaan kun celebration on asetettu. */
  celebrationCells: CellRef[];
}

export interface CellRef {
  columnId: ColumnId;
  rowId: RowId;
}

export interface LastMoveView {
  player: string;
  rowLabel: string;
  columnId: ColumnId;
  /** Kirjattu arvo; 0 = poltto. */
  score: number;
}

// Juhlaportaat kalibroitu simulaatiolla 4.7.2026 (300 yksinpeliä, ~74 000 heittoa):
// TOP ~6 ja GREAT ~10 laukaisua per yksinpeli — tier määräytyy harvinaisuuden,
// ei kombon nimen mukaan (siksi suorat ovat "vain" GREAT ja Kolme paria elää
// molemmissa: maksimina 66 55 44 TOP, muuten GREAT).

/** Tähtisade + hehku: harvinaiset maksimit. */
const TOP_ROWS: ReadonlySet<RowId> = new Set<RowId>([
  "fullStraight",
  "fullHouse",
  "fourKind",
  "threePairs",
  "huvila",
  "torni",
  "yatzy",
  "superyatzy",
]);
/** Pelkkä hehku: yleisemmät hienot kädet (pisteellisenä, ei maksimia vaadita). */
const GREAT_ROWS: ReadonlySet<RowId> = new Set<RowId>([
  "smallStraight",
  "largeStraight",
  "threePairs",
]);

export function buildView(game: GameState): GameView {
  const card = game.currentCard();
  const moves = new Map<string, Move>();
  for (const m of game.availableMoves()) moves.set(`${m.columnId}/${m.rowId}`, m);

  // Juhlaportaan valinta: TOP-maksimi voittaa; muuten GREAT jos tarjolla suora/
  // kolme paria, yläbonuksen varmistava kirjaus tai ≥3 ★-maksimiriviä.
  const topCells: CellRef[] = [];
  const greatCells: CellRef[] = [];
  const maxCells: CellRef[] = [];
  const maxRows = new Set<RowId>();
  for (const m of moves.values()) {
    if (m.score <= 0) continue;
    const ref: CellRef = { columnId: m.columnId, rowId: m.rowId };
    const isMax = m.score === maxScoreFor(m.rowId, game.diceCount);
    if (isMax) {
      maxRows.add(m.rowId);
      maxCells.push(ref);
    }
    if (isMax && TOP_ROWS.has(m.rowId)) topCells.push(ref);
    else if (GREAT_ROWS.has(m.rowId)) greatCells.push(ref);
    if (card.rows.find((r) => r.id === m.rowId)?.section === "upper") {
      const sub = card.upperSubtotal(m.columnId);
      if (sub < card.bonusThreshold && sub + m.score >= card.bonusThreshold) greatCells.push(ref);
    }
  }
  let celebration: GameView["celebration"] = null;
  let celebrationCells: CellRef[] = [];
  if (topCells.length > 0) {
    celebration = "top";
    celebrationCells = maxCells; // sade + kaikki ★-solut hehkuvat
  } else if (greatCells.length > 0 || maxRows.size >= 3) {
    celebration = "great";
    const cells = maxRows.size >= 3 ? [...greatCells, ...maxCells] : greatCells;
    celebrationCells = [...new Map(cells.map((c) => [`${c.columnId}/${c.rowId}`, c])).values()];
  }

  // ALAS/YLÖS: järjestyksen seuraava rivi näkyy indikaattorina jo ennen heittoa.
  const nextRows = new Map<ColumnId, RowId | null>();
  for (const col of game.columns) {
    if (col instanceof OrderedColumn) {
      nextRows.set(col.id, col.nextRow(card.filledRows(col.id), game.rowOrder));
    }
  }

  // Sarakkeet joiden heittoraja on ylittynyt tällä vuorolla → himmennetään.
  // Pending-tilassa ei himmennetä (koko kortti on jo "lukossa" vahvistukseen asti).
  const dimmedColumns =
    game.rollsUsed > 0 && !game.hasPending() && !game.isOver()
      ? game.columns.filter((c) => game.rollsUsed > c.maxRolls).map((c) => c.id)
      : [];

  const rows: RowView[] = card.rows.map((r) => {
    const cells = {} as Record<ColumnId, CellView>;
    for (const col of COLUMN_IDS) {
      const key = `${col}/${r.id}`;
      const isPending = game.pending?.columnId === col && game.pending?.rowId === r.id;
      const mv = moves.get(key);
      const score = mv?.score ?? 0;
      cells[col] = {
        value: card.get(col, r.id),
        available: mv !== undefined,
        score,
        pending: isPending,
        orderNext: nextRows.get(col) === r.id,
        isMax: score > 0 && score === maxScoreFor(r.id, game.diceCount),
      };
    }
    return {
      id: r.id,
      label: r.label,
      section: r.section,
      ...(r.description !== undefined ? { description: r.description } : {}),
      cells,
      sum: card.rowSum(r.id),
    };
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
    board: {
      columns: COLUMN_IDS,
      rows,
      summary,
      grandTotal: card.grandTotal(),
      dimmedColumns,
      bonusThreshold: card.bonusThreshold,
      bonusValue: card.bonusValue,
    },
    lastMove: game.lastMove
      ? {
          player: game.lastMove.player,
          // Rivimääritykset ovat samat kaikilla pelaajilla → nykyisen kortin
          // rivilista kelpaa myös edellisen pelaajan kirjauksen selitteeksi.
          rowLabel: card.rows.find((r) => r.id === game.lastMove!.rowId)?.label ?? game.lastMove.rowId,
          columnId: game.lastMove.columnId,
          score: game.lastMove.score,
        }
      : null,
    celebration,
    celebrationCells,
  };
}
