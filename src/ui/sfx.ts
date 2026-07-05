// Kevyt SFX-moduuli: kaikki äänet syntetisoidaan Web Audiolla ajonaikaisesti,
// ei äänitiedostoja (nolla latauskuormaa, ei assettien hallintaa). AudioContext
// luodaan laiskasti ensimmäisestä äänestä — kaikki liipaisimet ovat käyttäjän
// klikkauksia, joten selainten autoplay-rajoitus ei estä toistoa.
//
// Äänisuunnittelun periaatteet:
// - Ydinsilmukan äänet (heitto/lukitus/kirjaus) lyhyitä ja hiljaisia — ne soivat
//   kymmeniä kertoja per peli.
// - Merkkihetket (tähtimyrsky, Superjatsi, bonus, voitto) saavat olla näyttävämpiä,
//   koska ne ovat harvinaisia.
// - Poltolla on oma matala laskeva sävy: informatiivinen mutta ei rankaiseva.
//   HUOM: tämä on tietoinen poikkeama visuaalisesta linjasta (UI ei erottele
//   polttoa värillä) — päätetty käyttäjän kanssa 5.7.2026.

let ctx: AudioContext | null = null;
// Oletus pois — app kytkee SoundPrefsin mukaan käynnistyksessä (oletus sielläkin pois).
let on = false;

/** Kytkin asetuksista (SoundPrefs). Pois = yksikään ääni ei soi eikä
 *  AudioContextia edes luoda. */
export function setSfxEnabled(v: boolean): void {
  on = v;
}

function ac(): AudioContext | null {
  if (!on) return null;
  if (!ctx) {
    if (typeof AudioContext === "undefined") return null; // esim. vanha selain
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

interface ToneOpts {
  /** Aloitusviive sekunteina (sävelkulkujen porrastus). */
  at?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  /** Liukuma tähän taajuuteen keston aikana (esim. poltto alaspäin). */
  to?: number;
}

/** Yksi ääneke: oskillaattori + eksponentiaalisesti hiipuva verhokäyrä. */
function tone(freq: number, { at = 0, dur = 0.15, type = "sine", gain = 0.1, to }: ToneOpts = {}): void {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (to !== undefined) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  /** Nopan rämähdys: lyhyitä satunnaiskorkuisia klikkejä porrastettuna, jotta
   *  ääni ei toistu identtisenä ~30 kertaa per peli. */
  roll(): void {
    const clicks = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < clicks; i++) {
      tone(160 + Math.random() * 280, {
        at: i * 0.035 + Math.random() * 0.02,
        dur: 0.045,
        type: "triangle",
        gain: 0.06,
      });
    }
  },

  /** Nopan lukitus: napsahdus ylöspäin. */
  hold(): void {
    tone(520, { dur: 0.07, type: "square", gain: 0.04, to: 680 });
  },

  /** Lukituksen vapautus: sama napsahdus alaspäin. */
  release(): void {
    tone(680, { dur: 0.07, type: "square", gain: 0.04, to: 520 });
  },

  /** Pisteellisen kirjauksen kuittaus: kaksi nousevaa säveltä (C5→G5). */
  confirm(): void {
    tone(523, { dur: 0.1 });
    tone(784, { at: 0.09, dur: 0.16 });
  },

  /** Poltto (0 p): oma matala laskeva sävy — toteava, ei rankaiseva. */
  burn(): void {
    tone(220, { dur: 0.3, type: "triangle", gain: 0.12, to: 130 });
  },

  /** Peru: kirjauskuittauksen käänteinen suunta, hiljaisempana. */
  cancel(): void {
    tone(392, { dur: 0.09, gain: 0.07 });
    tone(294, { at: 0.08, dur: 0.14, gain: 0.07 });
  },

  /** GREAT-heitto: kevyt kimallus (nouseva kolmisointu ylärekisterissä). */
  celebrationGreat(): void {
    [988, 1319, 1568].forEach((f, i) => tone(f, { at: i * 0.07, dur: 0.14, gain: 0.06 }));
  },

  /** TOP-heitto: tähtimyrskyn fanfaari (duurikolmisointu + oktaavi). */
  celebrationTop(): void {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, { at: i * 0.09, dur: 0.22, type: "triangle", gain: 0.09 }));
  },

  /** Superjatsi kirjattu (6 samaa): pelin nimikkohetki, oma tunnistettava
   *  signature — pidempi nousu ja loppusointu. */
  superjatsi(): void {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, { at: i * 0.11, dur: 0.2, type: "triangle", gain: 0.09 }));
    // Loppusointu: C6 + E6 + G6 yhdessä.
    [1047, 1319, 1568].forEach((f) => tone(f, { at: 0.48, dur: 0.55, gain: 0.06 }));
  },

  /** Yläbonus varmistui kirjauksella: kirkas kellomainen kilahdus. */
  bonus(): void {
    tone(880, { dur: 0.35, gain: 0.08 });
    tone(1320, { dur: 0.35, gain: 0.05 });
    tone(1760, { at: 0.12, dur: 0.3, gain: 0.04 });
  },

  /** Vuoronvaihto: huomiomerkkiääni ("ding-dong") pelaajalle joka ei katso ruutua. */
  handoff(): void {
    tone(660, { dur: 0.26, gain: 0.08 });
    tone(523, { at: 0.24, dur: 0.32, gain: 0.08 });
  },

  /** Pelin päätös: voittofanfaari. */
  win(): void {
    [392, 523, 659, 784].forEach((f, i) => tone(f, { at: i * 0.13, dur: 0.24, type: "triangle", gain: 0.09 }));
    tone(1047, { at: 0.55, dur: 0.6, type: "triangle", gain: 0.09 });
  },

  /** Uusi ennätys listalla: nopea nouseva helähdys (eri kuin voittofanfaari). */
  record(): void {
    [659, 784, 988, 1319].forEach((f, i) => tone(f, { at: i * 0.06, dur: 0.16, gain: 0.07 }));
  },
};
