import { T } from "./strings";

// <sj-header>: otsikko + i-info-, ratas- (asetukset) ja uusi peli -napit.
// Emittoi "open-rules" / "open-settings" / "new-game". Sisältö hoidetaan app-tasolla.
export class AppHeader extends HTMLElement {
  connectedCallback(): void {
    this.innerHTML = `
      <header class="app-header">
        <h1>${T.title}</h1>
        <div class="header-btns">
          <button class="icon-btn" data-act="rules" title="${T.rules}" aria-label="${T.rules}">i</button>
          <button class="icon-btn" data-act="scores" title="${T.highscores}" aria-label="${T.highscores}">🏆</button>
          <button class="icon-btn" data-act="settings" title="${T.settings}" aria-label="${T.settings}">⚙</button>
          <button class="icon-btn" data-act="new" title="${T.newGame}" aria-label="${T.newGame}">↺</button>
        </div>
      </header>`;

    const emit = (name: string) => this.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    this.querySelector('[data-act="rules"]')!.addEventListener("click", () => emit("open-rules"));
    this.querySelector('[data-act="scores"]')!.addEventListener("click", () => emit("open-highscores"));
    this.querySelector('[data-act="settings"]')!.addEventListener("click", () => emit("open-settings"));
    this.querySelector('[data-act="new"]')!.addEventListener("click", () => emit("new-game"));
  }
}

customElements.define("sj-header", AppHeader);
