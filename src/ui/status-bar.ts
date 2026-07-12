import { T } from "./strings";
import type { GameView } from "./view";

// <sj-status-bar>: pelaajalista (totaalit, vuorossa korostettu) + vuoron ohje.
export class StatusBar extends HTMLElement {
  private view: GameView | null = null;

  set data(v: GameView) {
    this.view = v;
    this.render();
  }

  private turnInfo(v: GameView): string {
    if (v.isOver) return "";
    if (v.hasPending) return T.confirmHint;
    if (!v.hasRolled) return T.rollToStart;
    return `${T.rollsLeft(v.rollsLeft)} · ${T.pickCell}`;
  }

  private render(): void {
    const v = this.view;
    if (!v) return;
    const chips = v.players
      .map((p, i) => {
        const cur = i === v.currentPlayerIndex && !v.isOver ? " current" : "";
        return `<span class="player-chip${cur}">${p.name}<span class="pscore">${p.total}</span></span>`;
      })
      .join("");

    const info = v.isOver
      ? ""
      : `<div class="turn-info"><strong>${T.turnOf(v.currentName)}</strong> · ${this.turnInfo(v)}</div>`;

    this.innerHTML = `<div class="status"><div class="players">${chips}</div>${info}</div>`;
  }
}

customElements.define("sj-status-bar", StatusBar);
