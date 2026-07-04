# Tulossa / Backlog

Suunnitellut ja harkinnassa olevat asiat. Tehdyt siirtyvät [CHANGELOG.md](CHANGELOG.md):hen.

## UI / UX
- [ ] Vuoronvaihtoruutu pass-and-playhin: "Anna laite pelaajalle X" -väliruutu
      kirjauksen vahvistuksen jälkeen (vrt. Jaon TurnPrompt) — estää vahinkoklikkaukset
      ja antaa edelliselle pelaajalle hetken nähdä kirjauksensa.
- [ ] Edellisen siirron kuittaus vuoronvaihdon yhteydessä (esim. "Tommi kirjasi
      Talo 28 p sarakkeeseen II") — luonteva paikka vuoronvaihtoruudussa.
- [ ] Loppunäytön tulostaulukko kaikille pelaajille (nyt voittajabanneri).
- [ ] Näppäimistösaavutettavuus: tulokortin klikattavat solut ovat `<td>`-elementtejä
      ilman tabindexiä/roolia — role="button" + tabindex + Enter/Space, sekä
      `:focus-visible`-tyylit napeille ja nopille.
- [ ] Äänet (heitto, lukitus, kirjaus, voitto) — kevyt SFX-moduuli.
- [ ] Asetukset-overlay: ratasnappi palautetaan headeriin kun sisältöä on (esim. äänet
      päälle/pois, noppateema). Nappi poistettu 0.4.0:ssa placeholderina.
- [ ] Sääntö-overlayn laajennus / pelin sisäinen muutosloki (kuten Jako-projektissa).

## Tekninen
- [ ] i18n: tekstit ovat keskitetty `strings.ts`:ään — kielituki myöhemmin.
- [ ] Mahdollinen pelin sisäinen versionäyttö (`__APP_VERSION__`) buildista.

## Valmis (ks. CHANGELOG)
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
