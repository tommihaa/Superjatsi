import "./header";
import "./setup";
import "./status-bar";
import "./dice-tray";
import "./scorecard-view";

import { AverageStore, type AverageEntry } from "../domain/averages";
import { GameState } from "../domain/game";
import { HighscoreStore } from "../domain/highscores";
import { SetupPrefs, SoundPrefs, type SoundTheme } from "../domain/prefs";
import { GamePersistence } from "../domain/storage";
import type { DiceCount } from "../domain/types";
import { T } from "./strings";
import { buildView, type GameView } from "./view";
import { glowCells, starStorm } from "./effects";
import { setSfxEnabled, setTheme, sfx } from "./sfx";
import { downloadRecapImage } from "./recap-image";
import type { AppHeader } from "./header";
import type { Setup } from "./setup";
import type { StatusBar } from "./status-bar";
import type { DiceTray } from "./dice-tray";
import type { ScorecardView } from "./scorecard-view";

type Overlay = "rules" | "about" | "scores" | "settings" | null;

// Versioleima: Vite `define` syöttää nämä build-aikana (ks. vite.config.ts).
declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;

// Palaute- ja tukilinkit (sama tekijä kuin sisarpeleissä, linkit uudelleenkäytettäviä).
const MAILTO = "mailto:no.jopas@gmail.com?subject=Superjatsi-palaute";
const KOFI = "https://ko-fi.com/tommih";

/** Ennätysäänen kynnys (Tommin linjaus 6.7): aloittelijalle lähes joka peli on
 *  "ennätys" (top 10 täyttymässä) — ääni jankuttaisi. Vasta kun listalle päässeellä
 *  pelaajalla on riittävästi historiaa, on ennätys harvinainen tarpeeksi juhlittavaksi. */
const RECORD_SOUND_MIN_GAMES = 15;

/** Vahinko-tuplaklikkauksen esto: tabletilla nopea kaksoisnapautus Heitä-nappiin
 *  laukaisi kaksi erillistä click-eventtiä, jolloin yksi heitto "syötiin" vahingossa
 *  (roll() on molemmilla kerroilla laillinen, joten domain ei sitä estä). Peräkkäiset
 *  heittopyynnöt tämän ikkunan sisällä ohitetaan; ihminen ei ehdi harkittuun uusintaan
 *  näin nopeasti, joten laillinen peli ei kärsi. Kytketty heittoanimaation kestoon
 *  (.die.rolling ~0.32 s) hieman ylimitoitettuna. */
const ROLL_COOLDOWN_MS = 400;

// <sj-app>: juurikomponentti. Omistaa GameStaten ja persistoinnin, orkestroi
// lapsikomponentit ja kuuntelee niiden eventtejä (delegoituna tähän kerran).
export class App extends HTMLElement {
  private game: GameState | null = null;
  private overlay: Overlay = null;
  private readonly persistence = new GamePersistence(window.localStorage);
  private readonly highscores = new HighscoreStore(window.localStorage);
  private readonly averages = new AverageStore(window.localStorage);
  private readonly setupPrefs = new SetupPrefs(window.localStorage);
  private readonly soundPrefs = new SoundPrefs(window.localStorage);
  /** Juuri päättyneen pelin listalle päässeet sijoitukset (korostusta varten). */
  private newRanks: number[] = [];
  /** Soitetaanko ennätysääni: vain kun listalle päässeellä pelaajalla on takanaan
   *  riittävästi pelejä. Aloittelijalla lähes joka peli on "ennätys" (top 10 vasta
   *  täyttymässä), joten ääni jankuttaisi — ★-korostus näkyy silti aina.
   *  Raja Tommin linjauksesta 6.7 ("vasta 10–20 pelin jälkeen"). */
  private recordSoundEligible = false;
  /** Ennätysoverlayn valittu varianttivälilehti (null = pelin/oletuksen mukaan). */
  private hsTab: DiceCount | null = null;
  /** Viimeksi renderöity näkymä (tähtimyrskyn liipaisu heiton jälkeen). */
  private lastView: GameView | null = null;
  /** Viimeisimmän hyväksytyn heiton aikaleima (vahinko-tuplaklikkauksen esto). */
  private lastRollAt = 0;

