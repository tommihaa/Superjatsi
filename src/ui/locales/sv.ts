// Ruotsi. Toteuttaa `Strings`-tyypin, joten avainjoukko on täsmälleen suomen.
// Kirjoitettu 3.9.2026 kokeena (mekanismi + yksi kieli); natiivitarkistusta ei ole
// tehty, sama varaus kuin Jakon ei-fi-kielillä (Kaanon/HAUTAKIVET.md).
//
// Termit: ruotsalaisen Maxi Yatzyn vakiintuneet nimet (Kåk, Villa, Torn, Chans,
// stege). Erisnimet Superjatsi ja Jatsi pysyvät: brändi ja tavaramerkkipinta
// (jatsi-kanonisointi on parkissa, Yatzy-nimeä ei oteta käyttöön). Sarakkeet
// NER ja UPP ovat termejä, joten sääntötekstissä suuntasanat ovat "nedåt" ja
// "uppåt", eivät irralliset "ner"/"upp" (sama ansa kuin suomen alas/ylös).
import type { Strings } from "./fi";

export const sv: Strings = {
  title: "Superjatsi",
  tagline: "Tärningsspel för en spelare",

  // Setup
  newGame: "Nytt spel",
  diceCount: "Tärningar",
  fiveDice: "5 (Jatsi)",
  sixDice: "6 (Superjatsi)",
  diceHintMobile: "📱 På telefonen ryms 5 tärningar bäst på skärmen",
  nameLabel: "Namn",
  playerName: (i: number) => `Spelare ${i}`,
  start: "Starta spelet",

  // Header
  rules: "Regler",
  about: "Om spelet",
  close: "Stäng",
  newGameConfirm: "Starta ett nytt spel? Det pågående spelet går förlorat.",

  rulesLines: [
    {
      label: "Kolumner",
      text:
        "I = 1 kast, II = högst 2, III = högst 3 (fri radordning). " +
        "NER fylls uppifrån och nedåt, UPP nedifrån och uppåt (↓/↑ visar nästa rad).",
    },
    { label: "Kast", text: "3 per tur, tärningarna låses med ett klick." },
    {
      label: "Bonus",
      text: "övre delen når tröskeln 63 (5 tärningar) eller 76 (6 tärningar) → +50.",
    },
    {
      label: "Kombinationer",
      text:
        "nedre delens rader är Par, Två par, Tre par, Tretal, Fyrtal, Kåk, Liten stege, " +
        "Stor stege, Full stege, Villa, Torn, Chans, Jatsi och Superjatsi. " +
        "Fem av dem kräver sex tärningar.",
    },
    {
      label: "Strykning",
      text:
        "En inskrivning på 0 p offrar raden. Om ingen inskrivning är tillåten får öppna " +
        "rutor alltid strykas.",
    },
    { label: "Slutsumma", text: "summan av alla fem kolumner, alltså spelets resultat." },
  ],
  glossaryTitle: "Ordlista",
  glossaryHint: "Tryck på ett ord med streckad understrykning, så öppnas förklaringen under texten.",
  terms: [
    {
      term: "Kolumn",
      selitys:
        "Protokollet har fem spelkolumner: I, II, III, NER och UPP. Varje kolumn är ett " +
        "eget spel med egen bonus.",
      match: ["kolumn*"],
      kategoria: "Protokoll",
    },
    {
      term: "NER",
      selitys: "Kolumn som måste fyllas uppifrån och nedåt i ordning. Tre kast.",
      match: ["NER"],
      kategoria: "Protokoll",
      emoji: "↓",
    },
    {
      term: "UPP",
      selitys: "Kolumn som måste fyllas nedifrån och uppåt i ordning. Tre kast.",
      match: ["UPP"],
      kategoria: "Protokoll",
      emoji: "↑",
    },
    {
      term: "Övre delen",
      selitys:
        "Raderna Ettor, Tvåor, Treor, Fyror, Femmor och Sexor. Poängen är summan av de " +
        "matchande tärningarna.",
      match: ["övre del*"],
      kategoria: "Protokoll",
      esimerkki: "Tre femmor på raden Femmor = 15 p.",
    },
    {
      term: "Bonus",
      selitys:
        "När kolumnens övre del når tröskeln får kolumnen +50 p: tröskeln är 63 p med fem " +
        "tärningar och 76 p med sex. Tröskeln motsvarar i snitt tre (5 tärningar) eller " +
        "ungefär tre och en halv (6 tärningar) lika per rad.",
      match: ["bonus*"],
      kategoria: "Protokoll",
    },
    {
      term: "Slutsumma",
      selitys: "Summan av kolumnerna I, II, III, NER och UPP.",
      match: ["slutsumma*", "slutresultat*"],
      kategoria: "Protokoll",
    },
    {
      term: "Kast",
      selitys:
        "En tur har tre kast. Mellan kasten får tärningar låsas och frigöras fritt. " +
        "Kolumn I tar emot en inskrivning bara efter första kastet, kolumn II efter två.",
      match: ["kast*"],
      kategoria: "Tur",
    },
    {
      term: "Låsning",
      selitys:
        "En tärning låses med ett klick och deltar då inte i nästa kast. " +
        "Låsningen kan tas bort när som helst under samma tur.",
      match: ["lås*"],
      kategoria: "Tur",
    },
    {
      term: "Inskrivning",
      selitys:
        "Att skriva in resultatet i den valda rutan. Inskrivningen avslutar turen och " +
        "bekräftas separat: Bekräfta eller Ångra.",
      match: ["inskriv*", "skriv*"],
      kategoria: "Tur",
    },
    {
      term: "Strykning",
      selitys:
        "En öppen rad får skrivas in som noll. I kolumnerna NER och UPP träffar strykningen " +
        "nästa rad i ordningen. Om ingen inskrivning är tillåten får öppna rutor alltid " +
        "strykas, så spelet kan inte köra fast.",
      match: ["stryk*"],
      kategoria: "Tur",
    },
    {
      term: "Par",
      selitys: "Två lika ögon. Poängen är parets summa.",
      match: ["par"],
      kategoria: "Kombinationer",
      esimerkki: "5 5 → 10 p.",
    },
    {
      term: "Två par",
      selitys: "Två olika par. Poängen är båda parens summa.",
      match: ["två par"],
      kategoria: "Kombinationer",
      esimerkki: "6 6 och 3 3 → 18 p.",
    },
    {
      term: "Tre par",
      selitys: "Tre olika par, bara med sex tärningar. Poängen är summan av alla sex tärningarna.",
      match: ["tre par"],
      kategoria: "Kombinationer",
      esimerkki: "6 6 5 5 2 2 → 26 p.",
    },
    {
      term: "Tretal",
      selitys: "Tre lika ögon. Poängen är de tre tärningarnas summa.",
      match: ["tretal"],
      kategoria: "Kombinationer",
      esimerkki: "4 4 4 → 12 p.",
    },
    {
      term: "Fyrtal",
      selitys: "Fyra lika ögon. Poängen är de fyra tärningarnas summa.",
      match: ["fyrtal"],
      kategoria: "Kombinationer",
      esimerkki: "5 5 5 5 → 20 p.",
    },
    {
      term: "Kåk",
      selitys: "Tretal och ett par. Poängen är dessa fem tärningars summa.",
      match: ["kåk*"],
      kategoria: "Kombinationer",
      esimerkki: "3 3 3 och 5 5 → 19 p.",
    },
    {
      term: "Liten stege",
      selitys: "Ögonen 1-2-3-4-5. Fasta 15 p.",
      match: ["liten stege", "lilla stegen"],
      kategoria: "Kombinationer",
    },
    {
      term: "Stor stege",
      selitys: "Ögonen 2-3-4-5-6. Fasta 20 p.",
      match: ["stor stege", "stora stegen"],
      kategoria: "Kombinationer",
    },
    {
      term: "Full stege",
      selitys:
        "Ögonen 1-2-3-4-5-6, bara med sex tärningar. Fasta 25 p, det vill säga tärningarnas " +
        "summa 21 och 4 poäng i sällsynthetsbonus.",
      match: ["full stege", "fulla stegen"],
      kategoria: "Kombinationer",
    },
    {
      term: "Villa",
      selitys: "Två olika tretal, bara med sex tärningar. Poängen är summan av alla sex tärningarna.",
      match: ["villa*"],
      kategoria: "Kombinationer",
      esimerkki: "3 3 3 och 6 6 6 → 27 p.",
    },
    {
      term: "Torn",
      selitys:
        "Fyrtal och ett par med olika ögon, bara med sex tärningar. Poängen är summan av " +
        "alla sex tärningarna.",
      match: ["torn*"],
      kategoria: "Kombinationer",
      esimerkki: "2 2 2 2 och 6 6 → 20 p.",
    },
    {
      term: "Chans",
      selitys: "Vilken hand som helst. Poängen är summan av alla tärningar.",
      match: ["chans*"],
      kategoria: "Kombinationer",
    },
    {
      term: "Jatsi",
      selitys: "Fem lika ögon. Fasta 50 p.",
      match: ["jatsi"],
      kategoria: "Kombinationer",
    },
    {
      term: "Superjatsi",
      selitys: "Sex lika ögon, bara med sex tärningar. Fasta 100 p.",
      match: ["superjatsi"],
      kategoria: "Kombinationer",
    },
  ],

  // Asetukset
  settings: "Inställningar",
  language: "Språk",
  sounds: "Ljud",
  soundsOn: "På",
  soundsOff: "Av",
  soundTheme: "Ljudtema",
  soundThemeDefault: "Standard",
  soundThemeHornKantele: "Horn & kantele",
  diceTheme: "Tärningstema",
  diceThemeNames: {
    jalometalli: "Ädelmetall",
    puu: "Trä",
    norsunluu: "Elfenben",
    kivi: "Sten",
    yo: "Natt",
  },
  trySounds: "🔊 Prova ljuden",
  muteSounds: "🔇 Tysta ljuden",
  sfxLabels: {
    roll: "Kast",
    hold: "Låsning",
    release: "Frigöring",
    confirm: "Inskrivning",
    burn: "Strykning",
    cancel: "Ångra",
    celebrationGreat: "GREAT-kast",
    celebrationTop: "TOP-kast",
    superjatsi: "Superjatsi inskriven",
    bonus: "Bonus",
    win: "Vinst",
    record: "Nytt rekord",
  },

  // Status / turn
  turnOf: (name: string) => `Tur: ${name}`,
  rollsLeft: (n: number) => (n === 1 ? "1 kast kvar" : `${n} kast kvar`),
  rollToStart: "Slå för att börja turen",
  pickCell: "Välj en ruta för att skriva in resultatet",
  total: "Totalt",

  // Dice tray
  emptyDie: "tom tärning",
  roll: "Slå",
  rollAgain: "Slå igen",
  held: "Låst",
  confirm: "Bekräfta",
  cancel: "Ångra",
  confirmHint: "Bekräfta inskrivningen eller ångra",
  yes: "Ja",

  // Scorecard
  rows: {
    ones: { label: "Ettor" },
    twos: { label: "Tvåor" },
    threes: { label: "Treor" },
    fours: { label: "Fyror" },
    fives: { label: "Femmor" },
    sixes: { label: "Sexor" },
    pair: { label: "Par", description: "2 lika ögon" },
    twoPairs: { label: "Två par", description: "2 olika par" },
    threePairs: { label: "Tre par", description: "3 olika par (alla 6 tärningar)" },
    threeKind: { label: "Tretal", description: "3 lika ögon" },
    fourKind: { label: "Fyrtal", description: "4 lika ögon" },
    fullHouse: { label: "Kåk", description: "3 + 2 lika (två olika ögon)" },
    smallStraight: { label: "Liten stege", description: "1-2-3-4-5" },
    largeStraight: { label: "Stor stege", description: "2-3-4-5-6" },
    fullStraight: { label: "Full stege", description: "1-2-3-4-5-6 (alla 6 tärningar)" },
    huvila: { label: "Villa", description: "3 + 3 lika (två olika tretal)" },
    torni: { label: "Torn", description: "4 + 2 lika (två olika ögon)" },
    chance: { label: "Chans", description: "Vilken kombination som helst" },
    yatzy: { label: "Jatsi", description: "5 lika ögon" },
    superyatzy: { label: "Superjatsi", description: "6 lika ögon" },
  },
  colSum: "=",
  colLabel: {
    I: "I",
    II: "II",
    III: "III",
    ALAS: "NER",
    YLOS: "UPP",
  },
  colInfo: {
    I: "Högst 1 kast, fri radordning",
    II: "Högst 2 kast, fri radordning",
    III: "Högst 3 kast, fri radordning",
    ALAS: "Fylls uppifrån och nedåt i ordning",
    YLOS: "Fylls nedifrån och uppåt i ordning",
  },
  nextInOrder: "nästa rad att fylla",
  cellCommitLabel: (row: string, col: string, score: number) =>
    score > 0
      ? `Skriv in ${row}, kolumn ${col}: ${score} poäng`
      : `Stryk ${row}, kolumn ${col}`,
  maxScore: "Kategorins maxpoäng",
  bonus: "Bonus",
  bonusInfo: (threshold: number, value: number) =>
    `Kolumnens övre del sammanlagt minst ${threshold} p → +${value} p`,
  upperSum: "Övre summa",
  upperSumInfo: (k: string, threshold: number) =>
    `Grönt +/rött - visar avståndet till bonustakten: bonusen kräver i snitt ${k} lika per rad. ` +
    `Om talet är minst 0 på slutet nådde övre delen tröskeln ${threshold} p.`,
  lowerSum: "Nedre summa",
  grandTotal: "SLUTRESULTAT",

  // Game over
  gameOver: "Spelet är slut",
  soloResult: (score: number) => `Resultat: ${score} poäng`,
  playAgain: "Spela igen",
  backToMenu: "Till menyn",
  downloadImage: "Ladda ner bild av resultatet",

  // Highscores
  highscores: "Rekord",
  highscoresFor: (n: number) => `Rekord · ${n} tärningar`,
  diceTab: (n: number) => `${n} tärningar`,
  noHighscores: "Inga rekord ännu: spela ett spel till slutet.",
  clearHighscores: "Rensa rekord och medelvärden",
  clearHighscoresConfirm: "Rensa alla rekord och medelvärden? Det går inte att ångra.",

  // Keskiarvot
  averages: "Medelvärden",
  avgValue: (v: number) => v.toFixed(1).replace(".", ","),
  gamesCount: (n: number) => `${n} spel`,
  recentAvg: (n: number) => `senaste ${n}:`,

  // Tietoja
  aboutTitle: "Om Superjatsi",
  aboutParas: [
    "Superjatsi är ett tärningsspel. Du slår tärningar. Du skriver in resultaten i protokollets rutor.",
    "Du spelar ensam och i din egen takt. Ett spel med sex tärningar kan ta " +
      "20-25 minuter. Du försöker få så många poäng som möjligt.",
    "Spelet fungerar med tangentbord, mus och pekskärm.",
    "Spelet samlar inget om dig. Inget konto, ingen reklam. Dina rekord sparas " +
      "bara i din egen webbläsare.",
    "Spelet är gratis och gjort för att delas. Du kan skicka respons. Du kan också " +
      "bjuda upphovsmannen på kaffe.",
  ],
  aboutFeedback: "✉ Skicka respons",
  aboutKofi: "☕ Stöd på Ko-fi",
  otherGamesTitle: "Andra spel",
  otherGamesIntro: "Av samma upphovsman. Alla gratis och utan reklam.",
  otherGames: [
    { name: "Itu", url: "https://tommi-itu.vercel.app", blurb: "ordspel på finska" },
    { name: "Jako", url: "https://tommi-jako.vercel.app", blurb: "nio kortspel" },
  ],
  installTitle: "Lägg till Superjatsi på startskärmen 📲",
  installIntro:
    "Lägg till Superjatsi på telefonens startskärm eller datorns skrivbord, så öppnas " +
    "det från en egen ikon som en app, utan webbläsarens fält. Ett spel som öppnats " +
    "en gång fungerar också utan nätverk.",
  installGroups: [
    {
      title: "📱 Telefon och surfplatta",
      rows: [
        ["Chrome · Brave · Edge · Opera (Android)", 'Meny ⋮ → "Lägg till på startskärmen" eller "Installera app".'],
        ["Samsung Internet", 'Meny ≡ → "Lägg till sida på" → "Startskärm".'],
        ["Firefox (Android)", 'Meny ⋮ → "Lägg till på startskärmen".'],
        ["Safari (iPhone/iPad)", 'Dela-knappen → "Lägg till på hemskärmen".'],
        ["Chrome och andra (iPhone/iPad)", 'Dela-knappen → "Lägg till på hemskärmen" (iOS tillåter installation bara från Dela-menyn).'],
      ],
    },
    {
      title: "💻 Dator",
      rows: [
        ["Chrome · Edge · Brave · Opera · Vivaldi", 'Installationsikonen ⊕ i adressfältets högra kant → "Installera".'],
        ["Safari (Mac)", 'Arkiv-menyn → "Lägg till i Dock".'],
        ["Firefox (dator)", "Stöder inte installation. Lägg till ett bokmärke för snabb åtkomst."],
      ],
    },
  ],
  version: (v: string, date: string) => `Superjatsi v${v} · ${date}`,

  // Muutosloki: data on vain suomeksi (Jakon linjaus 3.7.2026, Superjatsin 0.18.0),
  // joten esittelyrivi kertoo sen ruotsiksi eikä lupaa käännöstä.
  changelog: "Ändringslogg",
  changelogIntro: "Vad som ändrats i spelet och varför. Nyast först. Loggen finns bara på finska.",
  changelogVersion: (v: string, date: string) => `v${v} · ${date}`,
  backToAbout: "Tillbaka",
};
