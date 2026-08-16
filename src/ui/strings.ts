// Kaikki UI-tekstit keskitetysti. i18n lisätään myöhemmin korvaamalla tämä
// kieliriippuvaisella haulla; komponentit eivät sisällä kovakoodattuja merkkijonoja.

import type { TermEntry } from "./glossary";

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

  // Säännöt: teksti on dataa eikä HTML-templaattia, jotta termimoduuli voi
  // korostaa termit siitä (Kaanon/TERMIMODUULI.md). Sisältö on sama kuin
  // ennen porttausta, ja kombot-rivi on ainoa lisäys.
  rulesLines: [
    {
      label: "Sarakkeet",
      text:
        "I = 1 heitto, II = enintään 2, III = enintään 3 (vapaa rivijärjestys). " +
        // "alas" ja "ylös" ovat tässä suuntasanoja, ja moottori on tarkoituksella
        // case-insensitive, joten ne korostuisivat sarakkeiden niminä. Siksi
        // suuntasanat ovat muodossa "alaspäin"/"ylöspäin" eivätkä osu kuvioihin.
        "ALAS täytetään ylhäältä alaspäin, YLÖS alhaalta ylöspäin (↓/↑ näyttää seuraavan rivin).",
    },
    { label: "Heitot", text: "3 per vuoro, nopat saa lukita klikkaamalla." },
    {
      label: "Yläbonus",
      text: "yläosa ylittää kynnyksen 63 (5 noppaa) → +50, tai 84 (6 noppaa) → +100.",
    },
    {
      label: "Kombot",
      text:
        "alaosan rivit ovat Pari, Kaksi paria, Kolme paria, Kolme samaa, Neljä samaa, " +
        "Täyskäsi, Pieni suora, Suuri suora, Täyssuora, Huvila, Torni, Sattuma, Jatsi ja " +
        "Superjatsi. Viisi niistä vaatii kuusi noppaa.",
    },
    {
      label: "Polttaminen",
      text:
        "0 p:n kirjaus uhraa rivin. Jos mikään kirjaus ei ole sallittu, avoimet ruudut saa " +
        "aina polttaa.",
    },
    { label: "Loppusumma", text: "kaikkien viiden sarakkeen summa, eli pelin tulos." },
  ] as readonly { label: string; text: string }[],
  glossaryTitle: "Sanasto",
  glossaryHint: "Napauta katkoviivalla merkittyä sanaa, niin selitys avautuu tekstin alle.",
  // Termistö: selitteet on todennettu käsin SUPERJATSI.md:tä vasten (K5).
  // Kuuden nopan ehto sanotaan selitteessä eikä erillisenä kenttänä.
  terms: [
    {
      term: "Sarake",
      selitys:
        "Tulokortissa on viisi pelisaraketta: I, II, III, ALAS ja YLÖS. Jokainen sarake on " +
        "oma itsenäinen pelinsä omalla yläbonuksellaan.",
      match: ["sarak*"],
      kategoria: "Tulokortti",
    },
    {
      term: "ALAS",
      selitys: "Sarake, joka on pakko täyttää ylhäältä alas järjestyksessä. Kolme heittoa käytössä.",
      match: ["ALAS"],
      kategoria: "Tulokortti",
      emoji: "↓",
    },
    {
      term: "YLÖS",
      selitys: "Sarake, joka on pakko täyttää alhaalta ylös järjestyksessä. Kolme heittoa käytössä.",
      match: ["YLÖS"],
      kategoria: "Tulokortti",
      emoji: "↑",
    },
    {
      term: "Yläosa",
      selitys:
        "Rivit Ykköset, Kakkoset, Kolmoset, Neloset, Vitoset ja Kutoset. Pisteet ovat " +
        "täsmäävien noppien summa.",
      match: ["yläosa*"],
      kategoria: "Tulokortti",
      esimerkki: "Kolme vitosta Vitoset-riville = 15 p.",
    },
    {
      term: "Yläbonus",
      selitys:
        "Kun sarakkeen yläosa yltää kynnykseen, sarake saa lisäpisteet: 63 p viidellä " +
        "nopalla → +50 p, 84 p kuudella nopalla → +100 p. Kynnys vastaa keskimäärin kolmea " +
        "(5 noppaa) tai neljää (6 noppaa) samaa per rivi.",
      match: ["yläbonus*", "bonuksen", "bonus"],
      kategoria: "Tulokortti",
    },
    {
      term: "Loppusumma",
      selitys: "Sarakkeiden I, II, III, ALAS ja YLÖS yhteissumma.",
      match: ["loppusumma*", "lopputulos"],
      kategoria: "Tulokortti",
    },
    {
      term: "Heitto",
      selitys:
        "Vuorolla on kolme heittoa. Heittojen välissä nopat saa lukita ja vapauttaa vapaasti. " +
        "Sarake I hyväksyy kirjauksen vain ensimmäisen heiton jälkeen, sarake II kahden.",
      match: ["heit*"],
      kategoria: "Vuoro",
    },
    {
      term: "Lukitseminen",
      selitys:
        "Nopan voi lukita klikkaamalla, jolloin se ei osallistu seuraavaan heittoon. " +
        "Lukituksen saa purkaa saman vuoron aikana milloin tahansa.",
      match: ["lukit*"],
      kategoria: "Vuoro",
    },
    {
      term: "Kirjaus",
      selitys:
        "Tuloksen merkitseminen valittuun ruutuun. Kirjaus päättää vuoron, ja se vahvistetaan " +
        "erikseen: Vahvista tai Peru.",
      match: ["kirjau*", "kirjat*", "kirjaa"],
      kategoria: "Vuoro",
    },
    {
      term: "Polttaminen",
      selitys:
        "Avoimen rivin saa merkitä nollaksi. ALAS- ja YLÖS-sarakkeissa poltto osuu " +
        "järjestyksen seuraavaan riviin. Jos mikään kirjaus ei ole sallittu, avoimet ruudut " +
        "saa aina polttaa, joten peli ei voi jumittua.",
      match: ["polt*"],
      kategoria: "Vuoro",
    },
    {
      term: "Pari",
      selitys: "Kaksi samaa silmälukua. Pisteet ovat parin silmien summa.",
      match: ["pari*"],
      kategoria: "Kombot",
      esimerkki: "5 5 → 10 p.",
    },
    {
      term: "Kaksi paria",
      selitys: "Kaksi eri paria. Pisteet ovat molempien parien silmien summa.",
      match: ["kaksi paria"],
      kategoria: "Kombot",
      esimerkki: "6 6 ja 3 3 → 18 p.",
    },
    {
      term: "Kolme paria",
      selitys: "Kolme eri paria, vain kuudella nopalla. Pisteet ovat kaikkien kuuden nopan summa.",
      match: ["kolme paria"],
      kategoria: "Kombot",
      esimerkki: "6 6 5 5 2 2 → 26 p.",
    },
    {
      term: "Kolme samaa",
      selitys: "Kolme samaa silmälukua. Pisteet ovat kolmikon silmien summa.",
      match: ["kolme samaa"],
      kategoria: "Kombot",
      esimerkki: "4 4 4 → 12 p.",
    },
    {
      term: "Neljä samaa",
      selitys: "Neljä samaa silmälukua. Pisteet ovat nelikön silmien summa.",
      match: ["neljä samaa"],
      kategoria: "Kombot",
      esimerkki: "5 5 5 5 → 20 p.",
    },
    {
      term: "Täyskäsi",
      selitys: "Kolme samaa ja pari. Pisteet ovat näiden viiden nopan summa.",
      match: ["täyskäsi", "täyskäden", "täyskättä"],
      kategoria: "Kombot",
      esimerkki: "3 3 3 ja 5 5 → 19 p.",
    },
    {
      term: "Pieni suora",
      selitys: "Silmäluvut 1-2-3-4-5. Kiinteät 15 p.",
      match: ["pieni suora", "pienen suoran"],
      kategoria: "Kombot",
    },
    {
      term: "Suuri suora",
      selitys: "Silmäluvut 2-3-4-5-6. Kiinteät 20 p.",
      match: ["suuri suora", "suuren suoran"],
      kategoria: "Kombot",
    },
    {
      term: "Täyssuora",
      selitys:
        "Silmäluvut 1-2-3-4-5-6, vain kuudella nopalla. Kiinteät 25 p, eli noppien summa 21 " +
        "ja 4 pistettä harvinaisuusbonusta.",
      match: ["täyssuora*"],
      kategoria: "Kombot",
    },
    {
      term: "Huvila",
      selitys:
        "Kaksi eri kolmikkoa, vain kuudella nopalla. Pisteet ovat kaikkien kuuden nopan summa.",
      match: ["huvila*"],
      kategoria: "Kombot",
      esimerkki: "3 3 3 ja 6 6 6 → 27 p.",
    },
    {
      term: "Torni",
      selitys:
        "Neljä samaa ja pari eri silmäluvulla, vain kuudella nopalla. Pisteet ovat kaikkien " +
        "kuuden nopan summa.",
      match: ["torni*"],
      kategoria: "Kombot",
      esimerkki: "2 2 2 2 ja 6 6 → 20 p.",
    },
    {
      term: "Sattuma",
      selitys: "Mikä tahansa käsi. Pisteet ovat kaikkien noppien summa.",
      match: ["sattuma*"],
      kategoria: "Kombot",
    },
    {
      term: "Jatsi",
      selitys: "Viisi samaa silmälukua. Kiinteät 50 p.",
      match: ["jatsi", "jatsin"],
      kategoria: "Kombot",
    },
    {
      term: "Superjatsi",
      selitys: "Kuusi samaa silmälukua, vain kuudella nopalla. Kiinteät 100 p.",
      match: ["superjatsi", "superjatsin"],
      kategoria: "Kombot",
    },
  ] as readonly TermEntry[],

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
