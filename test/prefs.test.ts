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
  it("tallennus → lataus säilyttää nimet ja variantin (round-trip)", () => {
    const p = new SetupPrefs(new MockStorage());
    p.save({ names: ["Tommi", "Aino", "Pelaaja 3"], diceCount: 5 });
    expect(p.load()).toEqual({ names: ["Tommi", "Aino", "Pelaaja 3"], diceCount: 5 });
  });

  it("vanha tallenne ilman varianttia kelpaa (nimet ilman diceCountia)", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:setup", JSON.stringify({ version: 1, names: ["A", "B"] }));
    expect(new SetupPrefs(backend).load()).toEqual({ names: ["A", "B"] });
  });

  it("tuntematon variantti pudotetaan, nimet säilyvät", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:setup", JSON.stringify({ version: 1, names: ["A"], diceCount: 7 }));
    expect(new SetupPrefs(backend).load()).toEqual({ names: ["A"] });
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
  it("oletus on pois ja teema oletus kun tallennusta ei ole", () => {
    expect(new SoundPrefs(new MockStorage()).load()).toEqual({ enabled: false, theme: "oletus" });
  });

  it("tallennus → lataus säilyttää valinnan ja teeman (round-trip)", () => {
    const p = new SoundPrefs(new MockStorage());
    p.save({ enabled: true, theme: "torvi-kannel" });
    expect(p.load()).toEqual({ enabled: true, theme: "torvi-kannel" });
    p.save({ enabled: false, theme: "oletus" });
    expect(p.load()).toEqual({ enabled: false, theme: "oletus" });
  });

  it("rikkinäinen tai vääränmuotoinen tallennus → oletukset, ei kaatumista", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:sound", "{ rikki");
    expect(new SoundPrefs(backend).load()).toEqual({ enabled: false, theme: "oletus" });
    backend.setItem("superjatsi:sound", JSON.stringify({ version: 99, enabled: true, theme: "torvi-kannel" }));
    expect(new SoundPrefs(backend).load()).toEqual({ enabled: false, theme: "oletus" });
    backend.setItem("superjatsi:sound", JSON.stringify({ version: 1, enabled: "kyllä" }));
    expect(new SoundPrefs(backend).load()).toEqual({ enabled: false, theme: "oletus" });
  });

  it("vanha tallenne ilman theme-kenttää → teema oletus", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:sound", JSON.stringify({ version: 1, enabled: true }));
    expect(new SoundPrefs(backend).load()).toEqual({ enabled: true, theme: "oletus" });
  });

  it("tuntematon theme-arvo → oletus, enabled säilyy", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:sound", JSON.stringify({ version: 1, enabled: true, theme: "roska" }));
    expect(new SoundPrefs(backend).load()).toEqual({ enabled: true, theme: "oletus" });
  });
});
