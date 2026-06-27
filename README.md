# Täysi 🎲

Web-pohjainen **maxi-jatsi** (5 tai 6 noppaa) paikalliseen pass-and-play-moninpeliin.
Puhdas, kirjastoton toteutus: **Vite + TypeScript + Web Components**. Ei Reactia, ei
raskaita riippuvuuksia, ei tilejä eikä tietokantaa.

- **Pelaa:** https://tommi-taysi.vercel.app
- **Repo:** https://github.com/tommihaa/Superjatsi (yksityinen)
- **Muutosloki:** [CHANGELOG.md](CHANGELOG.md) · **Tulossa:** [TODO.md](TODO.md) · **Säännöt:** [SUPERJATSI.md](SUPERJATSI.md)

## Idea

Pelin ydin on **matriisitulokortti**, jossa jokaisella sarakkeella on oma rajoite:

| Sarake | Rajoite |
|---|---|
| I | kirjaus vain 1. heiton jälkeen |
| II | enintään 2 heittoa |
| III | enintään 3 heittoa |
| ALAS | pakko täyttää ylhäältä alas |
| YLÖS | pakko täyttää alhaalta ylös |

Loppusumma = sarakkeiden summa, suurin voittaa. Tarkat säännöt: [SUPERJATSI.md](SUPERJATSI.md).

## Ominaisuudet

- **5 / 6 nopan variantti** valittavissa aloitusnäytöllä (6 = Superjatsi).
- **1–6 pelaajaa** hot-seat (pass-and-play).
- 5 sarakerajoitetta + yläbonus per sarake (kynnys 63 / 84, +50) ja juokseva poikkeama.
- Alaosa: Pari, Kaksi paria, **Kolme paria** (6 noppaa), Kolme/Neljä samaa, Täyskäsi,
  Pieni/Suuri/**Täys**suora, Sattuma, Jatsi (50) ja **Superjatsi** (100, 6 noppaa).
- **Kaksivaiheinen kirjaus:** klikkaus = väliaikainen, **Vahvista** siirtää vuoron, **Peru** peruu.
- Heitetyt nopat "sekamelskana", lukitut suorassa rivissä.
- **localStorage**-tallennus: kesken jäänyt peli palautuu sivun latauksessa;
  pelaajien nimet ja määrä muistetaan seuraavaan peliin.
- **Ennätykset (top 10)** per variantti — vain laitteen omaan localStorageen, ei verkkoon.
- **Responsiivinen:** pysty = pino, vaaka (puhelin) = kaksipalstainen (ohjaimet + vierivä tulokortti).

## Arkkitehtuuri

Pelitila (domain) on tiukasti irti käyttöliittymästä — yksisuuntainen datavirta.

- `src/domain/` — puhdas pelilogiikka, ei DOMia: `dice`, `scoring`, `columns`
  (sarakerajoitteet strategiakuviona), `scorecard`, `game` (GameState), `storage` (localStorage),
  `highscores` (ennätyslista).
- `src/ui/` — tyhmät Web Componentit, jotka lukevat domainista johdetun näkymämallin
  (`view.ts` → GameView) ja emittoivat eventtejä ylös. Tekstit keskitetty `strings.ts`:ään.
- `test/` — Vitest-testit (domain).

## Kehitys

```bash
npm install
npm run dev      # http://localhost:5175
npm test         # Vitest (domain-testit)
npm run build    # tyypintarkistus (tsc) + tuotantobuild
```

## Julkaisu

Kytketty Vercel-tuotantoon, GitHub-auto-deploy päällä: **`git push` main-haaraan → automaattinen
tuotantodeploy** osoitteeseen https://tommi-taysi.vercel.app.

## Lisenssi

Henkilökohtainen harrasteprojekti.
