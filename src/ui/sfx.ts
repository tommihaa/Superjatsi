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

export type SoundTheme = "oletus" | "torvi-kannel";

let ctx: AudioContext | null = null;
// Oletus pois — app kytkee SoundPrefsin mukaan käynnistyksessä (oletus sielläkin pois).
let on = false;
let theme: SoundTheme = "oletus";

/** Kytkin asetuksista (SoundPrefs). Pois = yksikään ääni ei soi eikä
 *  AudioContextia edes luoda. */
export function setSfxEnabled(v: boolean): void {
  on = v;
}

/** Ääniteema (SoundPrefs). "torvi-kannel" korvaa ydinsilmukan piippaukset
 *  kantele-nypäisyillä — fanfaarit (TOP/Superjatsi/voitto) ovat jo torvea
 *  kummassakin teemassa, eivät muutu. */
export function setTheme(v: SoundTheme): void {
  theme = v;
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

/** Torviääneke fanfaareihin: kaksi hieman eri viritettyä sahalaita-oskillaattoria
 *  alipäästösuodattimen läpi (leveä, vaskimainen sointi) + lyhyt attack-ramppi
 *  ("huulistartti") — sine/triangle-piippausten sijaan. Tommin palaute 6.7:
 *  "torvensoittoa jäin kaipaamaan". */
function horn(freq: number, { at = 0, dur = 0.3, gain = 0.09 }: { at?: number; dur?: number; gain?: number } = {}): void {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + at;
  const g = c.createGain();
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(freq * 4, t0);
  g.gain.setValueAtTime(0.001, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.04);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  for (const detuneCents of [0, 6]) {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, t0);
    osc.detune.setValueAtTime(detuneCents, t0);
    osc.connect(lp);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
  lp.connect(g).connect(c.destination);
}

/** Kantele-nypäisy: Karplus-Strong-synteesi (nypätty kieli). Lyhyt kohinapurske
 *  syötetään DelayNode-silmukkaan, jonka paluuhaarassa alipäästösuodin tummentaa
 *  sointia joka kierroksella ja gain (~0.98) hidastaa häipymää — sama periaate
 *  kuin akustisessa kielessä (yliäänet vaimenevat nopeammin kuin perustaajuus).
 *  Tommin oma 5-kielinen kantele inspiraationa: taajuudet rajataan kutsujassa
 *  pieneen sävelvalikoimaan, jotta soitin kuulostaa johdonmukaiselta. */
function kantele(freq: number, { at = 0, dur = 1.1, gain = 0.16 }: { at?: number; dur?: number; gain?: number } = {}): void {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + at;
  const period = 1 / freq;
  const bufferSize = Math.max(2, Math.round(c.sampleRate * period));
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const src = c.createBufferSource();
  src.buffer = buffer;
  const delay = c.createDelay(1);
  delay.delayTime.setValueAtTime(period, t0);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(freq * 3, t0);
  const feedback = c.createGain();
  feedback.gain.setValueAtTime(0.98, t0);
  const out = c.createGain();
  out.gain.setValueAtTime(gain, t0);
  out.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

  src.connect(delay);
  delay.connect(lp);
  lp.connect(feedback);
  feedback.connect(delay); // silmukka: kieli soi kunnes gain vaimentaa sen
  delay.connect(out).connect(c.destination);
  src.start(t0);

  setTimeout(
    () => {
      [src, delay, lp, feedback, out].forEach((n) => n.disconnect());
    },
    (dur + at + 0.15) * 1000,
  );
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

  /** Nopan lukitus: napsahdus ylöspäin (torvi-kannel: lyhyt kantelenäppäys). */
  hold(): void {
    if (theme === "torvi-kannel") return kantele(660, { dur: 0.25, gain: 0.1 });
    tone(520, { dur: 0.07, type: "square", gain: 0.04, to: 680 });
  },

  /** Lukituksen vapautus: sama napsahdus alaspäin. */
  release(): void {
    if (theme === "torvi-kannel") return kantele(494, { dur: 0.25, gain: 0.1 });
    tone(680, { dur: 0.07, type: "square", gain: 0.04, to: 520 });
  },

  /** Pisteellisen kirjauksen kuittaus: kaksi nousevaa säveltä (C5→G5). */
  confirm(): void {
    if (theme === "torvi-kannel") {
      kantele(523, { dur: 0.5, gain: 0.13 });
      kantele(784, { at: 0.09, dur: 0.6, gain: 0.13 });
      return;
    }
    tone(523, { dur: 0.1 });
    tone(784, { at: 0.09, dur: 0.16 });
  },

  /** Poltto (0 p): oma matala laskeva sävy — toteava, ei rankaiseva. */
  burn(): void {
    if (theme === "torvi-kannel") return kantele(196, { dur: 0.5, gain: 0.14 });
    tone(220, { dur: 0.3, type: "triangle", gain: 0.12, to: 130 });
  },

  /** Peru: kirjauskuittauksen käänteinen suunta, hiljaisempana. */
  cancel(): void {
    if (theme === "torvi-kannel") {
      kantele(392, { dur: 0.35, gain: 0.09 });
      kantele(294, { at: 0.08, dur: 0.4, gain: 0.09 });
      return;
    }
    tone(392, { dur: 0.09, gain: 0.07 });
    tone(294, { at: 0.08, dur: 0.14, gain: 0.07 });
  },

  /** GREAT-heitto: kevyt kimallus (nouseva kolmisointu ylärekisterissä). */
  celebrationGreat(): void {
    if (theme === "torvi-kannel") {
      [659, 880, 1175].forEach((f, i) => kantele(f, { at: i * 0.08, dur: 0.7, gain: 0.11 }));
      return;
    }
    [988, 1319, 1568].forEach((f, i) => tone(f, { at: i * 0.07, dur: 0.14, gain: 0.06 }));
  },

  /** TOP-heitto: tähtimyrskyn torvifanfaari (duurikolmisointu + oktaavi). */
  celebrationTop(): void {
    [523, 659, 784, 1047].forEach((f, i) => horn(f, { at: i * 0.1, dur: 0.28 }));
  },

  /** Superjatsi kirjattu (6 samaa): pelin nimikkohetki, oma tunnistettava
   *  signature — torvinousu ja pitkä torviloppusointu. */
  superjatsi(): void {
    [523, 659, 784, 1047].forEach((f, i) => horn(f, { at: i * 0.12, dur: 0.24 }));
    // Loppusointu: C6 + E6 + G6 torvina yhdessä.
    [1047, 1319, 1568].forEach((f) => horn(f, { at: 0.52, dur: 0.7, gain: 0.05 }));
  },

  /** Yläbonus varmistui kirjauksella: kirkas kellomainen kilahdus. */
  bonus(): void {
    if (theme === "torvi-kannel") {
      [659, 988, 1319].forEach((f, i) => kantele(f, { at: i * 0.09, dur: 0.8, gain: 0.12 }));
      return;
    }
    tone(880, { dur: 0.35, gain: 0.08 });
    tone(1320, { dur: 0.35, gain: 0.05 });
    tone(1760, { at: 0.12, dur: 0.3, gain: 0.04 });
  },

  /** Vuoronvaihto: huomiomerkkiääni ("ding-dong") pelaajalle joka ei katso ruutua. */
  handoff(): void {
    if (theme === "torvi-kannel") {
      kantele(660, { dur: 0.5, gain: 0.13 });
      kantele(523, { at: 0.24, dur: 0.6, gain: 0.13 });
      return;
    }
    tone(660, { dur: 0.26, gain: 0.08 });
    tone(523, { at: 0.24, dur: 0.32, gain: 0.08 });
  },

  /** Pelin päätös: torviloppufanfaari ("ta-ta-ta-taa"). */
  win(): void {
    [392, 523, 659, 784].forEach((f, i) => horn(f, { at: i * 0.14, dur: 0.26 }));
    horn(1047, { at: 0.6, dur: 0.75 });
  },

  /** Uusi ennätys listalla: nopea nouseva helähdys (eri kuin voittofanfaari). */
  record(): void {
    if (theme === "torvi-kannel") {
      [659, 784, 988, 1319].forEach((f, i) => kantele(f, { at: i * 0.05, dur: 0.55, gain: 0.11 }));
      return;
    }
    [659, 784, 988, 1319].forEach((f, i) => tone(f, { at: i * 0.06, dur: 0.16, gain: 0.07 }));
  },
};
