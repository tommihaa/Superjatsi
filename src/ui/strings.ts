// Kaikki UI-tekstit keskitetysti. i18n lisätään myöhemmin korvaamalla tämä
// kieliriippuvaisella haulla; komponentit eivät sisällä kovakoodattuja merkkijonoja.

export const T = {
  title: "Superjatsi",
  tagline: "Noppapeli yhdelle pelaajalle",

  // Setup
  newGame: "Uusi peli",
  diceCount: "Noppia",
  fiveDice: "5 (Jatsi)",
  sixDice: "6 (Superjatsi)",
  diceHintMobile: "📱 Puhelimessa 5 noppaa istuu näytölle mukavimmin",
  nameLabel: "Nimi",
  playerName: (i: number) => `Pelaaja ${i}`,
  start: "Aloita peli",

  // Header
  rules: "Säännöt",
  about: "Tietoja",
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
  playAgain: "Pelaa uudelleen",
  backToMenu: "Valikkoon",
  downloadImage: "Lataa kuva tuloksesta",

  // Highscores
  highscores: "Ennätykset",
  highscoresFor: (n: number) => `Ennätykset · ${n} noppaa`,
  diceTab: (n: number) => `${n} noppaa`,
  noHighscores: "Ei vielä ennätyksiä: pelaa peli loppuun!",
  clearHighscores: "Tyhjennä ennätykset ja keskiarvot",
  clearHighscoresConfirm: "Tyhjennetäänkö kaikki ennätykset ja keskiarvot? Tätä ei voi perua.",

  // Keskiarvot
  averages: "Keskiarvot",
  avgValue: (v: number) => v.toFixed(1).replace(".", ","),
  gamesCount: (n: number) => (n === 1 ? "1 peli" : `${n} peliä`),
  recentAvg: (n: number) => `viim. ${n}:`,

  // Tietoja (esittely + palautelinkit + muut pelit + PWA-asennusohje)
  // Selkokieltä: lyhyet lauseet, yksi ajatus kerrallaan. Saavutettavuusrivi mukana.
  aboutTitle: "Tietoja Superjatsista",
  aboutParas: [
    "Superjatsi on noppapeli. Heität noppia. Kirjaat tulokset kortin ruutuihin.",
    "Pelaat yksin ja omassa tahdissasi. Yksi kuuden nopan peli voi kestää " +
      "20-25 minuuttia. Yrität saada mahdollisimman paljon pisteitä.",
    "Peli toimii näppäimistöllä, hiirellä ja kosketuksella.",
    "Peli ei kerää sinusta mitään. Ei tiliä, ei mainoksia. Ennätyksesi tallentuvat " +
      "vain sinun selaimeesi.",
    "Peli on ilmainen ja tehty jaettavaksi. Voit lähettää palautetta. Voit myös " +
      "tarjota tekijälle kahvit.",
  ] as readonly string[],
  aboutFeedback: "✉ Lähetä palautetta",
  aboutKofi: "☕ Tue Ko-fissa",
  otherGamesTitle: "Muut pelit",
  otherGamesIntro: "Samalta tekijältä. Kaikki ilmaisia ja ilman mainoksia.",
  otherGames: [
    { name: "Itu", url: "https://tommi-itu.vercel.app", blurb: "suomen kielen sanapeli" },
    { name: "Jako", url: "https://tommi-jako.vercel.app", blurb: "yhdeksän korttipeliä" },
  ] as readonly { name: string; url: string; blurb: string }[],
  installTitle: "Lisää Superjatsi aloitusnäytölle 📲",
  installIntro:
    "Lisää Superjatsi puhelimen aloitusnäytölle tai tietokoneen työpöydälle, niin se " +
    "avautuu omasta kuvakkeestaan kuin sovellus, ilman selaimen palkkeja. Kerran avattu " +
    "peli toimii myös ilman verkkoa.",
  installGroups: [
    {
      title: "📱 Puhelin ja tabletti",
      rows: [
        ["Chrome · Brave · Edge · Opera (Android)", 'Valikko ⋮ → "Lisää aloitusnäyttöön" tai "Asenna sovellus".'],
        ["Samsung Internet", 'Valikko ≡ → "Lisää sivu kohteeseen" → "Aloitusnäyttö".'],
        ["Firefox (Android)", 'Valikko ⋮ → "Lisää aloitusnäyttöön".'],
        ["Safari (iPhone/iPad)", 'Jaa-painike → "Lisää Koti-valikkoon".'],
        ["Chrome ja muut (iPhone/iPad)", 'Jaa-painike → "Lisää Koti-valikkoon" (iOS sallii asennuksen vain Jaa-valikosta).'],
      ],
    },
    {
      title: "💻 Tietokone",
      rows: [
        ["Chrome · Edge · Brave · Opera · Vivaldi", 'Osoiterivin oikean reunan asennuskuvake ⊕ → "Asenna".'],
        ["Safari (Mac)", 'Tiedosto-valikko → "Lisää Dockiin".'],
        ["Firefox (tietokone)", "Ei tue asentamista. Lisää kirjanmerkki nopeaa avaamista varten."],
      ],
    },
  ] as readonly { title: string; rows: readonly (readonly [string, string])[] }[],
  version: (v: string, date: string) => `Superjatsi v${v} · ${date}`,
} as const;
