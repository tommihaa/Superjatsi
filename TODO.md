# Tulossa / Backlog

Suunnitellut ja harkinnassa olevat asiat. Tehdyt siirtyvät [CHANGELOG.md](CHANGELOG.md):hen.

## UI / UX
- [ ] Keskiarvoseuranta (idea 4.7, esikuva ystävän VBScript-jatsi) — ODOTTAA:
      tehdään siinä vaiheessa kun peliä aletaan jakaa muille (Tommin päätös 4.7).
      Ennätyslistan
      rinnalle pelaajakohtainen keskiarvo, johon jokainen aloitettu peli lasketaan.
      Kesken jätetty peli painaa keskiarvoa alas → kannustaa pelaamaan loppuun ja
      yrittämään parhaansa (top 10 mittaa vain huippuja, keskiarvo johdonmukaisuutta).
      Avoimet designkysymykset: keskeytyksen arvo (0 vai siihen asti kertynyt summa),
      per nimi + variantti, koko historia vai liukuva ikkuna, yksinpeli vs monipeli.
- [ ] Äänet (heitto, lukitus, kirjaus, voitto) — kevyt SFX-moduuli.
- [ ] Asetukset-overlay: ratasnappi palautetaan headeriin kun sisältöä on (esim. äänet
      päälle/pois, noppateema). Nappi poistettu 0.4.0:ssa placeholderina.
- [ ] Sääntö-overlayn laajennus / pelin sisäinen muutosloki (kuten Jako-projektissa).

## Tekninen
- [ ] i18n: tekstit ovat keskitetty `strings.ts`:ään — kielituki myöhemmin.
- [ ] Mahdollinen pelin sisäinen versionäyttö (`__APP_VERSION__`) buildista.

## Valmis (ks. CHANGELOG)
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
