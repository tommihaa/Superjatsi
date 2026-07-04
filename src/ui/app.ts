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
import { buildView, type GameView } from "./view";
import { glowCells, starStorm } from "./effects";
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
  /** Ennätysoverlayn valittu varianttivälilehti (null = pelin/oletuksen mukaan). */
  private hsTab: DiceCount | null = null;
  /** Vuoronvaihtoruutu näkyvissä (pass-and-play: "Anna laite pelaajalle X").
   *  UI-tila, ei persistoidu — reloadin jälkeen seuraava pelaaja jatkaa suoraan. */
  private handoff = false;
  /** Viimeksi renderöity näkymä (tähtimyrskyn liipaisu heiton jälkeen). */
  private lastView: GameView | null = null;

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
      this.handoff = false;
      this.render();
    });
    this.addEventListener("roll", () => {
      this.mutate((g) => g.roll());
      // Juhla vain heiton jälkeen — ei uudelleenrenderöinneissä (lukitus ym.),
      // jottei sama käsi juhli montaa kertaa. TOP = sade + hehku, GREAT = hehku.
      if (this.lastView?.celebration) {
        if (this.lastView.celebration === "top") starStorm();
        glowCells(this, this.lastView.celebrationCells);
      }
    });
    this.addEventListener("toggle-hold", (e) =>
      this.mutate((g) => g.toggleHold((e as CustomEvent).detail.index)),
    );
    this.addEventListener("commit", (e) => {
      const { columnId, rowId } = (e as CustomEvent).detail;
      this.mutate((g) => g.commit(columnId, rowId, {}));
    });
    this.addEventListener("confirm-commit", () => {
      if (!this.game) return;
      const multiplayer = this.game.players.length > 1;
      this.mutate((g) => g.confirm());
      // Monipelissä laite vaihtaa kättä → väliruutu estää vahinkoklikkaukset
      // ja näyttää kuittauksen juuri vahvistetusta kirjauksesta.
      if (multiplayer && this.game && !this.game.isOver()) {
        this.handoff = true;
        this.render();
      }
    });
    this.addEventListener("cancel-commit", () => this.mutate((g) => g.cancel()));
    this.addEventListener("open-rules", () => this.setOverlay("rules"));
    this.addEventListener("open-highscores", () => this.setOverlay("scores"));
    this.addEventListener("new-game", () => {
      // Kesken olevan pelin hylkääminen on peruuttamaton → varmistus
      // (symmetrisesti ennätysten tyhjennyksen kanssa).
      if (this.game && !this.game.isOver()) {
        this.showConfirm(T.newGameConfirm, () => this.resetToSetup());
        return;
      }
      this.resetToSetup();
    });
  }

  private resetToSetup(): void {
    this.persistence.clear();
    this.game = null;
    this.overlay = null;
    this.handoff = false;
    this.render();
  }

  /** Teeman mukainen varmistusdialogi window.confirmin tilalle. Kelluu muiden
   *  overlayjen päällä (esim. ennätysten tyhjennys ennätysoverlaysta). */
  private showConfirm(message: string, onYes: () => void): void {
    const ov = document.createElement("div");
    ov.className = "overlay confirm-overlay";
    ov.innerHTML = `<div class="panel">
        <p class="confirm-msg">${message}</p>
        <div class="actions">
          <button class="secondary" data-c="no">${T.cancel}</button>
          <button class="primary" data-c="yes">${T.yes}</button>
        </div>
      </div>`;
    const close = () => ov.remove();
    ov.querySelector('[data-c="no"]')!.addEventListener("click", close);
    ov.addEventListener("click", (e) => {
      if (e.target === ov) close();
    });
    ov.querySelector('[data-c="yes"]')!.addEventListener("click", () => {
      close();
      onYes();
    });
    this.append(ov);
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
    // Välilehtivalinta ei säily overlayn sulkemisen yli — seuraava avaus
    // palaa oletukseen (pelin variantti tai 6).
    if (o !== "scores") this.hsTab = null;
    this.render();
  }

  private render(): void {
    this.replaceChildren();

    const main = document.createElement("main");

    if (!this.game) {
      const setup = document.createElement("sj-setup") as Setup;
      setup.defaults = this.setupPrefs.load();
      main.append(setup);
      this.append(main);
      if (this.overlay) this.append(this.infoOverlay(this.overlay));
      return;
    }

    const view = buildView(this.game);
    // Kirjaus tyhjentää ja rakentaa DOM:n uusiksi → näppäimistöfokus katoaisi.
    // Kun pending-tila alkaa, fokus siirretään Vahvista-nappiin (renderin lopussa,
    // kun nappi on kiinnitetty dokumenttiin).
    const becamePending = view.hasPending && !this.lastView?.hasPending;
    this.lastView = view;

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

    main.append(play);
    this.append(main);

    if (view.isOver) this.append(this.gameOverOverlay(view));
    else if (this.handoff) this.append(this.handoffOverlay(view));
    else if (this.overlay) this.append(this.infoOverlay(this.overlay));

    if (becamePending) this.querySelector<HTMLButtonElement>("button.confirm")?.focus();
  }

  /** Vuoronvaihtoruutu: kuittaus edellisestä kirjauksesta + "Anna laite pelaajalle X".
   *  Ei sulkeudu taustaa klikkaamalla — tarkoitus on estää vahinkoklikkaukset. */
  private handoffOverlay(view: GameView): HTMLElement {
    const lm = view.lastMove;
    const recap = lm
      ? `<p class="handoff-recap">${
          lm.score > 0
            ? T.recapScored(lm.player, lm.rowLabel, lm.score, T.colLabel[lm.columnId])
            : T.recapBurned(lm.player, lm.rowLabel, T.colLabel[lm.columnId])
        }</p>`
      : "";
    const ov = document.createElement("div");
    ov.className = "overlay handoff-overlay";
    ov.innerHTML = `<div class="panel handoff">
        ${recap}
        <h2>${T.handoffTitle(view.currentName)}</h2>
        <div class="actions"><button class="primary" data-act="start-turn">${T.startTurn}</button></div>
      </div>`;
    ov.querySelector('[data-act="start-turn"]')!.addEventListener("click", () => {
      this.handoff = false;
      this.render();
    });
    return ov;
  }

  private gameOverOverlay(view: GameView): HTMLElement {
    // Yksinpelissä ei ole voittajaa vaan tulos.
    const solo = view.players.length === 1;
    const msg = solo
      ? T.soloResult(view.players[0].total)
      : view.winners.length === 1
        ? T.winner(view.winners[0])
        : T.winnerTie(view.winners.join(", "));
    // Monipelissä kaikkien pelaajien tulostaulukko (yksinpelissä redundantti).
    const standings = solo
      ? ""
      : `<h3 class="hs-title">${T.finalStandings}</h3>${this.standingsHtml(view)}`;
    const scores = this.game
      ? `<h3 class="hs-title">${T.highscoresFor(this.game.diceCount)}</h3>
         ${this.highscoreListHtml(this.game.diceCount, this.newRanks)}`
      : "";
    const ov = this.overlayEl(
      `<div class="banner"><div class="trophy">🏆</div><h2>${T.gameOver}</h2><p>${msg}</p></div>
       ${standings}
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
             <li><b>Yläbonus:</b> yläosa ylittää kynnyksen 63 (5 noppaa) → +50, tai
                 84 (6 noppaa) → +100.</li>
             <li><b>Polttaminen:</b> 0 p:n kirjaus uhraa rivin. Jos mikään kirjaus ei ole
                 sallittu, avoimet ruudut saa aina polttaa.</li>
             <li><b>Loppusumma</b> = sarakkeiden summa. Suurin voittaa.</li>
           </ul>`;
    return this.overlayEl(`${body}<div class="actions"><button class="primary" data-close="x">${T.close}</button></div>`, true);
  }

  private highscoreOverlay(): HTMLElement {
    const diceCount = this.hsTab ?? this.game?.diceCount ?? 6;
    // Varianttivälilehdet: kummankin noppamäärän lista on aina katsottavissa,
    // myös aloitusnäytöltä (oletus = käynnissä olevan pelin variantti tai 6).
    const tabs = ([5, 6] as DiceCount[])
      .map(
        (n) =>
          `<button class="choice${n === diceCount ? " selected" : ""}" data-hs-tab="${n}">${T.diceTab(n)}</button>`,
      )
      .join("");
    const hasScores = this.highscores.list(diceCount).length > 0;
    const clearBtn = hasScores
      ? `<button class="secondary" data-act="clear-hs">${T.clearHighscores}</button> `
      : "";
    const ov = this.overlayEl(
      `<h2>${T.highscores}</h2>
       <div class="choice-row hs-tabs">${tabs}</div>
       ${this.highscoreListHtml(diceCount, [])}
       <div class="actions">${clearBtn}<button class="primary" data-close="x">${T.close}</button></div>`,
      true,
    );
    ov.querySelectorAll<HTMLButtonElement>("[data-hs-tab]").forEach((btn) =>
      btn.addEventListener("click", () => {
        this.hsTab = Number(btn.dataset.hsTab) as DiceCount;
        this.render();
      }),
    );
    ov.querySelector('[data-act="clear-hs"]')?.addEventListener("click", () => {
      this.showConfirm(T.clearHighscoresConfirm, () => {
        this.highscores.clear();
        this.newRanks = [];
        this.render();
      });
    });
    return ov;
  }

  /** Loppunäytön tulostaulukko: kaikki pelaajat pistejärjestyksessä, voittaja(t)
   *  korostettuna. Tasapisteet jakavat saman sijan (kilpailujärjestys). */
  private standingsHtml(view: GameView): string {
    const sorted = [...view.players].sort((a, b) => b.total - a.total);
    const rows = sorted
      .map((p, i) => {
        const rank = sorted.findIndex((q) => q.total === p.total) + 1;
        const win = i === 0 || p.total === sorted[0].total ? ' class="result-win"' : "";
        return `<tr${win}>
             <td class="hs-rank">${rank}.</td>
             <td class="hs-name">${p.name}</td>
             <td class="hs-score">${p.total}</td>
           </tr>`;
      })
      .join("");
    return `<table class="hs-table result-table"><tbody>${rows}</tbody></table>`;
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
        this.hsTab = null;
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
