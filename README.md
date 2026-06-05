# Superjatsi

Web-pohjainen **maxi-jatsi** (5 tai 6 noppaa) paikalliseen pass-and-play-moninpeliin.
Puhdas, kirjastoton toteutus: **Vite + TypeScript + Web Components**. Ei Reactia, ei
raskaita riippuvuuksia, ei tilejä eikä tietokantaa.

## Idea

Pelin ydin on **matriisitulokortti**, jossa jokaisella sarakkeella on oma rajoite:

| Sarake | Rajoite |
|---|---|
| I | kirjaus vain 1. heiton jälkeen |
| II | enintään 2 heittoa |
| III | enintään 3 heittoa |
| ALAS | pakko täyttää ylhäältä alas |
| YLÖS | pakko täyttää alhaalta ylös |

Tarkat säännöt: [SUPERJATSI.md](SUPERJATSI.md).

## Arkkitehtuuri

Pelitila (domain) pidetään tiukasti irti käyttöliittymästä — yksisuuntainen datavirta.

- `src/domain/` — puhdas pelilogiikka, ei DOMia (dice, scoring, sarakerajoitteet
  strategiakuviona, tulokortti, GameState, localStorage-persistointi).
- `src/ui/` — tyhmät Web Componentit, jotka lukevat domainista johdetun näkymämallin
  ja emittoivat eventtejä ylös.

## Kehitys

```bash
npm install
npm run dev      # http://localhost:5175
npm test         # Vitest (domain-testit)
npm run build    # tyypintarkistus + tuotantobuild
```

## Lisenssi

Henkilökohtainen harrasteprojekti.
