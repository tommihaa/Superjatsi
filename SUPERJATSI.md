# Superjatsi: säännöt (sopimus)

Tämä on pelin **sopimusdokumentti** (Anti-slop: sopimus ennen toteutusta). Domain-koodi
toteuttaa nämä säännöt; jos sääntö muuttuu, se muutetaan ensin tähän ja vahvistetaan.

## Variantit

Aloitusnäytöllä valitaan **5 noppaa** (perinteinen jatsi) tai **6 noppaa** (Superjatsi).

**Yksinpeli** (päätös 16.7.2026): peli on paikallisesti vain yhdelle pelaajalle. Pass-and-play
poistettiin UI:sta, koska yksikin peli kestää n. 20 min, joten monen pelaajan hot-seat ei tule
loppuun pelatuksi. Domain (`GameState`) säilyy N-pelaajakykyisenä tulevaa **verkko-moninpeliä**
varten, mutta paikallinen UI ajaa aina yhtä pelaajaa. Aiempi hot-seat-vuoronvaihto (handoff)
on git-historiassa palautettavissa.

## Tulokortti

5 pelisaraketta. Jokainen sarake on itsenäinen "minijatsi" omalla yläbonuksellaan.
Näytöllä lisäksi **=**-sarake = rivin yhteissumma sarakkeiden yli (vain näyttö).

| Sarake | Rajoite |
|---|---|
| **I**    | kirjaus vain kun heittoja käytetty ≤ 1; vapaa rivijärjestys |
| **II**   | heittoja käytetty ≤ 2; vapaa rivijärjestys |
| **III**  | heittoja käytetty ≤ 3; vapaa rivijärjestys |
| **ALAS** | 3 heittoa; **pakko täyttää ylhäältä alas** järjestyksessä |
| **YLÖS** | 3 heittoa; **pakko täyttää alhaalta ylös** järjestyksessä |

**Loppupisteet** = sarakkeiden (I + II + III + ALAS + YLÖS) yhteissumma.

## Heitot

Vuorolla **3 heittoa**. Heittojen välissä nopat saa lukita/vapauttaa vapaasti. Vuoro päättyy
kun pelaaja kirjaa tuloksen johonkin avoimeen soluun (tai polttaa rivin).

## Rivit (kategoriat)

### Yläosa
Ykköset, Kakkoset, Kolmoset, Neloset, Vitoset, Kutoset: pisteet = täsmäävien noppien summa.

**Yläbonus (per sarake):** kynnys = `silmäluku × k` summattuna (k = 3 viidellä nopalla → 63;
k = 4 kuudella nopalla → 84). Kynnyksen täyttyessä **+50** (5 noppaa) tai **+100**
(6 noppaa, kynnys 84).

### Alaosa
| Kategoria | Ehto | Pisteet |
|---|---|---|
| Pari | 2 samaa | parin silmien summa |
| Kaksi paria | 2 eri paria | parien silmien summa |
| Kolme paria *(vain 6 noppaa)* | 3 eri paria | kaikkien 6 nopan summa |
| Kolme samaa | 3 samaa | kolmikon silmien summa |
| Neljä samaa | 4 samaa | nelikön silmien summa |
| Täyskäsi | 3 + 2 samaa | kaikkien 5 ko. nopan summa |
| Pieni suora | 1-2-3-4-5 | 15 |
| Suuri suora | 2-3-4-5-6 | 20 |
| Täyssuora *(vain 6 noppaa)* | 1-2-3-4-5-6 | 25 *(21 + 4 harvinaisuusbonusta)* |
| Huvila *(vain 6 noppaa)* | 3 + 3 samaa (2 eri kolmikkoa) | kaikkien 6 nopan summa |
| Torni *(vain 6 noppaa)* | 4 + 2 samaa (2 eri silmälukua) | kaikkien 6 nopan summa |
| Sattuma | mikä tahansa | kaikkien noppien summa |
| Jatsi | 5 samaa | 50 |
| Superjatsi *(vain 6 noppaa)* | 6 samaa | 100 |

Kun nopat on enemmän kuin kategoria vaatii (6 noppaa, alaosan kombo käyttää 2–5),
valitaan **paras** mahdollinen kombinaatio nopista.

## Polttaminen

Minkä tahansa **avoimen** rivin saa merkitä nollaksi (polttaa). ALAS/YLÖS-sarakkeissa
poltto kohdistuu järjestyksen seuraavaan riviin ja vie järjestystä eteenpäin.

**Anti-jumi-sääntö:** jos heittojen jälkeen mikään kirjaus ei ole sallittu (jäljellä on
vain I/II-soluja ja sarakkeen heittoraja on ylittynyt), avoimet solut saa silti polttaa.
Pelaajalla on siis aina vähintään yksi laillinen siirto, peli ei voi jumittua.

## Pelin kulku

Yksinpeli: pelaaja täyttää kaikki solut. Peli päättyy kun kortti on täynnä.
Myös pelin **viimeinen** kirjaus vahvistetaan (Vahvista/Peru) ennen pelin päättymistä.
Loppunäyttö näyttää tuloksen (ei voittajaa, kun pelaajia on yksi).

## Persistointi

Kesken jäänyt peli tallennetaan selaimen localStorageen ja palautetaan sivun latauksessa.
Vanha/korruptoitunut tallennus → peli alkaa puhtaalta pöydältä (ei lukkiudu).
