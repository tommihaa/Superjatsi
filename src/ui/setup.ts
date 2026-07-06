import { T } from "./strings";
import type { DiceCount } from "../domain/types";

const MAX_PLAYERS = 6;

// Kapea näyttö = sama raja kuin CSS:n portrait-breakpoint. Puhelimessa 6 noppaa
// ahtautuu (noppatarjotin rivittyy, kortti korkeampi), joten oletetaan 5 noppaa.
const narrowScreen = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 560px)").matches;

// <sj-setup>: aloitusnäyttö. Valitaan nopam. (5/6), pelaajamäärä (1–6) ja nimet.
// Emittoi "start" detaililla { diceCount, names }.
export class Setup extends HTMLElement {
  private diceCount: DiceCount = narrowScreen() ? 5 : 6;
  private playerCount = 2;
  private names: string[] = [];

  /** Edellisen pelin valinnat esitäyttöön (app lataa localStoragesta). */
  set defaults(d: { names: string[]; diceCount?: DiceCount } | null) {
    if (!d || d.names.length === 0) return;
    this.names = [...d.names];
    this.playerCount = Math.min(MAX_PLAYERS, d.names.length);
    if (d.diceCount !== undefined) this.diceCount = d.diceCount;
    if (this.isConnected) this.render();
  }

  connectedCallback(): void {
    this.render();
  }

  private nameAt(i: number): string {
    return this.names[i]?.trim() || T.playerName(i + 1);
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

    const playerChoice = Array.from({ length: MAX_PLAYERS }, (_, k) => k + 1)
      .map(
        (n) =>
          `<button class="choice${this.playerCount === n ? " selected" : ""}" data-players="${n}">${n}</button>`,
      )
      .join("");

    const nameInputs = Array.from({ length: this.playerCount }, (_, i) => {
      const val = this.names[i] ?? "";
      return `<input type="text" maxlength="14" data-name="${i}" placeholder="${T.playerName(
        i + 1,
      )}" value="${val.replace(/"/g, "&quot;")}" />`;
    }).join("");

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
          <legend>${T.players}</legend>
          <div class="choice-row">${playerChoice}</div>
        </fieldset>
        <div class="names">${nameInputs}</div>
        <button class="primary start">${T.start}</button>
      </div>`;

    this.querySelectorAll<HTMLButtonElement>("[data-dice]").forEach((b) =>
      b.addEventListener("click", () => {
        this.diceCount = Number(b.dataset.dice) as DiceCount;
        this.render();
      }),
    );
    this.querySelectorAll<HTMLButtonElement>("[data-players]").forEach((b) =>
      b.addEventListener("click", () => {
        this.playerCount = Number(b.dataset.players);
        this.render();
      }),
    );
    this.querySelectorAll<HTMLInputElement>("[data-name]").forEach((inp) =>
      inp.addEventListener("input", () => {
        this.names[Number(inp.dataset.name)] = inp.value;
      }),
    );
    this.querySelector('[data-act="scores"]')!.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("open-highscores", { bubbles: true }));
    });
    this.querySelector(".start")!.addEventListener("click", () => {
      const names = Array.from({ length: this.playerCount }, (_, i) => this.nameAt(i));
      this.dispatchEvent(
        new CustomEvent("start", { bubbles: true, detail: { diceCount: this.diceCount, names } }),
      );
    });
  }
}

customElements.define("sj-setup", Setup);
