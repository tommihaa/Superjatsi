import { T } from "./strings";
import type { DiceCount } from "../domain/types";

// Versioleima: Vite `define` syöttää nämä build-aikana (ks. vite.config.ts).
declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;

// Kapea näyttö = sama raja kuin CSS:n portrait-breakpoint. Puhelimessa 6 noppaa
// ahtautuu (noppatarjotin rivittyy, kortti korkeampi), joten oletetaan 5 noppaa.
const narrowScreen = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 560px)").matches;

// <sj-setup>: aloitusnäyttö. Yksinpeli: valitaan noppamäärä (5/6) ja nimi.
// Emittoi "start" detaililla { diceCount, names } (names on aina yhden mittainen).
// Domain säilyy monipelikykyisenä (GameState hyväksyy N pelaajaa) tulevaa
// verkko-moninpeliä varten, mutta paikallinen UI ajaa aina yhtä pelaajaa.
export class Setup extends HTMLElement {
  private diceCount: DiceCount = narrowScreen() ? 5 : 6;
  private playerName = "";

  /** Edellisen pelin valinnat esitäyttöön (app lataa localStoragesta). */
  set defaults(d: { names: string[]; diceCount?: DiceCount } | null) {
    if (!d || d.names.length === 0) return;
    this.playerName = d.names[0] ?? "";
    if (d.diceCount !== undefined) this.diceCount = d.diceCount;
    if (this.isConnected) this.render();
  }

  connectedCallback(): void {
    this.render();
  }

  private nameOrDefault(): string {
    return this.playerName.trim() || T.playerName(1);
  }

  private render(): void {
    const diceChoice = ([5, 6] as DiceCount[])
      .map(
        (n) =>
          `<button class="choice${this.diceCount === n ? " selected" : ""}" data-dice="${n}">${
            n === 5 ? T.fiveDice : T.sixDice
          }</button>`,
      )
      .join("");

    this.innerHTML = `
      <div class="setup">
        <div class="setup-head">
          <h1>${T.title}</h1>
          <button class="icon-btn" data-act="scores" title="${T.highscores}" aria-label="${T.highscores}">🏆</button>
        </div>
        <p class="tagline">${T.tagline}</p>
        <fieldset>
          <legend>${T.diceCount}</legend>
          <div class="choice-row">${diceChoice}</div>
          ${narrowScreen() ? `<p class="field-hint">${T.diceHintMobile}</p>` : ""}
        </fieldset>
        <fieldset>
          <legend>${T.nameLabel}</legend>
          <div class="names">
            <input type="text" maxlength="14" data-name aria-label="${T.nameLabel}" placeholder="${T.playerName(
              1,
            )}" value="${this.playerName.replace(/"/g, "&quot;")}" />
          </div>
        </fieldset>
        <button class="primary start">${T.start}</button>
        <p class="setup-version">${T.version(__APP_VERSION__, __BUILD_DATE__)}</p>
      </div>`;

    this.querySelectorAll<HTMLButtonElement>("[data-dice]").forEach((b) =>
      b.addEventListener("click", () => {
        this.diceCount = Number(b.dataset.dice) as DiceCount;
        this.render();
      }),
    );
    this.querySelector<HTMLInputElement>("[data-name]")!.addEventListener("input", (e) => {
      this.playerName = (e.target as HTMLInputElement).value;
    });
    this.querySelector('[data-act="scores"]')!.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("open-highscores", { bubbles: true }));
    });
    this.querySelector(".start")!.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("start", {
          bubbles: true,
          detail: { diceCount: this.diceCount, names: [this.nameOrDefault()] },
        }),
      );
    });
  }
}

customElements.define("sj-setup", Setup);
