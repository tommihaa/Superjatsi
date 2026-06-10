import { describe, expect, it } from "vitest";
import { SetupPrefs } from "../src/domain/prefs";
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

describe("SetupPrefs", () => {
  it("tallennus → lataus säilyttää nimet (round-trip)", () => {
    const p = new SetupPrefs(new MockStorage());
    p.save({ names: ["Tommi", "Aino", "Pelaaja 3"] });
    expect(p.load()).toEqual({ names: ["Tommi", "Aino", "Pelaaja 3"] });
  });

  it("puuttuva tallennus → null", () => {
    expect(new SetupPrefs(new MockStorage()).load()).toBeNull();
  });

  it("rikkinäinen tallennus → null, ei kaatumista", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:setup", "{ rikki");
    expect(new SetupPrefs(backend).load()).toBeNull();
  });

  it("ei-merkkijonot suodatetaan, ylimääräiset katkaistaan kuuteen", () => {
    const backend = new MockStorage();
    backend.setItem(
      "superjatsi:setup",
      JSON.stringify({ version: 1, names: ["A", 42, "B", null, "C", "D", "E", "F", "G"] }),
    );
    expect(new SetupPrefs(backend).load()).toEqual({ names: ["A", "B", "C", "D", "E", "F"] });
  });

  it("vanha versio tai tyhjä nimilista → null", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:setup", JSON.stringify({ version: 99, names: ["A"] }));
    expect(new SetupPrefs(backend).load()).toBeNull();
    backend.setItem("superjatsi:setup", JSON.stringify({ version: 1, names: [] }));
    expect(new SetupPrefs(backend).load()).toBeNull();
  });
});
