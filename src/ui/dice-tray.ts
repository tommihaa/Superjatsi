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

// Moduulitason muisti viimeksi renderöidystä heitosta: komponentti luodaan joka
// renderillä uudestaan, joten instanssikenttä ei säilyisi. Avain erottaa oikean
// heiton (pelaaja/heittonumero/täyttöaste muuttuu) pelkästä lukituksen togglesta,
// jolloin heittoanimaatio ajetaan vain oikeasti heitetyille nopille.
let lastRollKey = "";

// <sj-dice-tray>: nopat + lukot + heitä-nappi. Tyhmä komponentti: lukee GameView'n
// ja emittoi "roll" / "toggle-hold" -eventit ylös. Ei tunne pelilogiikkaa.
export class DiceTray extends HTMLElement {
  private view: GameView | null = null;

  set data(v: GameView) {
    this.view = v;
    this.render();
  }

  /**
   * Deterministinen "pöydälle heitetty" -ilme nopalle: jokaisella nopalla on oma
   * gridi-ruutunsa pöydällä (päällekkäisyys mahdotonta millä tahansa leveydellä),
   * ja arvosta riippuva pieni kierto + siirtymä ruudun sisällä. Sama indeksi +
   * arvo → sama asento, eli nopat eivät hypi lukittaessa, vaan vain heitettäessä.
   */
  private jitter(index: number, value: number): string {
    const seed = (index * 92821 + value * 13219) >>> 0;
    const rot = (seed % 25) - 12; // -12..12 astetta
    const dx = ((seed >> 6) % 11) - 5; // -5..5 px
    const dy = ((seed >> 11) % 9) - 4; // -4..4 px
    // Asento CSS-muuttujaan, jotta heittoanimaatio voi päättyä samaan asentoon
    // (keyframes lukee var(--jt) elementiltä).
    return `--jt: rotate(${rot}deg) translate(${dx}px, ${dy}px);`;
  }

  private render(): void {
    const v = this.view;
    if (!v) return;
    const dis = v.hasRolled && !v.isOver ? "" : " disabled";

    // Heittoavain: muuttuu vain kun uusi heitto on tapahtunut (pelaaja, heitto-
    // numero tai kortin täyttöaste vaihtuu) — lukitus-toggle ei muuta sitä.
    const filled = v.board.rows.reduce(
      (n, r) => n + v.board.columns.filter((c) => r.cells[c].value !== null).length,
      0,
    );
    const rollKey = `${v.currentPlayerIndex}:${filled}:${v.rollsUsed}`;
    const justRolled = v.hasRolled && rollKey !== lastRollKey;
    lastRollKey = rollKey;

    // Heitetyt nopat "pöydällä", lukitut (ja tyhjät) suorassa rivissä alla.
    // Lukitun nopan tilalle jää pöytään näkymätön haamupaikka, jotta muut
    // nopat eivät siirry lukittaessa.
    const thrown: string[] = [];
    const rowDice: string[] = [];
    v.dice.forEach((d, i) => {
      if (d.value === 0) {
        rowDice.push(`<button class="die empty" disabled aria-label="tyhjä noppa"></button>`);
        return;
      }
      const pips = PIPS[d.value].map((p) => `<span class="pip ${p}"></span>`).join("");
      // Jalometalli-ilme: sävy tummasta puusta kultaan silmäluvun mukaan (v1..v6).
      const tone = `v${d.value}`;
      if (d.held) {
        thrown.push(`<span class="die ghost" aria-hidden="true"></span>`);
        rowDice.push(
          `<button class="die held ${tone}" data-die="${i}"${dis} aria-label="noppa ${d.value}, lukittu">${pips}<span class="held-tag">${T.held}</span></button>`,
        );
      } else {
        // Heiton porrastus: nopat "laskeutuvat" pöytään pienellä viiveellä toisistaan.
        const cls = `die ${tone}${justRolled ? " rolling" : ""}`;
        const delay = justRolled ? `animation-delay:${i * 40}ms;` : "";
        thrown.push(
          `<button class="${cls}" data-die="${i}"${dis} style="${delay}${this.jitter(i, d.value)}" aria-label="noppa ${d.value}">${pips}</button>`,
        );
      }
    });
    // Molemmat rivit pidetään aina renderöitynä (vaikka tyhjänä) — muuten niiden
    // mount/unmount hyppäyttää tarjottimen korkeutta esim. ensimmäisen heiton tai
    // "kaikki lukossa" -tilanteen kohdalla (ks. .table min-height ja .dice-row).
    const dieHtml =
      `<div class="table">${thrown.join("")}</div>` +
      `<div class="dice-row">${rowDice.join("")}</div>`;

    const rollLabel = v.rollsUsed === 0 ? T.roll : T.rollAgain;
    const rollDis = v.canRoll ? "" : " disabled";

    // Kun kirjaus odottaa vahvistusta, heittonappi korvataan Vahvista/Peru-napeilla.
    // Vakiokorkuinen actions-slot pitää tarjottimen korkeuden, vaikka vahvistus-
    // palkki irtoaa mobiilissa kiinteäksi alapalkiksi (CSS).
    const actions = v.hasPending
      ? `<div class="confirm-actions">
           <button class="primary confirm">${T.confirm}</button>
           <button class="secondary cancel">${T.cancel}</button>
         </div>`
      : `<button class="primary roll"${rollDis}>${rollLabel} (${v.rollsLeft})</button>`;

    this.innerHTML = `
      <div class="tray">
        ${dieHtml}
        <div class="actions-slot">${actions}</div>
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
