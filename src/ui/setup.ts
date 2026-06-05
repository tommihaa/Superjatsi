import { T } from "./strings";
import type { DiceCount } from "../domain/types";

const MAX_PLAYERS = 6;

// <sj-setup>: aloitusnäyttö. Valitaan nopam. (5/6), pelaajamäärä (1–6) ja nimet.
// Emittoi "start" detaililla { diceCount, names }.
export class Setup extends HTMLElement {
  private diceCount: DiceCount = 6;
  private playerCount = 2;
  private names: string[] = [];

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
        <h1>${T.title}</h1>
        <p class="tagline">${T.tagline}</p>
        <fieldset>
          <legend>${T.diceCount}</legend>
          <div class="choice-row">${diceChoice}</div>
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
    this.querySelector(".start")!.addEventListener("click", () => {
      const names = Array.from({ length: this.playerCount }, (_, i) => this.nameAt(i));
      this.dispatchEvent(
        new CustomEvent("start", { bubbles: true, detail: { diceCount: this.diceCount, names } }),
      );
    });
  }
}

customElements.define("sj-setup", Setup);
