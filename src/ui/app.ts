import "./header";
import "./setup";
import "./status-bar";
import "./dice-tray";
import "./scorecard-view";

import { GameState } from "../domain/game";
import { GamePersistence } from "../domain/storage";
import type { DiceCount } from "../domain/types";
import { T } from "./strings";
import { buildView } from "./view";
import type { AppHeader } from "./header";
import type { Setup } from "./setup";
import type { StatusBar } from "./status-bar";
import type { DiceTray } from "./dice-tray";
import type { ScorecardView } from "./scorecard-view";

type Overlay = "rules" | "settings" | null;

// <sj-app>: juurikomponentti. Omistaa GameStaten ja persistoinnin, orkestroi
// lapsikomponentit ja kuuntelee niiden eventtejä (delegoituna tähän kerran).
export class App extends HTMLElement {
  private game: GameState | null = null;
  private overlay: Overlay = null;
  private readonly persistence = new GamePersistence(window.localStorage);

  connectedCallback(): void {
    this.bindEvents();
    this.game = this.persistence.load();
    if (this.game?.isOver()) {
      this.persistence.clear();
      this.game = null;
    }
    this.render();
  }

  private bindEvents(): void {
    this.addEventListener("start", (e) => {
      const { diceCount, names } = (e as CustomEvent).detail as { diceCount: DiceCount; names: string[] };
      this.game = new GameState(names, diceCount);
      this.persist();
      this.overlay = null;
      this.render();
    });
    this.addEventListener("roll", () => this.mutate((g) => g.roll()));
    this.addEventListener("toggle-hold", (e) =>
      this.mutate((g) => g.toggleHold((e as CustomEvent).detail.index)),
    );
    this.addEventListener("commit", (e) => {
      const { columnId, rowId } = (e as CustomEvent).detail;
      this.mutate((g) => g.commit(columnId, rowId, {}));
    });
    this.addEventListener("confirm-commit", () => this.mutate((g) => g.confirm()));
    this.addEventListener("cancel-commit", () => this.mutate((g) => g.cancel()));
    this.addEventListener("open-rules", () => this.setOverlay("rules"));
    this.addEventListener("open-settings", () => this.setOverlay("settings"));
    this.addEventListener("new-game", () => {
      this.persistence.clear();
      this.game = null;
      this.overlay = null;
      this.render();
    });
  }

  /** Suorita pelitilan muutos, tallenna ja piirrä uudelleen. */
  private mutate(fn: (g: GameState) => void): void {
    if (!this.game) return;
    fn(this.game);
    this.persist();
    this.render();
  }

  private persist(): void {
    if (this.game) {
      if (this.game.isOver()) this.persistence.clear();
      else this.persistence.save(this.game);
    }
  }

  private setOverlay(o: Overlay): void {
    this.overlay = o;
    this.render();
  }

  private render(): void {
    this.replaceChildren();

    if (!this.game) {
      this.append(document.createElement("sj-setup") as Setup);
      return;
    }

    const view = buildView(this.game);

    this.append(document.createElement("sj-header") as AppHeader);

    const status = document.createElement("sj-status-bar") as StatusBar;
    status.data = view;
    this.append(status);

    if (!view.isOver) {
      const tray = document.createElement("sj-dice-tray") as DiceTray;
      tray.data = view;
      this.append(tray);
    }

    const card = document.createElement("sj-scorecard") as ScorecardView;
    card.data = view;
    this.append(card);

    if (view.isOver) this.append(this.gameOverOverlay(view.winners));
    else if (this.overlay) this.append(this.infoOverlay(this.overlay));
  }

  private gameOverOverlay(winners: string[]): HTMLElement {
    const msg = winners.length === 1 ? T.winner(winners[0]) : T.winnerTie(winners.join(", "));
    return this.overlayEl(
      `<div class="banner"><div class="trophy">🏆</div><h2>${T.gameOver}</h2><p>${msg}</p></div>
       <div class="actions"><button class="primary" data-close="new">${T.playAgain}</button></div>`,
      false,
    );
  }

  private infoOverlay(kind: "rules" | "settings"): HTMLElement {
    const body =
      kind === "rules"
        ? `<h2>${T.rules}</h2>
           <ul>
             <li><b>Sarakkeet:</b> I = 1 heitto, II = ≤2, III = ≤3 (vapaa rivijärjestys).
                 ALAS täytetään ylhäältä alas, YLÖS alhaalta ylös.</li>
             <li><b>Heitot:</b> 3 per vuoro, nopat saa lukita klikkaamalla.</li>
             <li><b>Yläbonus:</b> +50 kun yläosa ylittää kynnyksen (63 / 84).</li>
             <li><b>Polttaminen:</b> klikkaa ruutua jonka arvo on 0 uhrataksesi rivin.</li>
             <li><b>Loppusumma</b> = sarakkeiden summa. Suurin voittaa.</li>
           </ul>`
        : `<h2>${T.settings}</h2><p>${T.settingsComing}</p>`;
    return this.overlayEl(`${body}<div class="actions"><button class="primary" data-close="x">${T.close}</button></div>`, true);
  }

  private overlayEl(innerHtml: string, dismissable: boolean): HTMLElement {
    const ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = `<div class="panel">${innerHtml}</div>`;
    ov.querySelectorAll<HTMLButtonElement>("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.dataset.close === "new") {
          this.persistence.clear();
          this.game = null;
        }
        this.overlay = null;
        this.render();
      });
    });
    if (dismissable) {
      ov.addEventListener("click", (e) => {
        if (e.target === ov) this.setOverlay(null);
      });
    }
    return ov;
  }
}

customElements.define("sj-app", App);
