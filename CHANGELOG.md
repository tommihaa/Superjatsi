# Muutosloki

Kaikki merkittävät muutokset kirjataan tähän. Muoto noudattaa löyhästi
[Keep a Changelog](https://keepachangelog.com/) -periaatetta. Versiointi: [SemVer](https://semver.org/).

## [0.7.0] – 2026-07-04

### Lisätty
- **Loppunäytön tulostaulukko**: monipelin päätyttyä kaikki pelaajat listataan
  pistejärjestyksessä (sija, nimi, lopputulos), voittajarivi(t) korostettuna.
  Tasapisteet jakavat saman sijan. Yksinpelissä näytetään edelleen vain
  "Tulos: N pistettä".
- **Näppäimistösaavutettavuus**: tulokortin kirjattavat solut ovat nyt
  fokusoitavia (`role="button"` + `tabindex`) ja aktivoitavissa Enterillä tai
  välilyönnillä; saavutettavuusnimi kertoo rivin, sarakkeen ja pisteet
  ("Kirjaa Sattuma, sarake III: 22 pistettä" / poltossa "Polta ..."). Napeille,
  nopille ja soluille näkyvä `:focus-visible`-fokusrengas (accent-väri).
  Kirjauksen jälkeen fokus siirtyy Vahvista-nappiin, jottei se katoa kortin
  uudelleenpiirrossa.

## [0.6.0] – 2026-07-04

### Lisätty
- **Vuoronvaihtoruutu pass-and-playhin**: monipelissä kirjauksen vahvistuksen
  jälkeen näytetään väliruutu "Anna laite pelaajalle X" ja Aloita vuoro -nappi.
  Estää vahinkoklikkaukset laitteen vaihtaessa kättä. Yksinpelissä ruutua ei näytetä.
- **Edellisen siirron kuittaus vuoronvaihtoruudussa**: esim. "Tommi kirjasi Talo
  28 p sarakkeeseen II" tai poltossa "Tommi poltti rivin Talo sarakkeessa I".
  Domain tallettaa viimeisimmän vahvistetun kirjauksen (`lastMove`, transientti:
  ei persistoidu, kuittaus näkyy vain heti vahvistuksen jälkeen).
- **Bonusrivin hover-selite**: kertoo variantin mukaisen ehdon, esim.
  "Sarakkeen yläosa yhteensä vähintään 84 p → +100 p". Kynnys ja arvo tulevat
  domainista (Scorecard), eivät kovakoodattuna UI:hin.
- **Yläsumman hover-selite**: selittää +/- -tahtiluvun (ero bonustahtiin,
  keskimäärin 3 tai 4 samaa per rivi variantin mukaan).
- **Tähtimyrsky erinomaisesta heitosta, kaksi porrasta.** Rajat kalibroitu
  simulaatiolla (300 yksinpeliä, ~74 000 heittoa) niin ettei pelistä tule
  jatkuvaa myrskyshowta; porras määräytyy käden harvinaisuuden, ei kombon
  nimen mukaan:
  - **Huippu** (tähtisade + ★-solujen hehku, ~6 krt/yksinpeli): Täyssuora,
    Jatsi, Superjatsi, Huvila, Torni sekä maksimeina Täyskäsi (666 55),
    Neljä samaa (6666) ja Kolme paria (66 55 44).
  - **Erinomainen** (pelkkä hehku, ~10 krt/yksinpeli): Pieni tai Suuri suora,
    Kolme paria, yläbonuksen varmistava kirjaus tai vähintään 3 ★-maksimiriviä
    samassa heitossa. Hehku kohdistuu juhlan aiheuttaneisiin soluihin.
  - Laukeaa vain heitosta (kerran per heitto), väri on ★-merkin accent (kulta
    pysyy lukituksen värinä), `prefers-reduced-motion` kytkee efektin pois.

### Muutettu
- Sarakeotsikoiden tekstit (I/II/III/ALAS/YLÖS) keskitetty `strings.ts`:ään
  (aiemmin kovakoodattu tulokorttikomponenttiin).

## [0.5.0] – 2026-07-04

### Lisätty
- **Kategorioiden hover-selitteet**: alaosan rivien nimillä (Pari, Huvila, Torni,
  suorat, ym.) on nyt hover/title-tooltip joka kertoo lyhyesti kombivaatimuksen.
- **Maksimipisteapuri**: kirjattavissa oleva ruutu saa pienen tähtimerkinnän kun
  ehdotuspisteet ovat kategorian teoreettinen maksimi — erityisen näkyvä suorilla,
  joissa ainoa mahdollinen pistemäärä on aina tämä maksimi.
- **Sarakeotsikoiden selitteet**: I/II/III/ALAS/YLÖS-otsikoilla on nyt
  hover/title-tooltip joka kertoo sarakkeen heittorajan tai täyttöjärjestyksen.
- **Heittoanimaatio**: heitetyt nopat "laskeutuvat" pöytään lyhyellä pyörähdyksellä
  ja pienellä porrastuksella. Lukituksen toggle ei käynnistä animaatiota, ja
  `prefers-reduced-motion` kytkee sen pois.
- **Ennätysoverlayn varianttivälilehdet**: 5 ja 6 nopan listat ovat nyt molemmat
  katsottavissa välilehdistä, myös aloitusnäytön 🏆-napista.

### Muutettu
- **Varmistukset teeman mukaisiksi**: Uusi peli- ja ennätysten tyhjennys
  -varmistukset käyttävät nyt pelin omaa overlay-dialogia selaimen
  `window.confirm`in sijaan.
- **Vahvista/Peru kiinteänä alapalkkina pystymobiilissa**: vahvistusnapit pysyvät
  ruudun alalaidassa käden ulottuvilla, vaikka noppatarjotin olisi vierinyt
  näkyvistä pending-solua valittaessa. Tarjottimen korkeus ei muutu (vakiokorkuinen
  actions-slot).
- **Sarakeotsikot pysyvät näkyvissä vaakamobiilissa**: tulokortin otsikkorivi on
  sticky vieritettäessä (border-collapse → separate vain tässä leiskassa, jotta
  sticky toimii ilman reunojen tuplaantumista).
- **Nimi palautettu Täysi → Superjatsi**: brändi, otsikko, manifest ja URL
  (https://tommi-superjatsi.vercel.app) vaihdettu takaisin. Nimitörmäys pistekategorian
  "Superjatsi" (6 samaa) kanssa hyväksytty tietoisesti — ei muutosta pelilogiikkaan.
- **Täyssuora 21 → 25** (+4 harvinaisuusbonusta): kuuden nopan täyssuora on niin
  harvinainen, että se palkitaan nyt erikseen.
- **Yläbonus 6 nopalla 50 → 100**: kynnyksen (84) täyttyessä 6 nopan variantissa
  bonus on nyt 100 (5 nopan 63/+50-sääntö ennallaan).
- **Heitä/Vahvista/Peru-napit venytetty tulokortin levyisiksi**: ohjaimet ja
  pisteruudukko rajautuvat nyt samaan reunaan sen sijaan että napit olisivat
  kapeampia ja keskitettyjä.

### Korjattu
- **Puuttuva `main`-landmark** (Lighthouse-accessibility-huomautus): `sj-app`:in
  sisältö kääritään nyt `<main>`-elementtiin sekä setup- että peli-/game-over-näkymässä.

## [0.4.2] – 2026-07-02

### Korjattu
- **Tarjottimen hyppiminen heittojen välissä**: noppa-alue ("pöytä") ja lukkorivi
  renderöidään nyt aina (vaikka tyhjänä) reservoidulla korkeudella, eivät enää
  mountaudu/unmountaudu heiton mukaan — pelialue ei enää hyppää ensimmäisen heiton
  tai "kaikki lukossa" -tilanteen kohdalla. Jäljelle jäänyt pienempi hyppy (pöydän
  `min-height` oli 12 px liian pieni todelliseen 2-rivin noppasisältöön nähden,
  150→162 px) korjattu myös — Heitä uudelleen- ja Vahvista-napit pysyvät nyt
  täsmälleen samalla korkeudella heiton yli.
- **Ennätykset eivät näkyneet aloitusnäytöllä**: `sj-header` (ja sen 🏆-nappi)
  puuttui kokonaan aloitusnäytöltä, joten ennätyksiä pääsi katsomaan vain kesken
  pelin tai pelin päätyttyä. Aloitusnäytölle lisätty oma 🏆-nappi.
- **PWA-service worker jäi tarjoilemaan vanhaa devissä**: cache-first SW rekisteröityi
  myös `npm run dev` -ympäristössä ja jätti vanhat `/src/*`-lähdetiedostot välimuistiin
  jokaisen koodimuutoksen yli. SW rekisteröidään nyt vain tuotannossa (ei localhost).

### Lisätty
- **"Lataa kuva tuloksesta"** peli päättyessä: Canvas-piirretty PNG-yhteenveto
  (pelaajat paremmuusjärjestyksessä + loppusumma), ei ulkoisia riippuvuuksia
  (`src/ui/recap-image.ts`). Ei tallennu pysyvästi ennätyslistalle — vain
  ladattavissa/jaettavissa pelin päättyessä.
- **Kaksi uutta maxi-yhdistelmää** (vain 6 nopan Superjatsi-variantti), sijoitettu
  Täyssuoran ja Sattuman väliin (kanoninen Maxi-Yatzy-järjestys): **Huvila**
  (2 eri kolmikkoa, pisteet = kaikkien 6 nopan summa) ja **Torni** (nelikkö + eri
  silmäluvun pari, pisteet = kaikkien 6 nopan summa). Sopimus päivitetty ensin
  `SUPERJATSI.md`:hen.

### Muutettu
- **Poltto-erotteluväri poistettu**: 0 p:n kirjattavissa olevat solut (ml. anti-jumi-poltto)
  ovat yhä klikattavia, mutta eivät enää saa mitään korostusväriä eikä numerotekstiä
  (ei vihreää eikä vanhaa punertavaa `.cell.avail.burn`-tyyliä). Vain pisteellinen solu
  (`score > 0`) merkitään vihreällä ja näyttää ehdotuspisteet — selkeyspäätös: yksi
  väri erottuu yksiselitteisesti "tästä saa pisteitä".

## [0.4.1] – 2026-07-02

### Lisätty
- **PWA-asennettavuus**: `manifest.webmanifest` + service worker (`public/sw.js`,
  network-first navigointi / cache-first assetit, offline-appishell) + noppa-aiheiset
  ikonit (`build/gen_icons.mjs`, 192/512/512-maskable). Asennettavissa työpöydälle ja
  mobiiliin, toimii ilman verkkoyhteyttä lataamisen jälkeen.

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
