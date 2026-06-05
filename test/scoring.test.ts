import { describe, expect, it } from "vitest";
import { scoreFor } from "../src/domain/scoring";

describe("scoring — yläosa", () => {
  it("laskee silmäluvun summan", () => {
    expect(scoreFor("ones", [1, 1, 2, 3, 4, 5], 6)).toBe(2);
    expect(scoreFor("sixes", [6, 6, 6, 1, 2, 3], 6)).toBe(18);
  });
  it("on 0 kun silmälukua ei ole", () => {
    expect(scoreFor("fives", [1, 2, 3, 4, 6, 6], 6)).toBe(0);
  });
});

describe("scoring — parit ja samat", () => {
  it("Pari = korkeimman parin summa", () => {
    expect(scoreFor("pair", [3, 3, 5, 5, 2, 1], 6)).toBe(10);
    expect(scoreFor("pair", [1, 2, 3, 4, 5, 6], 6)).toBe(0);
  });
  it("Kaksi paria = kahden korkeimman parin summa", () => {
    expect(scoreFor("twoPairs", [3, 3, 5, 5, 6, 1], 6)).toBe(16);
    expect(scoreFor("twoPairs", [3, 3, 1, 2, 4, 6], 6)).toBe(0);
  });
  it("Kolme paria = kolmen eri parin summa (6 noppaa)", () => {
    expect(scoreFor("threePairs", [2, 2, 4, 4, 6, 6], 6)).toBe(24);
    expect(scoreFor("threePairs", [2, 2, 4, 4, 5, 6], 6)).toBe(0); // vain 2 paria
    expect(scoreFor("threePairs", [3, 3, 3, 3, 5, 5], 6)).toBe(0); // neljä samaa = 1 pari
  });
  it("Kolme/Neljä samaa = noppien summa", () => {
    expect(scoreFor("threeKind", [4, 4, 4, 2, 1, 6], 6)).toBe(12);
    expect(scoreFor("fourKind", [6, 6, 6, 6, 1, 2], 6)).toBe(24);
    expect(scoreFor("fourKind", [6, 6, 6, 1, 2, 3], 6)).toBe(0);
  });
  it("Täyskäsi = kolmikon + parin summa (paras 6 nopalla)", () => {
    expect(scoreFor("fullHouse", [5, 5, 5, 2, 2, 1], 6)).toBe(19);
    expect(scoreFor("fullHouse", [3, 3, 3, 6, 6, 6], 6)).toBe(24); // 6×3 + 3×2
    expect(scoreFor("fullHouse", [4, 4, 4, 4, 4, 4], 6)).toBe(0); // sama luku ei kelpaa
  });
});

describe("scoring — suorat", () => {
  it("Pieni suora 1-2-3-4-5 = 15", () => {
    expect(scoreFor("smallStraight", [1, 2, 3, 4, 5, 5], 6)).toBe(15);
    expect(scoreFor("smallStraight", [2, 3, 4, 5, 6, 6], 6)).toBe(0);
  });
  it("Suuri suora 2-3-4-5-6 = 20", () => {
    expect(scoreFor("largeStraight", [2, 3, 4, 5, 6, 1], 6)).toBe(20);
  });
  it("Täyssuora 1-2-3-4-5-6 = 21", () => {
    expect(scoreFor("fullStraight", [1, 2, 3, 4, 5, 6], 6)).toBe(21);
    expect(scoreFor("fullStraight", [1, 2, 3, 4, 5, 5], 6)).toBe(0);
  });
});

describe("scoring — sattuma & jatsit", () => {
  it("Sattuma = kaikkien noppien summa", () => {
    expect(scoreFor("chance", [1, 2, 3, 4, 5, 6], 6)).toBe(21);
  });
  it("Jatsi = 50 viidellä samalla (myös osana kuutta)", () => {
    expect(scoreFor("yatzy", [4, 4, 4, 4, 4, 1], 6)).toBe(50);
    expect(scoreFor("yatzy", [4, 4, 4, 4, 4, 4], 6)).toBe(50);
    expect(scoreFor("yatzy", [4, 4, 4, 4, 1, 2], 5)).toBe(0);
  });
  it("Superjatsi = 100 kuudella samalla", () => {
    expect(scoreFor("superyatzy", [4, 4, 4, 4, 4, 4], 6)).toBe(100);
    expect(scoreFor("superyatzy", [4, 4, 4, 4, 4, 1], 6)).toBe(0);
  });
});

describe("scoring — absurdit syötteet", () => {
  it("tyhjät nopat → 0", () => {
    expect(scoreFor("pair", [], 6)).toBe(0);
    expect(scoreFor("chance", [], 6)).toBe(0);
    expect(scoreFor("yatzy", [], 6)).toBe(0);
  });
});
