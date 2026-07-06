// Kevyt SFX-moduuli. Oletusteema syntetisoidaan Web Audiolla ajonaikaisesti,
// ei äänitiedostoja. AudioContext luodaan laiskasti ensimmäisestä äänestä —
// kaikki liipaisimet ovat käyttäjän klikkauksia, joten selainten autoplay-
// rajoitus ei estä toistoa.
//
// Torvi-kannel-teema (7.7.2026 jälkeen) käyttää sen sijaan kahta oikeaa
// äänitiedostoa (torvi + kantele, ks. `public/sfx/CREDITS.md` lisensseistä) —
// synteesiversio (sahalaita+alipäästö / Karplus-Strong) kuulosti käyttäjän
// mukaan "80-luvun tietokonepelin latausäänille", ei oikealta soittimelta.
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
  ensureSamplesLoaded();
}

/** Ääniteema (SoundPrefs). "torvi-kannel" korvaa ydinsilmukan piippaukset
 *  kantele-nypäisyillä — fanfaarit (TOP/Superjatsi/voitto) ovat jo torvea
 *  kummassakin teemassa, eivät muutu. */
export function setTheme(v: SoundTheme): void {
  theme = v;
  ensureSamplesLoaded();
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

/** Yksi äänilähde useammalle sävelkorkeudelle: nauhoitettu näyte + sen mitattu
 *  perustaajuus. `playSample` valitsee lähimmän ankkurin ja pitch-shiftaa vain
 *  jäljelle jäävän, kuulolle luontevan välin — ei koko pelin sävelalaa yhdestä
 *  näytteestä (kuulostaisi "possulta" ääripäissä). */
interface SampleAnchor {
  freq: number;
  url: string;
  buffer: AudioBuffer | null;
}

/** Aito 5-kielinen kantele (Tommin oma, DIY-rakennelma) — Wikimedia Commons,
 *  "DIY kantele sample raw.ogg", CC0 1.0. Kaksi ankkuria: matala (käyttäjän
 *  kuuntelemalla valitsema suosikkinäppäys) + korkea (sama nauhoitus, puhtaampi
 *  yläsävel kuultu ja hyväksytty 6.7.2026). */
const kanteleAnchors: SampleAnchor[] = [
  { freq: 121.2, url: "/sfx/kantele-low.wav", buffer: null },
  { freq: 457.1, url: "/sfx/kantele-high.wav", buffer: null },
];

/** Oikea käyrätorvi — University of Iowa Electronic Music Studios (MIS),
 *  Horn.mf.C4B4.aiff, vapaasti käytettävissä ilman rajoituksia. Kaksi ankkuria
 *  samasta kromaattisesta asteikosta (Eb4 + B4), molemmat kuultu ja hyväksytty. */
const hornAnchors: SampleAnchor[] = [
  { freq: 311.1, url: "/sfx/horn-low.wav", buffer: null },
  { freq: 495.5, url: "/sfx/horn-high.wav", buffer: null },
];

let samplesRequested = false;

/** Lataa & dekoodaa neljä näytettä kun torvi-kannel-teema on sekä valittu että
 *  äänet päällä — ei ennen sitä (ei turhaa työtä oletusteemalla). */
function ensureSamplesLoaded(): void {
  if (samplesRequested || !on || theme !== "torvi-kannel") return;
  samplesRequested = true;
  const c = ac();
  if (!c) return;
  for (const anchor of [...kanteleAnchors, ...hornAnchors]) {
    fetch(anchor.url)
      .then((res) => res.arrayBuffer())
      .then((data) => c.decodeAudioData(data))
      .then((buf) => {
        anchor.buffer = buf;
      })
      .catch(() => {
        /* verkko/selainvirhe: näyte jää soittamatta, ei kaada muuta äänentoistoa */
      });
  }
}

function pickAnchor(anchors: SampleAnchor[], targetFreq: number): SampleAnchor | null {
  let best: SampleAnchor | null = null;
  let bestDist = Infinity;
  for (const a of anchors) {
    if (!a.buffer) continue;
    const dist = Math.abs(Math.log2(targetFreq / a.freq));
    if (dist < bestDist) {
      bestDist = dist;
      best = a;
    }
  }
  return best;
}

/** Soittaa lähimmän näyteankkurin pitch-shiftattuna kohdetaajuuteen. Verhokäyrä
 *  (gain-node) toimii kuten aiemmin synteesissä — se rajaa äänen keston `dur`:iin
 *  riippumatta näytteen omasta luonnollisesta häipymästä. */
function playSample(anchors: SampleAnchor[], freq: number, { at = 0, dur = 0.3, gain = 0.12 }: ToneOpts = {}): void {
  const c = ac();
  if (!c) return;
  const anchor = pickAnchor(anchors, freq);
  if (!anchor || !anchor.buffer) return;
  const t0 = c.currentTime + at;
  const src = c.createBufferSource();
  src.buffer = anchor.buffer;
  src.playbackRate.value = freq / anchor.freq;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.1);
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

/** Torvi fanfaareihin: aito käyrätorvinäyte pitch-shiftattuna (ks. hornAnchors). */
function horn(freq: number, opts: { at?: number; dur?: number; gain?: number } = {}): void {
  playSample(hornAnchors, freq, { dur: 0.3, gain: 0.09, ...opts });
}

/** Kantele-nypäisy: aito kantelenäyte pitch-shiftattuna (ks. kanteleAnchors). */
function kantele(freq: number, opts: { at?: number; dur?: number; gain?: number } = {}): void {
  playSample(kanteleAnchors, freq, { dur: 1.1, gain: 0.16, ...opts });
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
