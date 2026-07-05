import { describe, expect, it } from "vitest";
import { SetupPrefs, SoundPrefs } from "../src/domain/prefs";
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

describe("SoundPrefs", () => {
  it("oletus on päällä kun tallennusta ei ole", () => {
    expect(new SoundPrefs(new MockStorage()).load()).toBe(true);
  });

  it("tallennus → lataus säilyttää valinnan (round-trip)", () => {
    const p = new SoundPrefs(new MockStorage());
    p.save(false);
    expect(p.load()).toBe(false);
    p.save(true);
    expect(p.load()).toBe(true);
  });

  it("rikkinäinen tai vääränmuotoinen tallennus → oletus päällä, ei kaatumista", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:sound", "{ rikki");
    expect(new SoundPrefs(backend).load()).toBe(true);
    backend.setItem("superjatsi:sound", JSON.stringify({ version: 99, enabled: false }));
    expect(new SoundPrefs(backend).load()).toBe(true);
    backend.setItem("superjatsi:sound", JSON.stringify({ version: 1, enabled: "ei" }));
    expect(new SoundPrefs(backend).load()).toBe(true);
  });
});
