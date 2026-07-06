# Tulossa / Backlog

Suunnitellut ja harkinnassa olevat asiat. Tehdyt siirtyvät [CHANGELOG.md](CHANGELOG.md):hen.

## UI / UX
- [ ] Sääntö-overlayn laajennus / pelin sisäinen muutosloki (kuten Jako-projektissa).
- [ ] Asetukset-overlayn laajennus: noppateema (ääniteema toteutettu 0.10.0:ssa).

## Tekninen
- [ ] i18n: tekstit ovat keskitetty `strings.ts`:ään — kielituki myöhemmin.
- [ ] Mahdollinen pelin sisäinen versionäyttö (`__APP_VERSION__`) buildista.

## Valmis (ks. CHANGELOG)
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
      rinnakkain; kaikki pelit ja pelaajat mukaan — designpäätökset 5.7).
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
