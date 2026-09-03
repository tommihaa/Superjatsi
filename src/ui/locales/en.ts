// Englanti. Toteuttaa `Strings`-tyypin, joten avainjoukko on täsmälleen suomen.
// Kirjoitettu 3.9.2026 kokeen toisena kielenä; natiivitarkistusta ei ole tehty.
//
// Termit: Maxi Yatzyn englanninkieliset vakiot (Full house, Villa, Tower, Chance,
// straight). Erisnimet Superjatsi ja Jatsi pysyvät (brändi ja tavaramerkkipinta,
// Yatzy-nimeä ei oteta käyttöön). Sarakkeet DOWN ja UP ovat termejä ja "up"/"down"
// ovat englannin yleisimpiä sanoja, joten sääntötekstissä suuntasanat ovat
// "downwards"/"upwards" eikä partikkeliverbejä (sama ansa kuin suomen alas/ylös).
import type { Strings } from "./fi";

export const en: Strings = {
  title: "Superjatsi",
  tagline: "A dice game for one player",
  metaDescription:
    "Superjatsi is a web-based dice game for one player. Offline, no ads and no account.",
  manifestName: "Superjatsi · dice game",

  // Setup
  newGame: "New game",
  diceCount: "Dice",
  fiveDice: "5 (Jatsi)",
  sixDice: "6 (Superjatsi)",
  diceHintMobile: "📱 On a phone, 5 dice fit the screen best",
  nameLabel: "Name",
  playerName: (i: number) => `Player ${i}`,
  start: "Start game",

  // Header
  rules: "Rules",
  about: "About",
  close: "Close",
  newGameConfirm: "Start a new game? The game in progress will be lost.",

  rulesLines: [
    {
      label: "Columns",
      text:
        "I = 1 roll, II = at most 2, III = at most 3 (free row order). " +
        "DOWN is filled from the top downwards, UP from the bottom upwards (↓/↑ shows the next row).",
    },
    { label: "Rolls", text: "3 per turn, dice can be held with a click." },
    {
      label: "Bonus",
      text: "upper section reaches the threshold 63 (5 dice) or 76 (6 dice) → +50.",
    },
    {
      label: "Combinations",
      text:
        "the lower section rows are Pair, Two pairs, Three pairs, Three of a kind, " +
        "Four of a kind, Full house, Small straight, Large straight, Full straight, Villa, " +
        "Tower, Chance, Jatsi and Superjatsi. Five of them require six dice.",
    },
    {
      label: "Scratching",
      text:
        "A 0-point score sacrifices the row. If no score is allowed, open cells may " +
        "always be scratched.",
    },
    { label: "Grand total", text: "the sum of all five columns, that is the game result." },
  ],
  glossaryTitle: "Glossary",
  glossaryHint: "Tap a word with a dashed underline and its explanation opens below the text.",
  terms: [
    {
      term: "Column",
      selitys:
        "The score sheet has five playing columns: I, II, III, DOWN and UP. Each column is " +
        "its own game with its own bonus.",
      match: ["column*"],
      kategoria: "Score sheet",
    },
    {
      term: "DOWN",
      selitys: "A column that must be filled from the top downwards in order. Three rolls available.",
      match: ["DOWN"],
      kategoria: "Score sheet",
      emoji: "↓",
    },
    {
      term: "UP",
      selitys: "A column that must be filled from the bottom upwards in order. Three rolls available.",
      match: ["UP"],
      kategoria: "Score sheet",
      emoji: "↑",
    },
    {
      term: "Upper section",
      selitys:
        "The rows Ones, Twos, Threes, Fours, Fives and Sixes. The score is the sum of the " +
        "matching dice.",
      match: ["upper section*"],
      kategoria: "Score sheet",
      esimerkki: "Three fives on the Fives row = 15 pts.",
    },
    {
      term: "Bonus",
      selitys:
        "When a column's upper section reaches the threshold, the column gets +50 pts: the " +
        "threshold is 63 pts with five dice and 76 pts with six. The threshold equals on " +
        "average three (5 dice) or about three and a half (6 dice) of a kind per row.",
      match: ["bonus*"],
      kategoria: "Score sheet",
    },
    {
      term: "Grand total",
      selitys: "The sum of columns I, II, III, DOWN and UP.",
      match: ["grand total*", "game result*"],
      kategoria: "Score sheet",
    },
    {
      term: "Roll",
      selitys:
        "A turn has three rolls. Between rolls, dice may be held and released freely. " +
        "Column I accepts a score only after the first roll, column II after two.",
      match: ["roll*"],
      kategoria: "Turn",
    },
    {
      term: "Holding",
      selitys:
        "A die is held with a click and then sits out the next roll. " +
        "A held die can be released at any time during the same turn.",
      match: ["hold*", "held"],
      kategoria: "Turn",
    },
    {
      term: "Scoring",
      selitys:
        "Entering the result in the chosen cell. Scoring ends the turn and is confirmed " +
        "separately: Confirm or Undo.",
      match: ["scor*"],
      kategoria: "Turn",
    },
    {
      term: "Scratching",
      selitys:
        "An open row may be entered as zero. In the DOWN and UP columns the scratch lands on " +
        "the next row in order. If no score is allowed, open cells may always be scratched, " +
        "so the game cannot get stuck.",
      match: ["scratch*"],
      kategoria: "Turn",
    },
    {
      term: "Pair",
      selitys: "Two dice of the same value. The score is the sum of the pair.",
      match: ["pair"],
      kategoria: "Combinations",
      esimerkki: "5 5 → 10 pts.",
    },
    {
      term: "Two pairs",
      selitys: "Two different pairs. The score is the sum of both pairs.",
      match: ["two pairs"],
      kategoria: "Combinations",
      esimerkki: "6 6 and 3 3 → 18 pts.",
    },
    {
      term: "Three pairs",
      selitys: "Three different pairs, six dice only. The score is the sum of all six dice.",
      match: ["three pairs"],
      kategoria: "Combinations",
      esimerkki: "6 6 5 5 2 2 → 26 pts.",
    },
    {
      term: "Three of a kind",
      selitys: "Three dice of the same value. The score is the sum of the three.",
      match: ["three of a kind"],
      kategoria: "Combinations",
      esimerkki: "4 4 4 → 12 pts.",
    },
    {
      term: "Four of a kind",
      selitys: "Four dice of the same value. The score is the sum of the four.",
      match: ["four of a kind"],
      kategoria: "Combinations",
      esimerkki: "5 5 5 5 → 20 pts.",
    },
    {
      term: "Full house",
      selitys: "Three of a kind and a pair. The score is the sum of these five dice.",
      match: ["full house*"],
      kategoria: "Combinations",
      esimerkki: "3 3 3 and 5 5 → 19 pts.",
    },
    {
      term: "Small straight",
      selitys: "The values 1-2-3-4-5. A fixed 15 pts.",
      match: ["small straight*"],
      kategoria: "Combinations",
    },
    {
      term: "Large straight",
      selitys: "The values 2-3-4-5-6. A fixed 20 pts.",
      match: ["large straight*"],
      kategoria: "Combinations",
    },
    {
      term: "Full straight",
      selitys:
        "The values 1-2-3-4-5-6, six dice only. A fixed 25 pts, that is the dice sum 21 " +
        "plus 4 points of rarity bonus.",
      match: ["full straight*"],
      kategoria: "Combinations",
    },
    {
      term: "Villa",
      selitys: "Two different three of a kinds, six dice only. The score is the sum of all six dice.",
      match: ["villa*"],
      kategoria: "Combinations",
      esimerkki: "3 3 3 and 6 6 6 → 27 pts.",
    },
    {
      term: "Tower",
      selitys:
        "Four of a kind and a pair of a different value, six dice only. The score is the sum " +
        "of all six dice.",
      match: ["tower*"],
      kategoria: "Combinations",
      esimerkki: "2 2 2 2 and 6 6 → 20 pts.",
    },
    {
      term: "Chance",
      selitys: "Any hand. The score is the sum of all dice.",
      match: ["chance*"],
      kategoria: "Combinations",
    },
    {
      term: "Jatsi",
      selitys: "Five dice of the same value. A fixed 50 pts.",
      match: ["jatsi"],
      kategoria: "Combinations",
    },
    {
      term: "Superjatsi",
      selitys: "Six dice of the same value, six dice only. A fixed 100 pts.",
      match: ["superjatsi"],
      kategoria: "Combinations",
    },
  ],

  // Asetukset
  settings: "Settings",
  language: "Language",
  sounds: "Sounds",
  soundsOn: "On",
  soundsOff: "Off",
  soundTheme: "Sound theme",
  soundThemeDefault: "Default",
  soundThemeHornKantele: "Horn & kantele",
  diceTheme: "Dice theme",
  diceThemeNames: {
    jalometalli: "Precious metal",
    puu: "Wood",
    norsunluu: "Ivory",
    kivi: "Stone",
    yo: "Night",
  },
  trySounds: "🔊 Try the sounds",
  muteSounds: "🔇 Mute sounds",
  sfxLabels: {
    roll: "Roll",
    hold: "Hold",
    release: "Release",
    confirm: "Score",
    burn: "Scratch",
    cancel: "Undo",
    celebrationGreat: "GREAT roll",
    celebrationTop: "TOP roll",
    superjatsi: "Superjatsi scored",
    bonus: "Bonus",
    win: "Win",
    record: "New record",
  },

  // Status / turn
  turnOf: (name: string) => `Turn: ${name}`,
  rollsLeft: (n: number) => (n === 1 ? "1 roll left" : `${n} rolls left`),
  rollToStart: "Roll to start the turn",
  pickCell: "Pick a cell to enter the score",
  total: "Total",

  // Dice tray
  emptyDie: "empty die",
  roll: "Roll",
  rollAgain: "Roll again",
  held: "Held",
  confirm: "Confirm",
  cancel: "Undo",
  confirmHint: "Confirm the score or undo",
  yes: "Yes",

  // Scorecard
  rows: {
    ones: { label: "Ones" },
    twos: { label: "Twos" },
    threes: { label: "Threes" },
    fours: { label: "Fours" },
    fives: { label: "Fives" },
    sixes: { label: "Sixes" },
    pair: { label: "Pair", description: "2 of the same value" },
    twoPairs: { label: "Two pairs", description: "2 different pairs" },
    threePairs: { label: "Three pairs", description: "3 different pairs (all 6 dice)" },
    threeKind: { label: "Three of a kind", description: "3 of the same value" },
    fourKind: { label: "Four of a kind", description: "4 of the same value" },
    fullHouse: { label: "Full house", description: "3 + 2 of a kind (two different values)" },
    smallStraight: { label: "Small straight", description: "1-2-3-4-5" },
    largeStraight: { label: "Large straight", description: "2-3-4-5-6" },
    fullStraight: { label: "Full straight", description: "1-2-3-4-5-6 (all 6 dice)" },
    huvila: { label: "Villa", description: "3 + 3 of a kind (two different triples)" },
    torni: { label: "Tower", description: "4 + 2 of a kind (two different values)" },
    chance: { label: "Chance", description: "Any combination" },
    yatzy: { label: "Jatsi", description: "5 of the same value" },
    superyatzy: { label: "Superjatsi", description: "6 of the same value" },
  },
  colSum: "=",
  colLabel: {
    I: "I",
    II: "II",
    III: "III",
    ALAS: "DOWN",
    YLOS: "UP",
  },
  colInfo: {
    I: "At most 1 roll, free row order",
    II: "At most 2 rolls, free row order",
    III: "At most 3 rolls, free row order",
    ALAS: "Filled from the top downwards in order",
    YLOS: "Filled from the bottom upwards in order",
  },
  nextInOrder: "next row to fill",
  cellCommitLabel: (row: string, col: string, score: number) =>
    score > 0 ? `Score ${row}, column ${col}: ${score} points` : `Scratch ${row}, column ${col}`,
  maxScore: "Maximum score of the category",
  bonus: "Bonus",
  bonusInfo: (threshold: number, value: number) =>
    `Column's upper section total at least ${threshold} pts → +${value} pts`,
  upperSum: "Upper total",
  upperSumInfo: (k: string, threshold: number) =>
    `Green +/red - shows the distance to bonus pace: the bonus needs on average ${k} of a kind per row. ` +
    `If the number is at least 0 at the end, the upper section reached the threshold ${threshold} pts.`,
  lowerSum: "Lower total",
  grandTotal: "GRAND TOTAL",

  // Game over
  gameOver: "Game over",
  soloResult: (score: number) => `Result: ${score} points`,
  playAgain: "Play again",
  backToMenu: "To menu",
  downloadImage: "Download result image",

  // Highscores
  highscores: "Records",
  highscoresFor: (n: number) => `Records · ${n} dice`,
  diceTab: (n: number) => `${n} dice`,
  noHighscores: "No records yet: play a game to the end.",
  clearHighscores: "Clear records and averages",
  clearHighscoresConfirm: "Clear all records and averages? This cannot be undone.",

  // Keskiarvot
  averages: "Averages",
  avgValue: (v: number) => v.toFixed(1),
  gamesCount: (n: number) => (n === 1 ? "1 game" : `${n} games`),
  recentAvg: (n: number) => `last ${n}:`,

  // Tietoja
  aboutTitle: "About Superjatsi",
  aboutParas: [
    "Superjatsi is a dice game. You roll dice. You enter the results in the cells of the score sheet.",
    "You play alone and at your own pace. One six-dice game can take " +
      "20-25 minutes. You try to score as many points as you can.",
    "The game works with a keyboard, a mouse and touch.",
    "The game collects nothing about you. No account, no ads. Your records are stored " +
      "only in your own browser.",
    "The game is free and made to be shared. You can send feedback. You can also " +
      "buy the author a coffee.",
  ],
  aboutFeedback: "✉ Send feedback",
  aboutKofi: "☕ Support on Ko-fi",
  otherGamesTitle: "Other games",
  otherGamesIntro: "By the same author. All free and without ads.",
  otherGames: [
    { name: "Itu", url: "https://tommi-itu.vercel.app", blurb: "a Finnish word game" },
    { name: "Jako", url: "https://tommi-jako.vercel.app", blurb: "nine card games" },
  ],
  installTitle: "Add Superjatsi to your home screen 📲",
  installIntro:
    "Add Superjatsi to your phone's home screen or your computer's desktop, and it opens " +
    "from its own icon like an app, without the browser bars. Once opened, the game " +
    "also works offline.",
  installGroups: [
    {
      title: "📱 Phone and tablet",
      rows: [
        ["Chrome · Brave · Edge · Opera (Android)", 'Menu ⋮ → "Add to Home screen" or "Install app".'],
        ["Samsung Internet", 'Menu ≡ → "Add page to" → "Home screen".'],
        ["Firefox (Android)", 'Menu ⋮ → "Add to Home screen".'],
        ["Safari (iPhone/iPad)", 'Share button → "Add to Home Screen".'],
        ["Chrome and others (iPhone/iPad)", 'Share button → "Add to Home Screen" (iOS allows installing only from the Share menu).'],
      ],
    },
    {
      title: "💻 Computer",
      rows: [
        ["Chrome · Edge · Brave · Opera · Vivaldi", 'Install icon ⊕ at the right end of the address bar → "Install".'],
        ["Safari (Mac)", 'File menu → "Add to Dock".'],
        ["Firefox (desktop)", "Does not support installing. Add a bookmark for quick access."],
      ],
    },
  ],
  version: (v: string, date: string) => `Superjatsi v${v} · ${date}`,

  // Muutosloki: data on vain suomeksi, esittelyrivi sanoo sen.
  changelog: "Changelog",
  changelogIntro: "What has changed in the game and why. Newest first. The log is in Finnish only.",
  changelogVersion: (v: string, date: string) => `v${v} · ${date}`,
  backToAbout: "Back",
};
