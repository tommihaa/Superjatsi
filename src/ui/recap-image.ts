import type { GameState } from "../domain/game";
import { localToday } from "../domain/highscores";
import { T } from "./strings";

// Piirtää päättyneen pelin tuloksesta ladattavan PNG-kuvan Canvasilla — ei ulkoisia
// riippuvuuksia (kuten html2canvas), palauttaa vain sen mitä pelaaja jo näkee
// lopputulosbannerissa: pelaajat paremmuusjärjestyksessä + loppusumma.

const BG = "#14143a";
const PANEL = "#1e1e52";
const BORDER = "#34346e";
const GOLD = "#c9a84c";
const TEXT = "#e4e7ff";
const TEXT_DIM = "#9aa0d8";

const WIDTH = 640;
const ROW_H = 46;
const HEADER_H = 150;
const FOOTER_H = 50;
const SCALE = 2; // retina-terävyys

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Rakentaa tulosbanneria vastaavan kuvan Canvasille (ei liitetä DOMiin). */
export function buildRecapCanvas(game: GameState): HTMLCanvasElement {
  const ranked = [...game.players].sort((a, b) => b.card.grandTotal() - a.card.grandTotal());
  const solo = ranked.length === 1;
  const height = HEADER_H + ranked.length * ROW_H + FOOTER_H;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH * SCALE;
  canvas.height = height * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  // Tausta
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, height);

  // Otsikko
  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.font = "700 30px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(`🏆 ${T.gameOver}`, WIDTH / 2, 52);

  ctx.fillStyle = TEXT;
  ctx.font = "600 20px 'Segoe UI', system-ui, sans-serif";
  const winners = game.winners();
  const msg = solo
    ? T.soloResult(ranked[0].card.grandTotal())
    : winners.length === 1
      ? T.winner(winners[0].name)
      : T.winnerTie(winners.map((p) => p.name).join(", "));
  ctx.fillText(msg, WIDTH / 2, 84);

  ctx.fillStyle = TEXT_DIM;
  ctx.font = "400 14px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(`${game.diceCount} noppaa · ${localToday()}`, WIDTH / 2, 108);

  // Pelaajarivit
  const listTop = HEADER_H;
  const listW = WIDTH - 80;
  const listX = 40;
  roundedRect(ctx, listX, listTop, listW, ranked.length * ROW_H, 10);
  ctx.fillStyle = PANEL;
  ctx.fill();
  ctx.strokeStyle = BORDER;
  ctx.lineWidth = 1;
  ctx.stroke();

  ranked.forEach((p, i) => {
    const y = listTop + i * ROW_H;
    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(listX, y);
      ctx.lineTo(listX + listW, y);
      ctx.strokeStyle = BORDER;
      ctx.stroke();
    }
    const cy = y + ROW_H / 2 + 6;
    ctx.textAlign = "left";
    ctx.fillStyle = i === 0 ? GOLD : TEXT_DIM;
    ctx.font = "700 18px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(`${i + 1}.`, listX + 18, cy);

    ctx.fillStyle = TEXT;
    ctx.font = "600 18px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(p.name, listX + 56, cy);

    ctx.textAlign = "right";
    ctx.fillStyle = i === 0 ? GOLD : TEXT;
    ctx.font = "700 20px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(String(p.card.grandTotal()), listX + listW - 20, cy);
  });

  ctx.textAlign = "center";
  ctx.fillStyle = TEXT_DIM;
  ctx.font = "400 13px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(T.title, WIDTH / 2, height - 18);

  return canvas;
}

/** Lataa kuvan pelaajan koneelle PNG-tiedostona. */
export function downloadRecapImage(game: GameState): void {
  const canvas = buildRecapCanvas(game);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `taysi-tulos-${localToday()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  });
}
