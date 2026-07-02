# Superjatsi

Web-pohjainen maxi-jatsi paikalliseen pass-and-play-moninpeliin (1–6 pelaajaa, 5/6 noppaa).
Pelin nimi on **Superjatsi**; sama nimi kantaa myös pistekategoria "Superjatsi" (6 samaa) —
tietoinen nimitörmäys, hyväksytty käyttäjän toimesta.

## Tech ja komennot

Vite + TypeScript + Web Components (light DOM). **Ei Reactia, ei ajonaikaisia riippuvuuksia.**

- `npm run dev` — dev-palvelin, portti 5175 (Projects-juuren `.claude/launch.json` nimi `superjatsi`)
- `npx vitest run` — testit (`test/*.test.ts`)
- `npm run build` — `tsc --noEmit && vite build`

## Arkkitehtuuri (Anti-slop: domain irti UI:sta)

- `src/domain/` — puhdas pelilogiikka, **ei DOM-viittauksia**. `game.ts` (GameState) on
  service-kerros: UI kutsuu vain sitä, ei Scorecardia/sääntöjä suoraan. `availableMoves()`
  on ainoa lähde UI:n korostuksille. Sarakerajoitteet strategiakuviona (`columns.ts`:
  ThrowLimitColumn / OrderedColumn). Storage-backendit injektoitavia (StorageLike).
- `src/ui/` — tyhmät Web Componentit. Datavirta yksisuuntainen: domain → `buildView()`
  (`view.ts`) → GameView propsina alas, CustomEvent-eventit ylös `sj-app`:iin, joka
  omistaa GameStaten ja persistoinnin.
- Kaikki UI-tekstit `src/ui/strings.ts`:ssä — ei kovakoodattuja merkkijonoja komponentteihin.

## Sopimus ennen toteutusta

`SUPERJATSI.md` on pelisääntöjen **sopimusdokumentti**. Sääntömuutos kirjataan ensin sinne
ja vahvistetaan käyttäjällä, vasta sitten koodiin. Invariantti: pelaajalla on aina vähintään
yksi laillinen siirto (anti-jumi-poltto).

## Dokumentaatio ja julkaisu

- Päivitä `CHANGELOG.md` (Keep a Changelog, SemVer — pidä `package.json`-versio synkassa)
  ja `TODO.md` ennen pushia; valmiit TODO-kohdat siirtyvät CHANGELOGiin.
- **Julkaisu = `git push` mainiin** → Vercel-git-integraatio deployaa tuotantoon
  (https://tommi-superjatsi.vercel.app) automaattisesti. Ei erillistä CLI-deployta.
  Odota ~30–60 s ennen tuotannon todennusta (bundle-grep). Pushaa vain käyttäjän
  selvällä julkaisukuittauksella.
- Domain-muutokset vaativat Vitest-testit; UI todennetaan preview-selaimella.

## Muista

- Kulta (`--gold`) on varattu lukitus-/pending-tilalle — älä käytä sitä muuhun korostukseen.
- Vihreä = kirjattavissa oleva solu, myös 0 p:n vaihtoehdot (ml. anti-jumi-poltto) — ei
  erillistä punaista poltto-tyyliä UI:ssa (tietoinen selkeys-päätös, ks. CHANGELOG).
- Nopat: jalometalli-sävy silmäluvun mukaan (`.die.v1`–`.v6`), heitetyt gridi-"pöydällä"
  haamupaikkoineen (nopat eivät saa liikkua lukittaessa eivätkä mennä päällekkäin).
