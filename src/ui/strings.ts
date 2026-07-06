// Kaikki UI-tekstit keskitetysti. i18n lisätään myöhemmin korvaamalla tämä
// kieliriippuvaisella haulla; komponentit eivät sisällä kovakoodattuja merkkijonoja.

export const T = {
  title: "Superjatsi",
  tagline: "Maxi-jatsi paikalliseen moninpeliin",

  // Setup
  newGame: "Uusi peli",
  diceCount: "Noppia",
  fiveDice: "5 (Jatsi)",
  sixDice: "6 (Superjatsi)",
  players: "Pelaajia",
  playerName: (i: number) => `Pelaaja ${i}`,
  start: "Aloita peli",

  // Header
  rules: "Säännöt",
  close: "Sulje",
  newGameConfirm: "Aloitetaanko uusi peli? Kesken oleva peli menetetään.",

  // Asetukset
  settings: "Asetukset",
  sounds: "Äänet",
  soundsOn: "Päällä",
  soundsOff: "Pois",
  soundTheme: "Ääniteema",
  soundThemeDefault: "Oletus",
  soundThemeHornKantele: "Torvi & kantele",
  trySounds: "🔊 Kokeile ääniä",
  muteSounds: "🔇 Hiljennä äänet",
  sfxLabels: {
    roll: "Heitto",
    hold: "Lukitus",
    release: "Vapautus",
    confirm: "Kirjaus",
    burn: "Poltto",
    cancel: "Peru",
    celebrationGreat: "GREAT-heitto",
    celebrationTop: "TOP-heitto",
    superjatsi: "Superjatsi kirjattu",
    bonus: "Yläbonus",
    handoff: "Vuoronvaihto",
    win: "Voitto",
    record: "Uusi ennätys",
  } as Record<string, string>,

  // Status / turn
  turnOf: (name: string) => `Vuorossa: ${name}`,
  rollsLeft: (n: number) => (n === 1 ? "1 heitto jäljellä" : `${n} heittoa jäljellä`),
  rollToStart: "Heitä aloittaaksesi vuoron",
  pickCell: "Valitse ruutu kirjataksesi tuloksen",
  total: "Yhteensä",

  // Dice tray
  roll: "Heitä",
  rollAgain: "Heitä uudelleen",
  held: "Lukittu",
  confirm: "Vahvista",
  cancel: "Peru",
  confirmHint: "Vahvista kirjaus tai peru",
  yes: "Kyllä",

  // Vuoronvaihto (pass-and-play)
  handoffTitle: (name: string) => `Anna laite pelaajalle ${name}`,
  recapScored: (player: string, row: string, score: number, col: string) =>
    `${player} kirjasi ${row} ${score} p sarakkeeseen ${col}`,
  recapBurned: (player: string, row: string, col: string) =>
    `${player} poltti rivin ${row} sarakkeessa ${col}`,
  startTurn: "Aloita vuoro",

  // Scorecard
  colSum: "=",
  colLabel: {
    I: "I",
    II: "II",
    III: "III",
    ALAS: "ALAS",
    YLOS: "YLÖS",
  } as Record<string, string>,
  colInfo: {
    I: "Enintään 1 heitto, vapaa rivijärjestys",
    II: "Enintään 2 heittoa, vapaa rivijärjestys",
    III: "Enintään 3 heittoa, vapaa rivijärjestys",
    ALAS: "Täytetään ylhäältä alas järjestyksessä",
    YLOS: "Täytetään alhaalta ylös järjestyksessä",
  } as Record<string, string>,
  nextInOrder: "seuraava täytettävä rivi",
  cellCommitLabel: (row: string, col: string, score: number) =>
    score > 0
      ? `Kirjaa ${row}, sarake ${col}: ${score} pistettä`
      : `Polta ${row}, sarake ${col}`,
  maxScore: "Kategorian maksimipisteet",
  bonus: "Bonus",
  bonusInfo: (threshold: number, value: number) =>
    `Sarakkeen yläosa yhteensä vähintään ${threshold} p → +${value} p`,
  upperSum: "Yläsumma",
  upperSumInfo: (k: number, threshold: number) =>
    `Vihreä +/punainen - näyttää eron bonustahtiin: bonus vaatii keskimäärin ${k} samaa per rivi. ` +
    `Jos luku on lopussa vähintään 0, yläosa ylsi kynnykseen ${threshold} p.`,
  lowerSum: "Alasumma",
  grandTotal: "LOPPUTULOS",

  // Game over
  gameOver: "Peli päättyi",
  soloResult: (score: number) => `Tulos: ${score} pistettä`,
  winner: (name: string) => `Voittaja: ${name}`,
  winnerTie: (names: string) => `Tasapeli: ${names}`,
  playAgain: "Pelaa uudelleen",
  finalStandings: "Lopputulokset",
  downloadImage: "Lataa kuva tuloksesta",

  // Highscores
  highscores: "Ennätykset",
  highscoresFor: (n: number) => `Ennätykset · ${n} noppaa`,
  diceTab: (n: number) => `${n} noppaa`,
  noHighscores: "Ei vielä ennätyksiä — pelaa peli loppuun!",
  clearHighscores: "Tyhjennä ennätykset ja keskiarvot",
  clearHighscoresConfirm: "Tyhjennetäänkö kaikki ennätykset ja keskiarvot? Tätä ei voi perua.",

  // Keskiarvot
  averages: "Keskiarvot",
  avgValue: (v: number) => v.toFixed(1).replace(".", ","),
  gamesCount: (n: number) => (n === 1 ? "1 peli" : `${n} peliä`),
  recentAvg: (n: number) => `viim. ${n}:`,
} as const;
