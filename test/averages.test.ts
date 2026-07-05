import { describe, expect, it } from "vitest";
import { AverageStore, RECENT_WINDOW } from "../src/domain/averages";
import type { StorageLike } from "../src/domain/storage";

class MockStorage implements StorageLike {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
}

function makeStore(backend: StorageLike = new MockStorage()): AverageStore {
  return new AverageStore(backend);
}

describe("AverageStore", () => {
  it("kirjaa pelit ja laskee koko historian keskiarvon", () => {
    const store = makeStore();
    store.record(6, [{ name: "Tommi", score: 200 }]);
    store.record(6, [{ name: "Tommi", score: 300 }]);
    const [entry] = store.list(6);
    expect(entry.name).toBe("Tommi");
    expect(entry.games).toBe(2);
    expect(entry.average).toBe(250);
  });

  it("pitää variantit erillään", () => {
    const store = makeStore();
    store.record(5, [{ name: "Tommi", score: 100 }]);
    store.record(6, [{ name: "Tommi", score: 400 }]);
    expect(store.list(5)[0].average).toBe(100);
    expect(store.list(6)[0].average).toBe(400);
  });

  it("kirjaa monipelin kaikki pelaajat ja lajittelee keskiarvolla", () => {
    const store = makeStore();
    store.record(6, [
      { name: "Aino", score: 100 },
      { name: "Björn", score: 300 },
    ]);
    const entries = store.list(6);
    expect(entries.map((e) => e.name)).toEqual(["Björn", "Aino"]);
  });

  it("liukuva ikkuna kattaa vain viimeisimmät RECENT_WINDOW peliä", () => {
    const store = makeStore();
    // RECENT_WINDOW peliä arvolla 100, sitten 1 peli arvolla 100+RECENT_WINDOW*10.
    for (let i = 0; i < RECENT_WINDOW; i++) store.record(6, [{ name: "T", score: 100 }]);
    store.record(6, [{ name: "T", score: 100 + RECENT_WINDOW * 10 }]);
    const [e] = store.list(6);
    expect(e.games).toBe(RECENT_WINDOW + 1);
    expect(e.recentCount).toBe(RECENT_WINDOW);
    // Ikkunassa: (RECENT_WINDOW-1) × 100 + (100 + RECENT_WINDOW*10) → avg 100+10=110.
    expect(e.recentAverage).toBe(110);
    // Koko historia sisältää myös pudonneen ensimmäisen pelin → eri keskiarvo.
    expect(e.average).toBeLessThan(110);
  });

  it("ohittaa tyhjät nimet ja trimmaa", () => {
    const store = makeStore();
    store.record(6, [
      { name: "  ", score: 100 },
      { name: " Tommi ", score: 200 },
    ]);
    const entries = store.list(6);
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("Tommi");
  });

  it("rikkinäinen tallennus ei kaada — palautuu tyhjänä", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:averages", "{roskaa");
    const store = makeStore(backend);
    expect(store.list(6)).toEqual([]);
    // Rikkinäinen merkintä ehjän rinnalla suodattuu, ehjä säilyy.
    backend.setItem(
      "superjatsi:averages",
      JSON.stringify({
        version: 1,
        players: { 5: {}, 6: { Ehjä: { count: 2, sum: 500, recent: [200, 300] }, Rikki: { count: "x" } } },
      }),
    );
    const entries = makeStore(backend).list(6);
    expect(entries).toHaveLength(1);
    expect(entries[0].average).toBe(250);
  });

  it("clear tyhjentää kaiken", () => {
    const store = makeStore();
    store.record(6, [{ name: "Tommi", score: 200 }]);
    store.clear();
    expect(store.list(6)).toEqual([]);
  });
});
