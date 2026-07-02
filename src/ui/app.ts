import "./header";
import "./setup";
import "./status-bar";
import "./dice-tray";
import "./scorecard-view";

import { GameState } from "../domain/game";
import { HighscoreStore } from "../domain/highscores";
import { SetupPrefs } from "../domain/prefs";
import { GamePersistence } from "../domain/storage";
import type { DiceCount } from "../domain/types";
import { T } from "./strings";
import { buildView } from "./view";
import { downloadRecapImage } from "./recap-image";
import type { AppHeader } from "./header";
import type { Setup } from "./setup";
import type { StatusBar } from "./status-bar";
import type { DiceTray } from "./dice-tray";
import type { ScorecardView } from "./scorecard-view";

type Overlay = "rules" | "scores" | null;

// <sj-app>: juurikomponentti. Omistaa GameStaten ja persistoinnin, orkestroi
// lapsikomponentit ja kuuntelee niiden eventtejä (delegoituna tähän kerran).
export class App extends HTMLElement {
  private game: GameState | null = null;
  private overlay: Overlay = null;
  private readonly persistence = new GamePersistence(window.localStorage);
  private readonly highscores = new HighscoreStore(window.localStorage);
  private readonly setupPrefs = new SetupPrefs(window.localStorage);
  /** Juuri päättyneen pelin listalle päässeet sijoitukset (korostusta varten). */
  private newRanks: number[] = [];

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
      this.setupPrefs.save({ names });
      this.persist();
      this.overlay = null;
      this.newRanks = [];
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
    this.addEventListener("open-highscores", () => this.setOverlay("scores"));
    this.addEventListener("new-game", () => {
      // Kesken olevan pelin hylkääminen on peruuttamaton → varmistus
      // (symmetrisesti ennätysten tyhjennyksen kanssa).
      if (this.game && !this.game.isOver() && !window.confirm(T.newGameConfirm)) return;
      this.persistence.clear();
      this.game = null;
      this.overlay = null;
      this.render();
    });
  }

  /** Suorita pelitilan muutos, tallenna ja piirrä uudelleen. */
  private mutate(fn: (g: GameState) => void): void {
    if (!this.game) return;
    const wasOver = this.game.isOver();
    fn(this.game);
    if (!wasOver && this.game.isOver()) this.recordHighscores();
    this.persist();
    this.render();
  }

  /** Kirjaa päättyneen pelin kaikkien pelaajien loppusummat ennätyslistalle. */
  private recordHighscores(): void {
    if (!this.game) return;
    this.newRanks = this.highscores.submit(
      this.game.diceCount,
      this.game.players.map((p) => ({ name: p.name, score: p.card.grandTotal() })),
    );
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
      const setup = document.createElement("sj-setup") as Setup;
      setup.defaults = this.setupPrefs.load();
      this.append(setup);
      if (this.overlay) this.append(this.infoOverlay(this.overlay));
      return;
    }

    const view = buildView(this.game);

    this.append(document.createElement("sj-header") as AppHeader);

    // Pelialue: vasen sarake = ohjaimet (vuorotila + nopat), oikea = tulokortti.
    // CSS järjestää tämän pystyssä pinoksi ja vaakatasossa kahdeksi palstaksi.
    const play = document.createElement("div");
    play.className = "play";

    const left = document.createElement("div");
    left.className = "play-left";

    const status = document.createElement("sj-status-bar") as StatusBar;
    status.data = view;
    left.append(status);

    if (!view.isOver) {
      const tray = document.createElement("sj-dice-tray") as DiceTray;
      tray.data = view;
      left.append(tray);
    }
    play.append(left);

    const card = document.createElement("sj-scorecard") as ScorecardView;
    card.data = view;
    play.append(card);

    this.append(play);

    if (view.isOver) this.append(this.gameOverOverlay(view.winners));
    else if (this.overlay) this.append(this.infoOverlay(this.overlay));
  }

  private gameOverOverlay(winners: string[]): HTMLElement {
    // Yksinpelissä ei ole voittajaa vaan tulos.
    const solo = this.game?.players.length === 1;
    const msg = solo
      ? T.soloResult(this.game!.players[0].card.grandTotal())
      : winners.length === 1
        ? T.winner(winners[0])
        : T.winnerTie(winners.join(", "));
    const scores = this.game
      ? `<h3 class="hs-title">${T.highscoresFor(this.game.diceCount)}</h3>
         ${this.highscoreListHtml(this.game.diceCount, this.newRanks)}`
      : "";
    const ov = this.overlayEl(
      `<div class="banner"><div class="trophy">🏆</div><h2>${T.gameOver}</h2><p>${msg}</p></div>
       ${scores}
       <div class="actions">
         <button class="secondary" data-act="download-recap">${T.downloadImage}</button>
         <button class="primary" data-close="new">${T.playAgain}</button>
       </div>`,
      false,
    );
    ov.querySelector('[data-act="download-recap"]')?.addEventListener("click", () => {
      if (this.game) downloadRecapImage(this.game);
    });
    return ov;
  }

  private infoOverlay(kind: "rules" | "scores"): HTMLElement {
    if (kind === "scores") return this.highscoreOverlay();
    const body = `<h2>${T.rules}</h2>
           <ul>
             <li><b>Sarakkeet:</b> I = 1 heitto, II = ≤2, III = ≤3 (vapaa rivijärjestys).
                 ALAS täytetään ylhäältä alas, YLÖS alhaalta ylös (↓/↑ näyttää seuraavan rivin).</li>
             <li><b>Heitot:</b> 3 per vuoro, nopat saa lukita klikkaamalla.</li>
             <li><b>Yläbonus:</b> +50 kun yläosa ylittää kynnyksen (63 / 84).</li>
             <li><b>Polttaminen:</b> 0 p:n kirjaus uhraa rivin. Jos mikään kirjaus ei ole
                 sallittu, avoimet ruudut saa aina polttaa.</li>
             <li><b>Loppusumma</b> = sarakkeiden summa. Suurin voittaa.</li>
           </ul>`;
    return this.overlayEl(`${body}<div class="actions"><button class="primary" data-close="x">${T.close}</button></div>`, true);
  }

  private highscoreOverlay(): HTMLElement {
    const diceCount = this.game?.diceCount ?? 6;
    const hasScores = this.highscores.list(diceCount).length > 0;
    const clearBtn = hasScores
      ? `<button class="secondary" data-act="clear-hs">${T.clearHighscores}</button> `
      : "";
    const ov = this.overlayEl(
      `<h2>${T.highscoresFor(diceCount)}</h2>
       ${this.highscoreListHtml(diceCount, [])}
       <div class="actions">${clearBtn}<button class="primary" data-close="x">${T.close}</button></div>`,
      true,
    );
    ov.querySelector('[data-act="clear-hs"]')?.addEventListener("click", () => {
      if (window.confirm(T.clearHighscoresConfirm)) {
        this.highscores.clear();
        this.newRanks = [];
        this.render();
      }
    });
    return ov;
  }

  /** Top 10 -lista tauluna; highlight = juuri listalle päässeiden indeksit. */
  private highscoreListHtml(diceCount: DiceCount, highlight: number[]): string {
    const entries = this.highscores.list(diceCount);
    if (entries.length === 0) return `<p class="hs-empty">${T.noHighscores}</p>`;
    const rows = entries
      .map(
        (e, i) =>
          `<tr${highlight.includes(i) ? ' class="hs-new"' : ""}>
             <td class="hs-rank">${i + 1}.</td>
             <td class="hs-name">${e.name}</td>
             <td class="hs-score">${e.score}</td>
             <td class="hs-date">${e.date}</td>
           </tr>`,
      )
      .join("");
    return `<table class="hs-table"><tbody>${rows}</tbody></table>`;
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
