"""Yläbonuksen saavutettavuus viidellä ja kuudella nopalla, ja mikä kuuden nopan
kynnys vastaisi viiden nopan 63:a.

Miksi tämä on olemassa: Tommi 2.9.2026 (SUBSTANSSI.md kohta 64): "Kuudella
nopalla yläbonus on vaikeampi saavuttaa ja siksi mittaa miten sitä voisi
laskea." Nykyinen kynnys on silmäluku x k summattuna, k = 3 viidellä (63) ja
k = 4 kuudella (84), SUPERJATSI.md › Yläbonus.

Mitä luku laskee: yhden sarakkeen yläosan summan S jakauma, kun pelaaja pelaa
kuusi yläosan riviä eikä mitään muuta. Kaksi mallia, ja molemmat aliarvioivat
oikeaa peliä, koska oikeassa pelissä heittoja voi ohjata viiden sarakkeen
välillä (kohta 57) ja pelaaja valitsee rivin myös alaosan tarjonnan mukaan.
Vertailu viiden ja kuuden nopan välillä on silti mielekäs, koska harha on sama
molemmille.

  A, kohdennettu rivi (tarkka jakauma): jokainen rivi pelataan erikseen
     kolmella heitolla pitäen rivin silmäluvun nopat. Osumien määrä on
     Bin(n, p), p = 1 - (5/6)^3 = 0,4213 (kohdan 54 malli). Summa lasketaan
     konvoluutiolla, ei arpomalla.
  B, paras tahko (simulaatio): joka vuorolla ensimmäisen heiton jälkeen
     valitaan avoimista riveistä se silmäluku jota on eniten (tasatilanteessa
     suurin), pidetään ne nopat ja heitetään loput kahdesti. Rivi suljetaan
     sillä mitä tuli. Tämä on lähempänä pelaajaa kuin A, koska rivi valitaan
     heiton mukaan eikä heitto rivin.

Raportoidaan S:n keskiarvo, P(S >= kynnys) nykyisillä kynnyksillä sekä kuuden
nopan kynnys jolla P vastaa viiden nopan 63:a, molemmilla malleilla. Lisäksi
taulukko P(S >= t) kuuden nopan t-arvoille 63..84.

Ajo: python scripts/mittaa_ylabonus.py [--heitot N] [--siemen S]
"""
import argparse
import random
import sys
from math import comb

P_OSUMA = 1 - (5 / 6) ** 3
SILMAT = (1, 2, 3, 4, 5, 6)


def binomi(n, p):
    return [comb(n, k) * p**k * (1 - p) ** (n - k) for k in range(n + 1)]


def malli_a(n):
    """Tarkka jakauma: S = sum(silmä * Bin(n, p)) yli kuuden silmäluvun."""
    jak = {0: 1.0}
    osumat = binomi(n, P_OSUMA)
    for silma in SILMAT:
        uusi = {}
        for s, ps in jak.items():
            for k, pk in enumerate(osumat):
                uusi[s + silma * k] = uusi.get(s + silma * k, 0.0) + ps * pk
        jak = uusi
    return jak


def malli_b(n, heitot, rng):
    """Simulaatio: paras tahko avoimista riveistä, kolme heittoa."""
    laskuri = {}
    for _ in range(heitot):
        avoimet = set(SILMAT)
        summa = 0
        for _vuoro in range(6):
            nopat = [rng.randint(1, 6) for _ in range(n)]
            # valinta: eniten noppia avoimista, tasatilanteessa suurin silmäluku
            silma = max(avoimet, key=lambda f: (nopat.count(f), f))
            pidetty = nopat.count(silma)
            for _heitto in range(2):
                pidetty += sum(1 for _ in range(n - pidetty) if rng.randint(1, 6) == silma)
            summa += pidetty * silma
            avoimet.remove(silma)
        laskuri[summa] = laskuri.get(summa, 0) + 1
    return {s: c / heitot for s, c in laskuri.items()}


def p_vahintaan(jak, t):
    return sum(p for s, p in jak.items() if s >= t)


def keskiarvo(jak):
    return sum(s * p for s, p in jak.items())


def vastaava_kynnys(jak6, tavoite):
    """Suurin t jolla P(S6 >= t) >= tavoite."""
    paras = 0
    for t in range(0, 6 * 21 + 1):
        if p_vahintaan(jak6, t) >= tavoite:
            paras = t
    return paras


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--heitot", type=int, default=200_000)
    ap.add_argument("--siemen", type=int, default=1)
    args = ap.parse_args()
    rng = random.Random(args.siemen)

    print(f"p(osuma kolmella heitolla) = {P_OSUMA:.4f}")
    print(f"malli B: {args.heitot} saraketta per noppamäärä, siemen {args.siemen}")
    print()

    tulokset = {}
    for nimi, malli in (("A kohdennettu rivi", lambda n: malli_a(n)),
                        ("B paras tahko", lambda n: malli_b(n, args.heitot, rng))):
        j5, j6 = malli(5), malli(6)
        p5 = p_vahintaan(j5, 63)
        p6 = p_vahintaan(j6, 84)
        t6 = vastaava_kynnys(j6, p5)
        tulokset[nimi] = (j5, j6)
        print(f"== {nimi}")
        print(f"  5 noppaa: keskiarvo {keskiarvo(j5):5.1f}, P(S >= 63) = {p5:6.1%}")
        print(f"  6 noppaa: keskiarvo {keskiarvo(j6):5.1f}, P(S >= 84) = {p6:6.1%}")
        print(f"  kuuden nopan kynnys jolla P vastaa viiden nopan 63:a: {t6}"
              f"  (P = {p_vahintaan(j6, t6):.1%})")
        print()

    print("P(S >= t) kuudella nopalla, t = 63..84")
    print("   t   " + "  ".join(f"{nimi[:1]:>7}" for nimi in tulokset))
    for t in range(63, 85, 3):
        rivi = "  ".join(f"{p_vahintaan(j6, t):7.1%}" for (_, j6) in tulokset.values())
        merkki = " <- nykyinen" if t == 84 else (" <- viiden nopan luku" if t == 63 else "")
        print(f"  {t:3d}   {rivi}{merkki}")
    print()
    print("Vertailulukuja ilman mallia: 63/5 noppaa = 12,6 per noppa, kuudella 75,6;")
    print("3,5 per rivi = 73,5; nykyinen 4 per rivi = 84.")


if __name__ == "__main__":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except AttributeError:
        pass
    main()
