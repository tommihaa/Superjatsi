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
  settings: "Asetukset",
  settingsComing: "Asetukset tulossa myöhemmin.",
  close: "Sulje",

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
  bonus: "Bonus",
  upperSum: "Yläsumma",
  lowerSum: "Alasumma",
  grandTotal: "LOPPUTULOS",

  // Game over
  gameOver: "Peli päättyi",
  winner: (name: string) => `Voittaja: ${name}`,
  winnerTie: (names: string) => `Tasapeli: ${names}`,
  playAgain: "Pelaa uudelleen",
} as const;
