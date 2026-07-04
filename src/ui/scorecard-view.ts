import { T } from "./strings";
import type { ColumnId } from "../domain/types";
import type { BoardView, GameView } from "./view";

// Sarakeotsikot tulevat keskitetysti strings.ts:stä (T.colLabel).

// <sj-scorecard>: nykyisen pelaajan matriisitulokortti. Klikattavat (available) solut
// emittoivat "commit"-eventin. Pelitila tulee valmiina GameView'na.
export class ScorecardView extends HTMLElement {
  private view: GameView | null = null;

  set data(v: GameView) {
    this.view = v;
    this.render();
  }

  private cellHtml(
    rowId: string,
    rowLabel: string,
    col: ColumnId,
    c: BoardView["rows"][number]["cells"][ColumnId],
    dimmed: boolean,
  ): string {
    if (c.pending) {
      return `<td class="cell pending">${c.value}</td>`;
    }
    if (c.available) {
      // Vain pisteellinen (score > 0) korostetaan vihreällä ja näyttää ehdotuspisteet.
      // 0 p:n vaihtoehdot (ml. anti-jumi-poltto) pysyvät klikattavina mutta ilman
      // väriä tai tekstiä — ei mitään merkkiä, jotta vihreä+numero erottuu
      // yksiselitteisesti "tästä saa pisteitä" -merkkinä.
      const scored = c.score > 0 ? " scored" : "";
      // Maksimipisteiden apuri: tähti kertoo ehdotuksen olevan kategorian paras
      // mahdollinen (esim. suora, jossa muuta pistemäärää ei ole olemassakaan).
      const max = c.isMax ? " max" : "";
      const text = c.score > 0 ? c.score : "";
      const aria = T.cellCommitLabel(rowLabel, T.colLabel[col], c.score);
      return `<td class="cell avail${scored}${max}" data-col="${col}" data-row="${rowId}" role="button" tabindex="0" aria-label="${aria}" title="${c.isMax ? T.maxScore : ""}">${text}</td>`;
    }
    const dim = dimmed ? " dim" : "";
    if (c.value !== null) {
      const zero = c.value === 0 ? " zero" : "";
      return `<td class="cell filled${zero}${dim}">${c.value}</td>`;
    }
    if (c.orderNext) {
      // ALAS/YLÖS: seuraava pakkorivi näkyy nuolena jo ennen heittoa.
      const arrow = col === "ALAS" ? "↓" : "↑";
      return `<td class="cell next-order${dim}" aria-label="${T.nextInOrder}">${arrow}</td>`;
    }
    return `<td class="cell${dim}"></td>`;
  }

  private devHtml(dev: number): string {
    if (dev === 0) return "";
    const cls = dev > 0 ? "pos" : "neg";
    const sign = dev > 0 ? "+" : "";
    return ` <span class="dev ${cls}">${sign}${dev}</span>`;
  }

  private render(): void {
    const v = this.view;
    if (!v) return;
    const b = v.board;
    const isDim = (c: ColumnId) => b.dimmedColumns.includes(c);

    const head =
      `<th class="row-label"></th>` +
      b.columns
        .map((c) => `<th${isDim(c) ? ' class="dim"' : ""} title="${T.colInfo[c]}">${T.colLabel[c]}</th>`)
        .join("") +
      `<th>${T.colSum}</th>`;

    const rowHtml = (section: "upper" | "lower") =>
      b.rows
        .filter((r) => r.section === section)
        .map((r) => {
          const cells = b.columns.map((c) => this.cellHtml(r.id, r.label, c, r.cells[c], isDim(c))).join("");
          const title = r.description ? ` title="${r.description}"` : "";
          return `<tr class="section-${section}"><td class="row-label"${title}>${r.label}</td>${cells}<td class="cell colsum">${r.sum}</td></tr>`;
        })
        .join("");

    // Bonustahti k samaa per rivi: domainin invariantti kynnys = k×21 (scorecard.ts).
    const bonusPace = b.bonusThreshold / 21;
    const subtotalRow =
      `<tr class="subtotal"><td class="row-label" title="${T.upperSumInfo(bonusPace, b.bonusThreshold)}">${T.upperSum}</td>` +
      b.columns
        .map((c) => `<td>${b.summary[c].subtotal}${this.devHtml(b.summary[c].deviation)}</td>`)
        .join("") +
      `<td></td></tr>`;

    const bonusRow =
      `<tr class="subtotal"><td class="row-label" title="${T.bonusInfo(b.bonusThreshold, b.bonusValue)}">${T.bonus}</td>` +
      b.columns.map((c) => `<td>${b.summary[c].bonus || ""}</td>`).join("") +
      `<td></td></tr>`;

    const totalRow =
      `<tr class="total"><td class="row-label">${T.grandTotal}</td>` +
      b.columns.map((c) => `<td>${b.summary[c].total}</td>`).join("") +
      `<td>${b.grandTotal}</td></tr>`;

    this.innerHTML = `
      <table class="scorecard">
        <thead><tr>${head}</tr></thead>
        <tbody>
          ${rowHtml("upper")}
          ${subtotalRow}
          ${bonusRow}
          ${rowHtml("lower")}
          ${totalRow}
        </tbody>
      </table>`;

    this.querySelectorAll<HTMLTableCellElement>(".cell.avail").forEach((td) => {
      const emit = () => {
        this.dispatchEvent(
          new CustomEvent("commit", {
            bubbles: true,
            detail: { columnId: td.dataset.col, rowId: td.dataset.row },
          }),
        );
      };
      td.addEventListener("click", emit);
      // role="button" ei tuo näppäinaktivointia ilmaiseksi — Enter/Space käsin.
      td.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          emit();
        }
      });
    });
  }
}

customElements.define("sj-scorecard", ScorecardView);
