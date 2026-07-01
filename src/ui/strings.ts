// Kaikki UI-tekstit keskitetysti. i18n lisätään myöhemmin korvaamalla tämä
// kieliriippuvaisella haulla; komponentit eivät sisällä kovakoodattuja merkkijonoja.

export const T = {
  title: "Täysi",
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

  // Scorecard
  colSum: "=",
  nextInOrder: "seuraava täytettävä rivi",
  bonus: "Bonus",
  upperSum: "Yläsumma",
  lowerSum: "Alasumma",
  grandTotal: "LOPPUTULOS",

  // Game over
  gameOver: "Peli päättyi",
  soloResult: (score: number) => `Tulos: ${score} pistettä`,
  winner: (name: string) => `Voittaja: ${name}`,
  winnerTie: (names: string) => `Tasapeli: ${names}`,
  playAgain: "Pelaa uudelleen",

  // Highscores
  highscores: "Ennätykset",
  highscoresFor: (n: number) => `Ennätykset · ${n} noppaa`,
  noHighscores: "Ei vielä ennätyksiä — pelaa peli loppuun!",
  clearHighscores: "Tyhjennä ennätykset",
  clearHighscoresConfirm: "Tyhjennetäänkö kaikki ennätykset? Tätä ei voi perua.",
} as const;
