# Muutosloki

Kaikki merkittävät muutokset kirjataan tähän. Muoto noudattaa löyhästi
[Keep a Changelog](https://keepachangelog.com/) -periaatetta. Versiointi: [SemVer](https://semver.org/).

## [0.4.0] – 2026-07-02

### Lisätty
- **Jalometallinopat**: nopan sävy tummasta puusta kultaan silmäluvun mukaan
  (`.die.v1`–`.v6`), pipit vaaleat tummilla sävyillä ja tummat vaaleilla. Lukituksen
  kultareuna säilyy erottuvana (määrittelyjärjestys varmistettu).
- **ALAS/YLÖS-indikaattori**: järjestyksen seuraava täytettävä rivi näkyy nuolena
  (↓/↑) jo ennen heittoa — vuoron voi suunnitella etukäteen.
- **Uusi peli -varmistus**: ↺ kysyy vahvistuksen kun peli on kesken (symmetrisesti
  ennätysten tyhjennyksen kanssa). Päättyneen pelin jälkeen ei kysytä.
- Projektin `CLAUDE.md` (arkkitehtuuri- ja työtapaohjeet agenttisessioille).

### Muutettu
- **Poltto erottuu kirjauksesta**: 0 pisteen klikattava solu piirretään punertavana ja
  vaisumpana, pisteellinen vihreänä kuten ennen. Sääntö-overlayn poltto-kohta päivitetty.
- **Sarakehimmennys**: sarake jonka heittoraja on ylittynyt tällä vuorolla (I 2. heiton
  jälkeen, I+II 3:n) himmennetään otsikkoa myöten — näkee heti mitä heitto maksoi.
- **Yksinpelin loppuruutu**: "Voittaja: X" → "Tulos: N pistettä".
- ⚙ Asetukset-nappi piilotettu kunnes asetuksia oikeasti on (oli "tulossa"-placeholder).

## [0.3.1] – 2026-07-02

### Korjattu
- **Soft-lock**: peli saattoi jumittua pysyvästi, jos avoinna oli enää vain I/II-sarakkeen
  soluja ja heittoraja ylittyi (ei kirjattavaa, ei heittoja — tila myös persistoitui).
  Nyt avoimet solut saa tällöin polttaa heittorajasta riippumatta; pelaajalla on aina
  vähintään yksi laillinen siirto (anti-jumi-sääntö kirjattu SUPERJATSI.md:hen).
- **Viimeinen kirjaus ohitti Vahvista/Peru-vaiheen**: pelin viimeisen solun klikkaus
  päätti pelin ja kirjasi ennätyksen heti ilman vahvistusmahdollisuutta. Nyt `isOver()`
  ei ole tosi pending-tilassa → myös viimeinen kirjaus vahvistetaan tai perutaan.
- **Ennätyspäivä oli UTC-päivä**: `toISOString()` kirjasi Suomessa klo 00–03 pelatut
  pelit edelliselle päivälle. Nyt paikallinen päivä (`localToday`).
- **Heitetyt nopat saattoivat mennä päällekkäin** pöydällä (%-ankkurit vs. px-kokoiset
  nopat kapealla pöydällä). Pöytä on nyt 3-palstainen gridi: jokainen noppa omassa
  ruudussaan + pieni deterministinen kierto/siirtymä ("heitetty" ilme säilyy), lukitun
  nopan tilalle jää näkymätön haamupaikka → muut nopat eivät liiku lukittaessa.
- 5 uutta testiä (yht. 61); package.json-versio synkattu muutoslokiin.

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
