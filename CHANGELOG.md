# Muutosloki

Kaikki merkittävät muutokset kirjataan tähän. Muoto noudattaa löyhästi
[Keep a Changelog](https://keepachangelog.com/) -periaatetta. Versiointi: [SemVer](https://semver.org/).

## [Julkaisematon]

_(Ei avoimia muutoksia.)_

## [0.1.0] – 2026-06-05

Ensimmäinen julkaisu. Pelattavissa: https://tommi-superjatsi.vercel.app

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