  connectedCallback(): void {
    const sound = this.soundPrefs.load();
    setSfxEnabled(sound.enabled);
    setTheme(sound.theme);
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
      this.startGame(names, diceCount);
    });
    this.addEventListener("roll", () => {
      // Ohita vahinko-tuplaklikkaus: kaksi peräkkäistä heittopyyntöä lyhyen ikkunan
      // sisällä on käytännössä aina yksi tahaton kaksoisnapautus, ei kaksi heittoa.
      const now = Date.now();
      if (now - this.lastRollAt < ROLL_COOLDOWN_MS) return;
      this.lastRollAt = now;
      this.mutate((g) => g.roll());
      sfx.roll();
      // Juhla vain heiton jälkeen — ei uudelleenrenderöinneissä (lukitus ym.),
      // jottei sama käsi juhli montaa kertaa. TOP = sade + hehku, GREAT = hehku.
      // Juhlaääni rämähdyksen perään pienellä viiveellä, etteivät ne puuroudu.
      if (this.lastView?.celebration) {
        const top = this.lastView.celebration === "top";
        if (top) starStorm();
        glowCells(this, this.lastView.celebrationCells);
        setTimeout(() => (top ? sfx.celebrationTop() : sfx.celebrationGreat()), 300);
      }
    });
    this.addEventListener("toggle-hold", (e) => {
      const i = (e as CustomEvent).detail.index as number;
      this.mutate((g) => g.toggleHold(i));
      if (this.game?.dice.held[i]) sfx.hold();
      else sfx.release();
    });
    this.addEventListener("commit", (e) => {
      const { columnId, rowId } = (e as CustomEvent).detail;
      this.mutate((g) => g.commit(columnId, rowId, {}));
    });
    this.addEventListener("confirm-commit", () => {
      if (!this.game) return;
      // Bonuksen ylitys on laskettava ennen vahvistusta (pending-tieto nollautuu).
      const bonusSecured = this.bonusJustSecured();
      this.mutate((g) => g.confirm());
      this.playCommitSound(bonusSecured);
      if (this.game.isOver()) {
        // Voittofanfaari kuittausäänen jälkeen; ennätyshelähdys fanfaarin perään
        // (vain kokeneelle — ks. recordSoundEligible).
        setTimeout(() => sfx.win(), 500);
        if (this.recordSoundEligible) setTimeout(() => sfx.record(), 1500);
      }
    });
    this.addEventListener("cancel-commit", () => {
      this.mutate((g) => g.cancel());
      sfx.cancel();
    });
    this.addEventListener("open-rules", () => this.setOverlay("rules"));
    this.addEventListener("open-about", () => this.setOverlay("about"));
    this.addEventListener("open-highscores", () => this.setOverlay("scores"));
    this.addEventListener("open-settings", () => this.setOverlay("settings"));
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

  /** Aloita uusi peli annetuilla pelaajilla ja noppamäärällä (aloitusnäytöstä tai
   *  loppunäytön "Pelaa uudelleen" -pikauusinnasta samoilla asetuksilla). */
  private startGame(names: string[], diceCount: DiceCount): void {
    this.game = new GameState(names, diceCount);
    this.setupPrefs.save({ names, diceCount });
    this.persist();
    this.overlay = null;
    this.newRanks = [];
    this.render();
  }

  /** Varmistuuko yläbonus juuri vahvistettavalla kirjauksella? Pending-arvo on
   *  jo kortissa, joten verrataan välisummaa ilman sitä ja sen kanssa. */
  private bonusJustSecured(): boolean {
    const g = this.game;
    if (!g?.pending) return false;
    const { columnId, rowId } = g.pending;
    const card = g.currentCard();
    if (card.rows.find((r) => r.id === rowId)?.section !== "upper") return false;
    const sub = card.upperSubtotal(columnId);
    const val = card.get(columnId, rowId) ?? 0;
    return val > 0 && sub >= card.bonusThreshold && sub - val < card.bonusThreshold;
  }

  /** Vahvistetun kirjauksen ääni, yksi per kirjaus tärkeysjärjestyksessä:
   *  Superjatsi (nimikkohetki) > bonuksen varmistuminen > kuittaus / poltto. */
  private playCommitSound(bonusSecured: boolean): void {
    const lm = this.game?.lastMove;
    if (!lm) return;
    if (lm.score > 0 && lm.rowId === "superyatzy") sfx.superjatsi();
    else if (bonusSecured) sfx.bonus();
    else if (lm.score > 0) sfx.confirm();
    else sfx.burn();
  }

  private resetToSetup(): void {
    // Kesken jätetty peli kirjataan keskiarvoihin kertyneellä summalla — vain
    // pelaajilta jotka ehtivät kirjata jotain (tyhjä aloitus ei paina nollalla).
    // Loppuun pelattu on jo kirjattu mutate():ssa pelin päättyessä.
    if (this.game && !this.game.isOver()) {
      const played = this.game.players.filter((p) => !p.card.isEmpty());
      this.averages.record(
        this.game.diceCount,
        played.map((p) => ({ name: p.name, score: p.card.grandTotal() })),
      );
    }
    this.persistence.clear();
    this.game = null;
    this.overlay = null;
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

  /** Kirjaa päättyneen pelin loppusummat ennätyslistalle ja keskiarvoihin. */
  private recordHighscores(): void {
    if (!this.game) return;
    const results = this.game.players.map((p) => ({ name: p.name, score: p.card.grandTotal() }));
    this.newRanks = this.highscores.submit(this.game.diceCount, results);
    this.averages.record(this.game.diceCount, results);
    // Pelimäärät luetaan keskiarvoista tämän pelin kirjauksen jälkeen (per nimi
    // + variantti, keskeytetyt mukana) — sama historia jota ennätyksetkin mittaavat.
    const entries = this.highscores.list(this.game.diceCount);
    const games = new Map(this.averages.list(this.game.diceCount).map((e) => [e.name, e.games]));
    this.recordSoundEligible = this.newRanks.some(
      (r) => (games.get(entries[r]?.name) ?? 0) >= RECORD_SOUND_MIN_GAMES,
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
    else if (this.overlay) this.append(this.infoOverlay(this.overlay));

    if (becamePending) this.querySelector<HTMLButtonElement>("button.confirm")?.focus();
  }

  /** Vuoronvaihtoruutu: kuittaus edellisestä kirjauksesta + "Anna laite pelaajalle X".
   *  Ei sulkeudu taustaa klikkaamalla — tarkoitus on estää vahinkoklikkaukset. */
  private gameOverOverlay(view: GameView): HTMLElement {
    // Yksinpeli: ei voittajaa vaan tulos.
    const msg = T.soloResult(view.players[0].total);
    const scores = this.game
      ? `<h3 class="hs-title">${T.highscoresFor(this.game.diceCount)}</h3>
         ${this.highscoreListHtml(this.game.diceCount, this.newRanks)}`
      : "";
    // Pelaajat ja noppamäärä talteen ennen kuin "Pelaa uudelleen" korvaa pelin.
    const names = this.game?.players.map((p) => p.name) ?? [];
    const diceCount = this.game?.diceCount;
    const ov = this.overlayEl(
      `<div class="banner"><div class="trophy">🏆</div><h2>${T.gameOver}</h2><p>${msg}</p></div>
       ${scores}
       <div class="actions">
         <button class="secondary" data-act="download-recap">${T.downloadImage}</button>
         <button class="secondary" data-act="to-menu">${T.backToMenu}</button>
         <button class="primary" data-act="play-again">${T.playAgain}</button>
       </div>`,
      false,
    );
    ov.querySelector('[data-act="download-recap"]')?.addEventListener("click", () => {
      if (this.game) downloadRecapImage(this.game);
    });
    // Valikkoon: nollaa aloitusnäyttöön (ennätykset on jo kirjattu pelin päättyessä).
    ov.querySelector('[data-act="to-menu"]')?.addEventListener("click", () => this.resetToSetup());
    // Pelaa uudelleen: aloita heti uusi peli samoilla pelaajilla ja noppamäärällä.
    ov.querySelector('[data-act="play-again"]')?.addEventListener("click", () => {
      if (diceCount) this.startGame(names, diceCount);
    });
    return ov;
  }

  private infoOverlay(kind: "rules" | "about" | "scores" | "settings"): HTMLElement {
    if (kind === "scores") return this.highscoreOverlay();
    if (kind === "settings") return this.settingsOverlay();
    if (kind === "about") return this.aboutOverlay();
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

  /** Tietoja: pelin esittely + palaute-/Ko-fi-linkit + PWA-asennusohje + versioleima.
   *  Puhtaasti UI-tekstiä (data strings.ts:ssä), ei domain-logiikkaa. */
  private aboutOverlay(): HTMLElement {
    const esc = (s: string) =>
      s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
    const paras = T.aboutParas.map((p) => `<p>${esc(p)}</p>`).join("");
    const links = `
      <div class="about-links">
        <a class="about-link" href="${MAILTO}">${esc(T.aboutFeedback)}</a>
        <a class="about-link about-kofi" href="${KOFI}" target="_blank" rel="noopener">${esc(T.aboutKofi)}</a>
      </div>`;
    const groups = T.installGroups
      .map((g) => {
        const rows = g.rows
          .map(([browser, steps]) => `<div class="install-row"><b>${esc(browser)}</b><span>${esc(steps)}</span></div>`)
          .join("");
        return `<div class="install-group"><h4>${esc(g.title)}</h4>${rows}</div>`;
      })
      .join("");
    const install = `<h3>${esc(T.installTitle)}</h3><p>${esc(T.installIntro)}</p><div class="install">${groups}</div>`;
    const otherGames = `<h3>${esc(T.otherGamesTitle)}</h3><p>${esc(T.otherGamesIntro)}</p>
      <div class="other-games">${T.otherGames
        .map(
          (g) =>
            `<a class="other-game" href="${g.url}" target="_blank" rel="noopener"><b>${esc(g.name)}</b><span>${esc(g.blurb)}</span></a>`,
        )
        .join("")}</div>`;
    const version = `<p class="about-version">${esc(T.version(__APP_VERSION__, __BUILD_DATE__))}</p>`;
    return this.overlayEl(
      `<h2>${esc(T.aboutTitle)}</h2>${paras}${links}${otherGames}${install}${version}` +
        `<div class="actions"><button class="primary" data-close="x">${T.close}</button></div>`,
      true,
    );
  }

  /** Asetukset: äänikytkin + ääniteema (ratas palasi headeriin tämän myötä). */
  private settingsOverlay(): HTMLElement {
    const sound = this.soundPrefs.load();
    const btn = (value: boolean, label: string) =>
      `<button class="choice${value === sound.enabled ? " selected" : ""}" data-snd="${value ? "on" : "off"}">${label}</button>`;
    const themeBtn = (value: SoundTheme, label: string) =>
      `<button class="choice${value === sound.theme ? " selected" : ""}" data-theme="${value}">${label}</button>`;
    const ov = this.overlayEl(
      `<h2>${T.settings}</h2>
       <div class="settings-row">
         <span class="settings-label">${T.sounds}</span>
         <div class="choice-row">${btn(true, T.soundsOn)}${btn(false, T.soundsOff)}</div>
       </div>
       ${
         sound.enabled
           ? `<div class="settings-row">
                <span class="settings-label">${T.soundTheme}</span>
                <div class="choice-row">${themeBtn("oletus", T.soundThemeDefault)}${themeBtn("torvi-kannel", T.soundThemeHornKantele)}</div>
              </div>
              <div class="settings-row">
                <span class="settings-label">${T.trySounds}</span>
                <div class="choice-row">
                  <button class="choice" id="mute-sounds">${T.muteSounds}</button>
                  ${Object.entries(T.sfxLabels)
                    .map(([fn, label]) => `<button class="choice" data-try="${fn}">${label}</button>`)
                    .join("")}
                </div>
              </div>`
           : ""
       }
       <div class="actions"><button class="primary" data-close="x">${T.close}</button></div>`,
      true,
    );
    ov.querySelectorAll<HTMLButtonElement>("[data-snd]").forEach((b) =>
      b.addEventListener("click", () => {
        const on = b.dataset.snd === "on";
        this.soundPrefs.save({ ...sound, enabled: on });
        setSfxEnabled(on);
        if (on) sfx.confirm(); // ääninäyte: kuulet heti että äänet toimivat
        this.render();
      }),
    );
    ov.querySelectorAll<HTMLButtonElement>("[data-theme]").forEach((b) =>
      b.addEventListener("click", () => {
        const chosen = b.dataset.theme as SoundTheme;
        this.soundPrefs.save({ ...sound, theme: chosen });
        setTheme(chosen);
        sfx.confirm(); // ääninäyte uudella teemalla
        this.render();
      }),
    );
    ov.querySelectorAll<HTMLButtonElement>("[data-try]").forEach((b) =>
      b.addEventListener("click", () => {
        const fn = b.dataset.try as keyof typeof sfx;
        sfx[fn]();
      }),
    );
    ov.querySelector<HTMLButtonElement>("#mute-sounds")?.addEventListener("click", () => {
      this.soundPrefs.save({ ...sound, enabled: false });
      setSfxEnabled(false);
      this.render();
    });
    return ov;
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
    const averages = this.averages.list(diceCount);
    // Keskiarvo-osio näytetään vasta kun kirjattavaa on — tyhjänä se vain veisi tilaa.
    const avgSection =
      averages.length > 0
        ? `<h3 class="hs-title">${T.averages}</h3>${this.averageListHtml(averages)}`
        : "";
    const hasScores = this.highscores.list(diceCount).length > 0;
    const clearBtn =
      hasScores || averages.length > 0
        ? `<button class="secondary" data-act="clear-hs">${T.clearHighscores}</button> `
        : "";
    const ov = this.overlayEl(
      `<h2>${T.highscores}</h2>
       <div class="choice-row hs-tabs">${tabs}</div>
       ${this.highscoreListHtml(diceCount, [])}
       ${avgSection}
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
        this.averages.clear();
        this.newRanks = [];
        this.render();
      });
    });
    return ov;
  }

  /** Keskiarvotaulu: koko historian keskiarvo + viimeisimpien pelien liukuva
   *  keskiarvo rinnakkain (trendin suunta). Liukuva näytetään vasta kun pelejä
   *  on enemmän kuin ikkunassa — sitä ennen se olisi identtinen. */
  private averageListHtml(entries: AverageEntry[]): string {
    const rows = entries
      .map((e) => {
        const recent =
          e.games > e.recentCount
            ? `${T.recentAvg(e.recentCount)} ${T.avgValue(e.recentAverage)}`
            : "";
        return `<tr>
             <td class="hs-name">${e.name}</td>
             <td class="hs-score">${T.avgValue(e.average)}</td>
             <td class="avg-meta">${T.gamesCount(e.games)}</td>
             <td class="avg-meta">${recent}</td>
           </tr>`;
      })
      .join("");
    return `<table class="hs-table avg-table"><tbody>${rows}</tbody></table>`;
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
