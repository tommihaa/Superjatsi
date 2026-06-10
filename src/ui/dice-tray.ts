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

  /**
   * Deterministinen "pöydälle heitetty" -asento nopalle: kullakin nopalla on oma
   * ankkurialue pöydällä (ei päällekkäisyyttä) ja arvosta riippuva satunnaisen
   * näköinen poikkeama + kierto. Sama indeksi + arvo → sama asento, eli nopat
   * eivät hypi lukittaessa, vaan vain heitettäessä.
   */
  private scatter(index: number, value: number): string {
    const anchors = [
      { x: 4, y: 10 },
      { x: 36, y: 46 },
      { x: 64, y: 6 },
      { x: 70, y: 44 },
      { x: 16, y: 50 },
      { x: 44, y: 14 },
    ];
    const a = anchors[index % anchors.length];
    const seed = (index * 92821 + value * 13219) >>> 0;
    const rot = (seed % 51) - 25; // -25..25 astetta
    const dx = ((seed >> 6) % 11) - 5; // -5..5 %-yksikköä
    const dy = ((seed >> 11) % 13) - 6; // -6..6 %-yksikköä
    const x = Math.min(72, Math.max(0, a.x + dx));
    const y = Math.min(55, Math.max(0, a.y + dy));
    return `left:${x}%; top:${y}%; transform: rotate(${rot}deg);`;
  }

  private render(): void {
    const v = this.view;
    if (!v) return;
    const dis = v.hasRolled && !v.isOver ? "" : " disabled";

    // Heitetyt nopat hajallaan "pöydällä", lukitut (ja tyhjät) suorassa rivissä alla.
    const thrown: string[] = [];
    const rowDice: string[] = [];
    v.dice.forEach((d, i) => {
      if (d.value === 0) {
        rowDice.push(`<button class="die empty" disabled aria-label="tyhjä noppa"></button>`);
        return;
      }
      const pips = PIPS[d.value].map((p) => `<span class="pip ${p}"></span>`).join("");
      if (d.held) {
        rowDice.push(
          `<button class="die held" data-die="${i}"${dis} aria-label="noppa ${d.value}, lukittu">${pips}<span class="held-tag">${T.held}</span></button>`,
        );
      } else {
        thrown.push(
          `<button class="die" data-die="${i}"${dis} style="${this.scatter(i, d.value)}" aria-label="noppa ${d.value}">${pips}</button>`,
        );
      }
    });
    const dieHtml =
      (thrown.length ? `<div class="table">${thrown.join("")}</div>` : "") +
      (rowDice.length ? `<div class="dice-row">${rowDice.join("")}</div>` : "");

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
        ${dieHtml}
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
