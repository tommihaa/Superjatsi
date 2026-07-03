import type { DiceCount, RowId } from "./types";

// Puhtaat pisteytysfunktiot. Syöte: noppien silmäluvut (1..6). Ei sivuvaikutuksia.
// 6 nopalla alaosan kombot valitsevat parhaan mahdollisen kombinaation nopista.

/** Silmälukujen lukumäärät: counts[v] = montako noppaa näyttää arvoa v (v 1..6). */
function counts(dice: number[]): number[] {
  const c = [0, 0, 0, 0, 0, 0, 0]; // indeksit 0..6, 0 käyttämättä
  for (const v of dice) c[v]++;
  return c;
}

const sum = (dice: number[]): number => dice.reduce((a, b) => a + b, 0);

/** Suurin silmäluku, jolla on vähintään n kappaletta; 0 jos ei löydy. */
function highestWithAtLeast(c: number[], n: number): number {
  for (let v = 6; v >= 1; v--) if (c[v] >= n) return v;
  return 0;
}

function pair(c: number[]): number {
  const v = highestWithAtLeast(c, 2);
  return v * 2;
}

function twoPairs(c: number[]): number {
  const pairs: number[] = [];
  for (let v = 6; v >= 1; v--) if (c[v] >= 2) pairs.push(v);
  if (pairs.length < 2) return 0;
  return (pairs[0] + pairs[1]) * 2;
}

function threePairs(c: number[]): number {
  // Kolme eri paria (käyttää kaikki 6 noppaa). Yksi luku voi olla vain yksi pari,
  // joten esim. neljä samaa ei tee kahta paria → vaaditaan 3 eri silmälukua.
  const pairs: number[] = [];
  for (let v = 6; v >= 1; v--) if (c[v] >= 2) pairs.push(v);
  if (pairs.length < 3) return 0;
  return (pairs[0] + pairs[1] + pairs[2]) * 2;
}

function nOfAKind(c: number[], n: number): number {
  const v = highestWithAtLeast(c, n);
  return v * n;
}

function huvila(c: number[]): number {
  // Kaksi eri kolmikkoa (käyttää kaikki 6 noppaa). Yksi silmäluku voi
  // muodostaa vain yhden kolmikon, joten neljä+kaksi ei kelpaa (se on Torni).
  const triples: number[] = [];
  for (let v = 6; v >= 1; v--) if (c[v] >= 3) triples.push(v);
  if (triples.length < 2) return 0;
  return (triples[0] + triples[1]) * 3;
}

function torni(c: number[]): number {
  // Paras nelikkö + erillinen pari (eri silmäluvut).
  let best = 0;
  for (let f = 6; f >= 1; f--) {
    if (c[f] < 4) continue;
    for (let p = 6; p >= 1; p--) {
      if (p === f || c[p] < 2) continue;
      best = Math.max(best, f * 4 + p * 2);
    }
  }
  return best;
}

function fullHouse(c: number[]): number {
  // Paras kolmikko + erillinen pari (eri silmäluvut). 6 nopalla esim. 3+3 kelpaa.
  let best = 0;
  for (let t = 6; t >= 1; t--) {
    if (c[t] < 3) continue;
    for (let p = 6; p >= 1; p--) {
      if (p === t || c[p] < 2) continue;
      best = Math.max(best, t * 3 + p * 2);
    }
  }
  return best;
}

/** Sisältääkö nopat kaikki annetut silmäluvut. */
function hasAll(c: number[], faces: number[]): boolean {
  return faces.every((f) => c[f] >= 1);
}

export function scoreFor(rowId: RowId, dice: number[], _diceCount: DiceCount): number {
  const c = counts(dice);
  switch (rowId) {
    case "ones":
      return c[1] * 1;
    case "twos":
      return c[2] * 2;
    case "threes":
      return c[3] * 3;
    case "fours":
      return c[4] * 4;
    case "fives":
      return c[5] * 5;
    case "sixes":
      return c[6] * 6;
    case "pair":
      return pair(c);
    case "twoPairs":
      return twoPairs(c);
    case "threePairs":
      return threePairs(c);
    case "threeKind":
      return nOfAKind(c, 3);
    case "fourKind":
      return nOfAKind(c, 4);
    case "huvila":
      return huvila(c);
    case "torni":
      return torni(c);
    case "fullHouse":
      return fullHouse(c);
    case "smallStraight":
      return hasAll(c, [1, 2, 3, 4, 5]) ? 15 : 0;
    case "largeStraight":
      return hasAll(c, [2, 3, 4, 5, 6]) ? 20 : 0;
    case "fullStraight":
      // Harvinaisuusbonus: 21 peruspistettä + 4 = 25.
      return hasAll(c, [1, 2, 3, 4, 5, 6]) ? 25 : 0;
    case "chance":
      return sum(dice);
    case "yatzy":
      return highestWithAtLeast(c, 5) > 0 ? 50 : 0;
    case "superyatzy":
      return highestWithAtLeast(c, 6) > 0 ? 100 : 0;
  }
}

/**
 * Kategorian teoreettinen maksimipistemäärä nykyisellä noppamäärällä. Käytetään
 * apurina näyttämään milloin nykyinen ehdotus on jo paras mahdollinen (esim.
 * suorat, joissa ainoa mahdollinen pistemäärä on aina tämä maksimi).
 */
export function maxScoreFor(rowId: RowId, diceCount: DiceCount): number {
  switch (rowId) {
    case "ones":
      return 1 * diceCount;
    case "twos":
      return 2 * diceCount;
    case "threes":
      return 3 * diceCount;
    case "fours":
      return 4 * diceCount;
    case "fives":
      return 5 * diceCount;
    case "sixes":
      return 6 * diceCount;
    case "pair":
      return 6 * 2;
    case "twoPairs":
      return (6 + 5) * 2;
    case "threePairs":
      return (6 + 5 + 4) * 2;
    case "threeKind":
      return 6 * 3;
    case "fourKind":
      return 6 * 4;
    case "huvila":
      return (6 + 5) * 3;
    case "torni":
      return 6 * 4 + 5 * 2;
    case "fullHouse":
      return 6 * 3 + 5 * 2;
    case "smallStraight":
      return 15;
    case "largeStraight":
      return 20;
    case "fullStraight":
      return 25;
    case "chance":
      return 6 * diceCount;
    case "yatzy":
      return 50;
    case "superyatzy":
      return 100;
  }
}
