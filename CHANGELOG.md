# Muutosloki

Kaikki merkittävät muutokset kirjataan tähän. Muoto noudattaa löyhästi
[Keep a Changelog](https://keepachangelog.com/) -periaatetta. Versiointi: [SemVer](https://semver.org/).

## [0.3.0] – 2026-06-10

### Lisätty
- **Aloitusnäytön muisti**: pelaajien nimet ja pelaajamäärä tallentuvat localStorageen
  (`domain/prefs.ts`, SetupPrefs) ja esitäytetään seuraavalla kerralla. 5 uutta testiä (yht. 56).

### Muutettu
- Heitettyjen noppien pöytäalue kavennettu puoleen tarjottimen leveydestä (keskitetty).

## [0.2.1] – 2026-06-10

### Muutettu
- **Noppatarjotin kahteen vyöhykkeeseen**: heitetyt nopat asettuvat hajalleen omalle
  "pöytäalueelleen" (deterministiset ankkuripaikat + arvosta riippuva siirtymä ja kierto),
  lukitut nopat siirtyvät suoraan riviin pöydän alle. Aiemmin kaikki olivat samassa rivissä.

## [0.2.0] – 2026-06-10

### Lisätty
- **Ennätykset (top 10)**: pelin loppusummat tallentuvat paikalliseen ennätyslistaan
  (localStorage, ei mitään verkkoon). Lista per variantti (5 ja 6 noppaa erikseen),
  merkintä = nimi + pisteet + päivä. Uudet ennätykset korostetaan ★:llä loppunäytössä.
  Headerin 🏆-nappi avaa listan kesken pelin; listan voi tyhjentää (vahvistuskysymys).
- 9 uutta testiä (`highscores.test.ts`) — yhteensä 51.

## [0.1.0] – 2026-06-05

Ensimmäinen julkaisu. Pelattavissa: https://tommi-taysi.vercel.app

### Lisätty
- **Pelimoottori (domain)**: nopat, pisteytys, sarakerajoitteet (strategiakuvio:
  `ThrowLimitColumn` I/II/III, `OrderedColumn` ALAS/YLÖS), tulokortti yläbonuksineen
  (kynnys 63 / 84, +50) ja juokseva poikkeama, `GameState`-vuorologiikka.
- **Variantit**: 5 nopan jatsi ja 6 nopan Superjatsi, valinta aloitusnäytöllä.
- **Pelaajat**: 1–6 hot-seat (pass-and-play).
- **Kategoriat**: yläosa Ykköset–Kutoset; alaosa Pari, Kaksi paria, Kolme paria (6 noppaa),
  Kolme/Neljä samaa, Täyskäsi, Pieni suora (15), Suuri suora (20), Täyssuora (21, 6 noppaa),
  Sattuma, Jatsi (50), Superjatsi (100, 6 noppaa).
- **Kaksivaiheinen kirjaus**: ruudun klikkaus = väliaikainen, Vahvista siirtää vuoron, Peru peruu.
- **Polttaminen**: minkä tahansa avoimen rivin saa merkitä nollaksi.
- **UI** (Web Components): aloitusnäyttö, header (i-info + asetukset), vuorotila,
  noppatarjotin, matriisitulokortti. Heitetyt nopat "sekamelskana", lukitut suorassa rivissä.
- **Responsiivinen layout**: pysty = pino, vaaka (puhelin) = kaksipalstainen (ohjaimet + vierivä tulokortti).
- **Persistointi**: kesken jäänyt peli tallentuu localStorageen ja palautuu (turvallinen lataus).
- **Testit**: 42 Vitest-testiä (pisteytys, sarakkeet, tulokortti, peli, tallennus).
- **Julkaisu**: GitHub-repo + Vercel-tuotanto + GitHub-auto-deploy (push → deploy).

### Tekniikka
- Vite + TypeScript + Web Components, ei Reactia/raskaita kirjastoja. Tuotantobundle ~7 kB gzip.
