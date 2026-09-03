# Tulossa / Backlog

Suunnitellut ja harkinnassa olevat asiat. Tehdyt siirtyvät [CHANGELOG.md](CHANGELOG.md):hen.

## Tekninen
- [ ] Staattisen index.html:n kieli, päätettävä (3.9.2026): meta-kuvaus ja `lang="fi"` ovat
      suomeksi, koska hakukone ja jakoesikatselu eivät aja `setLang`ia. Pelin oma oletus
      tuntemattomalle selainkielelle on englanti, joten staattinen pinta ja peli sanovat
      vierailijalle eri asian. Vaihtoehto: englanti staattiseksi oletukseksi ja suomi
      valinnaksi.
- [ ] Kielivalikoima ei ole lukittu (Tommin päätös 3.9.2026): uusi kieli on yksi
      `locales/xx.ts`, LANGS-rivi, LANG_NAMES-nimi ja detectLang-haara; tsc kertoo puutteet.
      Ei siis Jakon kaltaista parkkia, mutta ei myöskään oma-aloitteista lisäystä.
- [ ] Erisnimet käännöksissä, päätettävä erikseen (3.9.2026): sv ja en käyttävät nyt nimiä
      Jatsi ja Superjatsi. Vaihtoehto Yatzy ja Maxi Yatzy kytkeytyy parkissa olevaan
      jatsi-kanonisointiin (`Kaanon/HAUTAKIVET.md`, tavaramerkkisyy), joten päätös koskee
      molempia yhtä aikaa.

## Valmis (ks. CHANGELOG)
- [x] 0.21.0: kielituki (elävä `T`, `locales/fi.ts` totuuden lähteenä, `Strings`-tyyppi tekee
      pariteetin) sekä ruotsi ja englanti; kielivalinta asetuksiin ja aloitusnäytölle,
      rivinimet domainista localeen. Natiivitarkistus puuttuu; manifest ja meta-kuvaus
      ovat suomeksi.
- [x] 0.20.0: kuuden nopan yläbonus 84/+100 → 76/+50 mittauksen perusteella
      (`docs/ylabonus-mittaus.md`), poikkeaman rivitahti pyöristettynä (summa = kynnys).
- [x] 0.19.0: noppateema asetuksiin (Jalometalli oletuksena + Puu, Norsunluu, Kivi ja Yö;
      sama valitsinkuvio kuin ääniteemalla 0.10.0:ssa, valinta muistetaan laitteella;
      lisäysresepti skillissä `noppateema`).
- [x] 0.18.0: pelin sisäinen muutosloki Tietoja-näkymään (data pelaajan kielellä,
      `src/ui/changelog.ts`). Versionäyttö buildista oli jo tehty 0.16.0:ssa
      (versioleima aloitusnäytöllä ja Tietoja-näkymässä); TODO-rivi oli jäänyt auki.
- [x] 0.17.0: termimoduuli sääntöikkunaan (moottori + sääntöteksti dataksi + renderöijä +
      23 testiä), 24 termiä kolmessa kategoriassa ja sanasto-listanäkymä.
- [x] 0.13.0: torvi & kantele -teema synteesistä oikeisiin ääninäytteisiin (CC0 kantele +
      vapaa käyrätorvinäyte, matala/korkea ankkuri + pitch-shift).
- [x] 0.12.0: aloitusnäyttö olettaa 5 noppaa kapealla näytöllä (≤560px) + suositusvihje;
      tallennettu valinta ja 6 nopan valinta säilyvät (UI-oletus, ei sääntömuutosta).
- [x] 0.11.0: efektit.html pysyväksi kehitystyökaluksi (äänet+visuaalit+teema+
      pikamykistys) + "Kokeile ääniä" -paneeli asetuksiin (sama kuvio Jakoon/Ituun).
- [x] 0.10.0: ääniteema Torvi & kantele (kantele()-nypäisysynteesi + teemavalinta
      asetuksiin, taaksepäinyhteensopiva SoundPrefs; sama kuvio Jakoon ja Ituun).
- [x] 0.9.0: äänet (Web Audio -synteesi, ei tiedostoja: ydinsilmukka hiljaisena,
      merkkihetket näyttävinä, poltolle oma matala sävy) + asetukset-overlay
      ratasnappeineen (äänet päälle/pois, persistoituu).
- [x] 0.8.0: keskiarvoseuranta (per nimi + variantti; keskeytys kirjautuu
      kertyneellä summalla; koko historia + viimeisten 20 liukuva keskiarvo
      rinnakkain; kaikki pelit ja pelaajat mukaan, designpäätökset 5.7).
- [x] 0.7.0: loppunäytön tulostaulukko kaikille pelaajille (voittaja korostettuna,
      tasapisteet jakavat sijan) ja näppäimistösaavutettavuus (solut role="button"
      + tabindex + Enter/Space, focus-visible-tyylit, fokus Vahvista-nappiin
      kirjauksen jälkeen).
- [x] 0.6.0: vuoronvaihtoruutu pass-and-playhin ("Anna laite pelaajalle X" + Aloita
      vuoro) ja edellisen siirron kuittaus samassa ruudussa (kirjaus/poltto);
      hover-selitteet Bonus- ja Yläsumma-riveille; kaksiportainen tähtimyrsky
      erinomaisesta heitosta (rajat kalibroitu simulaatiolla).
- [x] 0.5.0: yksinpelin hionta: sarakeotsikoiden tooltipit, heittoanimaatio,
      kiinteä Vahvista/Peru-alapalkki pystymobiilissa, teemadialogit window.confirmin
      tilalle, ennätysten 5/6-välilehdet, sticky-otsikkorivi vaakamobiilissa.
- [x] 0.4.2: tarjottimen layout-hyppy korjattu, ennätykset näkyviin aloitusnäytölle,
      dev-SW-cache-bugi korjattu (SW vain tuotannossa), poltto-erotteluväri poistettu
      (vihreä vain pisteelliselle), "Lataa kuva tuloksesta" -painike lopputulokseen,
      uudet maxi-yhdistelmät Huvila + Torni (6 nopan variantti).
- [x] 0.4.1: PWA-asennettavuus (manifest + service worker + ikonit).
- [x] 0.4.0: poltto punertavana, ALAS/YLÖS-nuoli-indikaattori, sarakehimmennys,
      Uusi peli -varmistus, yksinpelin "Tulos: N", jalometallinopat, CLAUDE.md.
- [x] 0.3.1: soft-lock-korjaus (anti-jumi-poltto), viimeisen kirjauksen vahvistus,
      paikallinen ennätyspäivä, noppien gridi-pöytä (ei päällekkäisyyttä).
- [x] Domain + 42 testiä, UI, 5/6 nopan variantti, kaksivaihekirjaus, responsiivinen layout,
      localStorage, GitHub + Vercel-auto-deploy, URL https://tommi-taysi.vercel.app.
- [x] Ennätykset top 10 per variantti (0.2.0): localStorage, 🏆-nappi, ★-korostus loppunäytössä.
