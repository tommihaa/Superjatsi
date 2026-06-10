# Tulossa / Backlog

Suunnitellut ja harkinnassa olevat asiat. Tehdyt siirtyvät [CHANGELOG.md](CHANGELOG.md):hen.

## Harkinnassa (pelisäännöt)
- [ ] Maxi-yhdistelmät: Kolmoispari jo mukana — lisäksi mahdollisesti **Torni** (kuusiluku)
      ja **3+3-täyskäsi**, jos halutaan laajentaa alaosaa.
- [ ] Vapaaehtoisen polton selkeämpi ele myös nollasta poikkeaville riveille (nyt poltto =
      klikkaa 0-arvoista ruutua).

## UI / UX
- [ ] Äänet (heitto, lukitus, kirjaus, voitto) — kevyt SFX-moduuli.
- [ ] Asetukset-overlayn (ratasnappi) sisältö: esim. äänet päälle/pois, teema.
- [ ] Sääntö-overlayn laajennus / pelin sisäinen muutosloki (kuten Jako-projektissa).
- [ ] Loppunäytön tulostaulukko kaikille pelaajille (nyt voittajabanneri).

## Tekninen
- [ ] i18n: tekstit ovat keskitetty `strings.ts`:ään — kielituki myöhemmin.
- [ ] Mahdollinen pelin sisäinen versionäyttö (`__APP_VERSION__`) buildista.

## Valmis (ks. CHANGELOG)
- [x] Domain + 42 testiä, UI, 5/6 nopan variantti, kaksivaihekirjaus, responsiivinen layout,
      localStorage, GitHub + Vercel-auto-deploy, URL https://tommi-superjatsi.vercel.app.
- [x] Ennätykset top 10 per variantti (0.2.0): localStorage, 🏆-nappi, ★-korostus loppunäytössä.
