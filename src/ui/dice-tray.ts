import { T } from "./strings";
import type { GameView } from "./view";

// Pip-paikat (p1..p7) kullekin silmäluvulle.
const PIPS: Record<number, string[]> = {
  1: ["p4"],
  2: ["p1", "p7"],
  3: ["p1", "p4", "p7"],
  4: ["p1", "p2", "p6", "p7"],
  5: ["p1", "p2", "p4", "p6", "p7"],
  6: ["p1", "p2", "p3", "p5", "p6", "p7"],
};

// <sj-dice-tray>: nopat + lukot + heitä-nappi. Tyhmä komponentti: lukee GameView'n
// ja emittoi "roll" / "toggle-hold" -eventit ylös. Ei tunne pelilogiikkaa.
export class DiceTray extends HTMLElement {
  private view: GameView | null = null;

  set data(v: GameView) {
    this.view = v;
    this.render();
  }

  private render(): void {
    const v = this.view;
    if (!v) return;
    const dieHtml = v.dice
      .map((d, i) => {
        if (d.value === 0) return `<button class="die empty" disabled aria-label="tyhjä noppa"></button>`;
        const pips = PIPS[d.value].map((p) => `<span class="pip ${p}"></span>`).join("");
        const held = d.held ? " held" : "";
        const tag = d.held ? `<span class="held-tag">${T.held}</span>` : "";
        const dis = v.hasRolled && !v.isOver ? "" : " disabled";
        return `<button class="die${held}" data-die="${i}"${dis} aria-label="noppa ${d.value}">${pips}${tag}</button>`;
      })
      .join("");

    const rollLabel = v.rollsUsed === 0 ? T.roll : T.rollAgain;
    const rollDis = v.canRoll ? "" : " disabled";

    // Kun kirjaus odottaa vahvistusta, heittonappi korvataan Vahvista/Peru-napeilla.
    const actions = v.hasPending
      ? `<div class="confirm-actions">
           <button class="primary confirm">${T.confirm}</button>
           <button class="secondary cancel">${T.cancel}</button>
         </div>`
      : `<button class="primary roll"${rollDis}>${rollLabel} (${v.rollsLeft})</button>`;

    this.innerHTML = `
      <div class="tray">
        <div class="dice">${dieHtml}</div>
        ${actions}
      </div>`;

    this.querySelector(".roll")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("roll", { bubbles: true }));
    });
    this.querySelector(".confirm")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("confirm-commit", { bubbles: true }));
    });
    this.querySelector(".cancel")?.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("cancel-commit", { bubbles: true }));
    });
    this.querySelectorAll<HTMLButtonElement>(".die[data-die]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.die);
        this.dispatchEvent(new CustomEvent("toggle-hold", { bubbles: true, detail: { index: i } }));
      });
    });
  }
}

customElements.define("sj-dice-tray", DiceTray);
