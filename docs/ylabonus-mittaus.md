# Yläbonuksen saavutettavuus viidellä ja kuudella nopalla (mitattu 2.9.2026)

Toimeksianto on Tommin (`SUBSTANSSI.md` kohta 64): *kuudella nopalla yläbonus on vaikeampi
saavuttaa ja siksi mittaa miten sitä voisi laskea.* Nykyinen sääntö on `SUPERJATSI.md` ›
Yläbonus: kynnys on silmäluku × k summattuna, k = 3 viidellä nopalla (63, +50) ja k = 4
kuudella (84, +100). Kuuden nopan +100 on kohdan 19 mukaan vaikeuden kompensaatio.

Skripti on `scripts/mittaa_ylabonus.py`, ajo `--heitot 200000 --siemen 1`. Luvut ovat tuon
ajon. Ne toistuvat samalla siemenellä.

## Mitä luku laskee

Yhden sarakkeen yläosan summa S, kun pelaaja pelaa kuusi yläosan riviä eikä mitään muuta.
Kaksi mallia:

- **A, kohdennettu rivi.** Jokainen rivi pelataan erikseen kolmella heitolla pitäen rivin
  silmäluvun nopat. Osumat ovat Bin(n, 0,4213), sama malli kuin kohdassa 54. Jakauma on
  tarkka, ei arvottu.
- **B, paras tahko.** Joka vuorolla ensimmäisen heiton jälkeen valitaan avoimista riveistä
  se silmäluku jota on eniten, pidetään ne ja heitetään loput kahdesti. Rivi valitaan siis
  heiton mukaan eikä heitto rivin. Simulaatio, 200 000 saraketta per noppamäärä.

Molemmat aliarvioivat oikeaa peliä, koska oikeassa pelissä heittoja ohjataan viiden
sarakkeen välillä (kohta 57) ja rivi valitaan myös alaosan tarjonnan mukaan. Viiden ja kuuden
nopan vertailu on silti mielekäs, koska harha on sama molemmille. ALAS- ja YLÖS-sarakkeiden
pakotettu järjestys ei ole mallissa, joten luvut kuvaavat vapaata saraketta.

## Tulos

| | A, 5 noppaa | A, 6 noppaa | B, 5 noppaa | B, 6 noppaa |
|---|---|---|---|---|
| S:n keskiarvo | 44,2 | 53,1 | 55,6 | 65,7 |
| P(S ≥ nykyinen kynnys) | 4,4 % (63) | 0,5 % (84) | 23,3 % (63) | 4,3 % (84) |
| Kuuden nopan kynnys jolla P vastaa viiden nopan 63:a | | **73** (4,8 %) | | **73** (25,2 %) |

P(S ≥ t) kuudella nopalla:

| t | A | B | |
|---|---|---|---|
| 63 | 20,8 % | 61,6 % | viiden nopan luku |
| 66 | 14,3 % | 50,1 % | |
| 69 | 9,3 % | 38,7 % | |
| 72 | 5,7 % | 28,3 % | |
| 75 | 3,3 % | 19,5 % | |
| 78 | 1,8 % | 12,6 % | |
| 81 | 0,9 % | 7,6 % | |
| 84 | 0,5 % | 4,3 % | nykyinen |

## Mitä tästä seuraa

**Nykyinen 84 on noin viisi kertaa vaikeampi kuin viiden nopan 63.** Mallissa B bonus tulee
vapaassa sarakkeessa 23 %:ssa viiden nopan ja 4 %:ssa kuuden nopan sarakkeista. Tommin sanat
*harvoin* (kohta 64) ja *onnenkantamoinen* (kohta 60) täsmäävät tähän.

**Vastaava kynnys on 73 kummallakin mallilla.** Se on 3,5 per rivi (73,5) alaspäin
pyöristettynä. Mallit eroavat tasossa (A on ankarampi kaikkialla) mutta antavat saman
vastaavuuden, joten luku ei riipu siitä kumpi malli on lähempänä pelaajaa.

Vertailulukuja ilman mallia: per noppa skaalattuna 63/5 × 6 = 75,6 ja 3 per rivi kuudella
nopalla olisi 63.

## Vaihtoehdot (päätös on Tommin)

| Kynnys | Peruste | Huomio |
|---|---|---|
| 73 | mitattu vastaavuus viiden nopan 63:een | ei muotoa silmäluku × k, kirjataan lukuna |
| 76 | skaalaus per noppa (75,6) | hieman 63:a vaikeampi (B: 17 %) |
| 84 | ennallaan | +100 kompensoi, kohta 19 |

Jos kynnys laskee, niin +100:n peruste (vaikeus, kohta 19) heikkenee. Bonuksen arvo on siis
toinen päätös: +50 kuten viidellä nopalla, tai +100 ennallaan.

## Miten muutos tehtäisiin

`SUPERJATSI.md` on sopimusdokumentti (`CLAUDE.md` › Sopimus ennen toteutusta). Kynnys
kirjataan ensin sinne ja vahvistetaan, vasta sitten `src/domain/scorecard.ts`, testit ja
bonusrivin hover-selite (`src/ui/strings.ts`). Tämä on `Kaanon/TYOJONO.md` kohdan 39 kokeen 2
ehdokas: speksistä kertakäyttöinen plan ja aika mitataan.
