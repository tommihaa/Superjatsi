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
    case "fullHouse":
      return fullHouse(c);
    case "smallStraight":
      return hasAll(c, [1, 2, 3, 4, 5]) ? 15 : 0;
    case "largeStraight":
      return hasAll(c, [2, 3, 4, 5, 6]) ? 20 : 0;
    case "fullStraight":
      return hasAll(c, [1, 2, 3, 4, 5, 6]) ? 21 : 0;
    case "chance":
      return sum(dice);
    case "yatzy":
      return highestWithAtLeast(c, 5) > 0 ? 50 : 0;
    case "superyatzy":
      return highestWithAtLeast(c, 6) > 0 ? 100 : 0;
  }
}
