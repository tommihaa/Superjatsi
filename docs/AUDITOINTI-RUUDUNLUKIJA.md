# Ruudunlukija-auditointi: merkinnät virallisia lähteitä vasten

Ajettu 14.10.2026 Tommin tilauksesta, HEAD `2715e66` (0.23.0). Liipaisin, lähteet ja
menetelmä ovat samat kuin Itun auditoinnissa (`SanaMix/docs/AUDITOINTI-RUUDUNLUKIJA.md`):
koodinluku [APG](https://www.w3.org/WAI/ARIA/apg/)n, [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/)n
ja [ARIA in HTML](https://www.w3.org/TR/html-aria/)n mukaan, ei kuuntelua ruudunlukijalla.
Rivinumerot ovat HEAD `2715e66`:n puusta.

Kunnossa: ilmoitusjono (`src/ui/announce.ts`), noppien ja yläpalkin nappien nimet, natiivit
`<button>`it nopissa ja `<html lang>` joka vaihtuu kielen mukana (`strings.ts:45`).
Pistetaulukko on oikea `<table>`, mikä on hyvä pohja.

## Löydökset

**SJ-1. Taulukon solut ja otsikot on ylikirjoitettu `role="button"`illa.** Tila: korjattu
14.10.2026. Kirjattava solu on `<td>`, jonka sisällä on natiivi `<button class="cell-btn">`, ja
selitteet ovat `<th>`:n sisällä natiiveja `<button class="has-info">`-nappeja. Napin nimi on
näkyvä otsikko ja selite on `title`, joten sarakeotsikko sanoo taulukkonavigoinnissa
sarakkeen nimen eikä koko selitettä. Käsin tehty Enter/Space-käsittely poistettiin. Todennettu
selaimessa: ei yhtään `role="button"`ia taulukossa, Enter kirjaa kohdistetun solun ja
selitekupla aukeaa. Saavutettavuuspuun taulukkorooleja selaintyökalu ei näytä, eikä mitään
kuunneltu. Alkuperäinen havainto:
`scorecard-view.ts:111` (vapaat solut), `:142` (sarakeotsikot `this.info()`n kautta, `:32`)
ja `:155` (rivien nimet): ARIA in HTML ei salli `<td>`:lle eikä `<th>`:lle button-roolia
taulukon sisällä. Seuraus on se, että taulukkonavigoinnissa (NVDA ja JAWS Ctrl+Alt+nuolet,
VoiceOverin rootori) sarakeotsikko on painike eikä otsikko, joten solu ei kerro saraketta.
Virallinen muoto on solun sisään sijoitettu natiivi `<button>`, jolloin `<td>` ja `<th>` pysyvät
taulukkona. Näppäinkäsittely (`:216`) poistuu samalla, koska natiivi nappi aktivoituu itse.

**SJ-2. Rivien nimet ovat `<td>` eivätkä rivin otsikoita.** Tila: korjattu 14.10.2026 samassa
commitissa: rivien nimet, Yläsumma, Bonus ja Yhteensä ovat `<th scope="row">` ja sarakeotsikot
`<th scope="col">`. Alkuperäinen havainto: `scorecard-view.ts:155`,
`:164`, `:171` ja `:176`: kun nimi on `<th scope="row">`, ruudunlukija sanoo solussa rivin nimen
(esim. "Täyskäsi") ja sarakkeen. Nyt solun `aria-label` kantaa tiedon itse, mutta
taulukkonavigoinnissa täytetyt solut sanovat pelkän luvun.

**SJ-3. Lukittu noppa kerrotaan nimessä eikä tilana.** Tila: korjattu 14.10.2026: noppa on
`aria-pressed`, ja `a11y.die` sanoo kolmella kielellä pelkän nopan ja silmäluvun. Todennettu
DOMista. Alkuperäinen havainto:
`dice-tray.ts:77` ja `:84`: APG:n [toggle button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)
-malli on `aria-pressed="true"`, jolloin ruudunlukija sanoo tilan omalla tavallaan ("painettu" tai
"valittu") ja nimi pysyy samana. Nykyinen tapa toimii, joten tämä on yhdenmukaisuutta eikä vika.

## Kuuntelu 15.10.2026

Tommi kuunteli tuotantoversion 0.23.1 TalkBackilla Pixelillä, pystytilassa.

*Toimii:* heitto ilmoitetaan, lukittu noppa kertoo tilan ("valittu, päällä, noppa 2,
valitsin"), ja taulukko kuuluu taulukkona ("ruudukossa 19 riviä, 7 saraketta"). Vapaa solu
kertoo rivin, sarakkeen ja pisteet ("Kirjaa Täyskäsi, sarake I, 7 pistettä"), ja kirjaus
kulkee Vahvista-nappiin ja ilmoittaa yhteissumman.

**SJ-4. Kohdistus katoaa jokaisen toiminnon jälkeen.** Tila: korjattu 15.10.2026, 0.23.2, ei vielä
julkaistu. Lukituksen ja kirjauksen jälkeen TalkBack sanoi "Superjatsi, verkkonäkymä", eli
kohdistus putosi koko sivulle. Syy: `sj-app.render()` rakentaa koko näkymän uusiksi
(`replaceChildren`), ja kohdistettu nappi tuhoutuu. Korjaus: render tallentaa kohdistetun
kohdan tunnisteen (noppa `data-die`, solu `data-col`/`data-row`, napin luokka) ja palauttaa
kohdistuksen samaan kohtaan. Kadonneen kohdan (kirjattu solu, Vahvista) tilalle kohdistus
menee heittonappiin. Todennettu dev-previewissä: heiton jälkeen heittonappi, lukituksen
jälkeen sama noppa, solun jälkeen Vahvista ja vahvistuksen jälkeen heittonappi. Ei kuunneltu.

**SJ-5. "Heitto 1/3" luetaan murtolukuna.** Tila: korjattu 15.10.2026 Tommin valinnalla muotoon "Heitto 1 kolmesta" (sv "Slag 1 av 3", en "Roll 1 of 3"), 0.23.2. TalkBack sanoi "Heitto kolmasosa",
joten heiton numero jäi kuulumatta. Sama muoto on `rolled`- ja `rollNo`-teksteissä.

**Kuuntelu korjausten jälkeen (0.23.2):** kohdistus jää lukituksen jälkeen noppaan, ja
kirjauksen vahvistuksen jälkeen se siirtyy heittonappiin ("Heitä (3)"). SJ-4 toimii.
SJ-5 ei toiminut toivotusti: TalkBackin suomen puhe taivuttaa numeron seuraavan sanan mukaan,
joten "Heitto 1 kolmesta" kuuluu "Heitto yhdestä kolmesta".
Korjattu uudelleen 0.23.3:ssa Tommin valinnalla: järjestysluku sanana ("Ensimmäinen heitto",
"Toinen heitto", "Kolmas heitto"), jota puhe ei voi taivuttaa väärin. Ei kuunneltu.
