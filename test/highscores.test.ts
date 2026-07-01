import { describe, expect, it } from "vitest";
import { HighscoreStore, TOP_N, localToday } from "../src/domain/highscores";
import type { StorageLike } from "../src/domain/storage";

class MockStorage implements StorageLike {
  private store = new Map<string, string>();
  getItem(k: string): string | null {
    return this.store.has(k) ? this.store.get(k)! : null;
  }
  setItem(k: string, v: string): void {
    this.store.set(k, v);
  }
  removeItem(k: string): void {
    this.store.delete(k);
  }
}

const fixedDay = () => "2026-06-10";

function makeStore(backend = new MockStorage()): HighscoreStore {
  return new HighscoreStore(backend, "superjatsi:highscores", fixedDay);
}

describe("localToday", () => {
  it("antaa paikallisen päivän, ei UTC-päivää (keskiyön jälkeen Suomessa)", () => {
    // 2026-07-02 klo 01:30 paikallista aikaa: toISOString antaisi UTC:ssä
    // (itään Greenwichistä) edellisen päivän — localToday ei saa antaa.
    const night = new Date(2026, 6, 2, 1, 30);
    expect(localToday(night)).toBe("2026-07-02");
    expect(localToday(new Date(2026, 0, 5, 12, 0))).toBe("2026-01-05"); // nollatäyttö
  });
});

describe("HighscoreStore", () => {
  it("tyhjä alku → tyhjä lista molemmille varianteille", () => {
    const s = makeStore();
    expect(s.list(5)).toEqual([]);
    expect(s.list(6)).toEqual([]);
  });

  it("submit lisää tulokset parhaasta huonoimpaan ja palauttaa sijoitukset", () => {
    const s = makeStore();
    const ranks = s.submit(6, [
      { name: "A", score: 200 },
      { name: "B", score: 350 },
    ]);
    expect(s.list(6).map((e) => e.name)).toEqual(["B", "A"]);
    expect(s.list(6)[0]).toEqual({ name: "B", score: 350, date: "2026-06-10" });
    expect(ranks).toEqual([0, 1]);
  });

  it("variantit pidetään erillään (5 ja 6 noppaa)", () => {
    const s = makeStore();
    s.submit(5, [{ name: "Viisi", score: 100 }]);
    s.submit(6, [{ name: "Kuusi", score: 100 }]);
    expect(s.list(5).map((e) => e.name)).toEqual(["Viisi"]);
    expect(s.list(6).map((e) => e.name)).toEqual(["Kuusi"]);
  });

  it("lista katkaistaan kymmeneen parhaaseen", () => {
    const s = makeStore();
    for (let i = 1; i <= 12; i++) s.submit(6, [{ name: `P${i}`, score: i * 10 }]);
    const list = s.list(6);
    expect(list).toHaveLength(TOP_N);
    expect(list[0].score).toBe(120);
    expect(list[TOP_N - 1].score).toBe(30); // 10 ja 20 putosivat
  });

  it("listalle pääsemätön tulos → ei sijoitusta", () => {
    const s = makeStore();
    for (let i = 1; i <= TOP_N; i++) s.submit(6, [{ name: `P${i}`, score: 100 + i }]);
    const ranks = s.submit(6, [{ name: "Heikko", score: 5 }]);
    expect(ranks).toEqual([]);
    expect(s.list(6).some((e) => e.name === "Heikko")).toBe(false);
  });

  it("tasapisteissä vanhempi ennätys pysyy edellä", () => {
    const s = makeStore();
    s.submit(6, [{ name: "Vanha", score: 200 }]);
    const ranks = s.submit(6, [{ name: "Uusi", score: 200 }]);
    expect(s.list(6).map((e) => e.name)).toEqual(["Vanha", "Uusi"]);
    expect(ranks).toEqual([1]);
  });

  it("rikkinäinen tallennus → tyhjä lista, ei kaatumista", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:highscores", "{ rikki");
    const s = makeStore(backend);
    expect(s.list(6)).toEqual([]);
    expect(s.submit(6, [{ name: "A", score: 50 }])).toEqual([0]);
  });

  it("rikkinäiset rivit suodatetaan, ehjät säilyvät", () => {
    const backend = new MockStorage();
    backend.setItem(
      "superjatsi:highscores",
      JSON.stringify({
        version: 1,
        scores: { 5: [], 6: [{ name: "Ehjä", score: 99, date: "2026-01-01" }, { name: 42 }, null] },
      }),
    );
    const s = makeStore(backend);
    expect(s.list(6)).toEqual([{ name: "Ehjä", score: 99, date: "2026-01-01" }]);
  });

  it("clear tyhjentää kaikki ennätykset", () => {
    const s = makeStore();
    s.submit(5, [{ name: "A", score: 100 }]);
    s.submit(6, [{ name: "B", score: 100 }]);
    s.clear();
    expect(s.list(5)).toEqual([]);
    expect(s.list(6)).toEqual([]);
  });
});
