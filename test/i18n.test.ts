import { afterEach, describe, expect, it } from "vitest";
import { ALL_ROWS } from "../src/domain/categories";
import { LANGS, LangPrefs } from "../src/domain/prefs";
import type { StorageLike } from "../src/domain/storage";
import { splitWithGlossary } from "../src/ui/glossary";
import { fi } from "../src/ui/locales/fi";
import { sv } from "../src/ui/locales/sv";
import { en } from "../src/ui/locales/en";
import { T, detectLang, getLang, resolveInitialLang, setLang } from "../src/ui/strings";

// Kielikerros (3.9.2026): tallennus, alkukielen päättely, elävä T ja localejen
// pariteetti. Pariteetin varsinainen portti on tsc (`Strings`-tyyppi); tässä
// todennetaan sama ajonaikaisesti, jotta puute näkyy testinä eikä vain buildissa.

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

describe("LangPrefs", () => {
  it("tallennus → lataus (round-trip)", () => {
    const p = new LangPrefs(new MockStorage());
    p.save("sv");
    expect(p.load()).toBe("sv");
  });

  it("puuttuva tallennus → null (kieli päätellään selaimesta)", () => {
    expect(new LangPrefs(new MockStorage()).load()).toBeNull();
  });

  it("tuntematon kieli tai rikkinäinen JSON → null", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:lang", JSON.stringify({ version: 1, lang: "de" }));
    expect(new LangPrefs(backend).load()).toBeNull();
    backend.setItem("superjatsi:lang", "{rikki");
    expect(new LangPrefs(backend).load()).toBeNull();
  });
});

describe("alkukielen päättely", () => {
  it("selaimen kieli: fi ja sv tunnistetaan, muu ja puuttuva putoaa englantiin", () => {
    expect(detectLang("fi-FI")).toBe("fi");
    expect(detectLang("fi")).toBe("fi");
    expect(detectLang("sv-SE")).toBe("sv");
    expect(detectLang("sv")).toBe("sv");
    expect(detectLang("en-US")).toBe("en");
    expect(detectLang("de-DE")).toBe("en");
    expect(detectLang(undefined)).toBe("en");
  });

  it("URL-parametri voittaa tallennetun, tallennettu selaimen", () => {
    expect(resolveInitialLang("sv", "fi", "fi-FI")).toBe("sv");
    expect(resolveInitialLang(null, "sv", "fi-FI")).toBe("sv");
    expect(resolveInitialLang(null, null, "sv-FI")).toBe("sv");
    expect(resolveInitialLang("de", null, "fi-FI")).toBe("fi");
    expect(resolveInitialLang(null, null, "de-DE")).toBe("en");
    expect(resolveInitialLang("en", "sv", "fi-FI")).toBe("en");
  });
});

describe("elävä T", () => {
  afterEach(() => setLang("fi"));

  it("oletus on suomi", () => {
    expect(getLang()).toBe("fi");
    expect(T.tagline).toBe(fi.tagline);
  });

  it("setLang vaihtaa tekstit, myös sisäkkäiset ja funktiot", () => {
    setLang("sv");
    expect(T.tagline).toBe(sv.tagline);
    expect(T.rows.ones.label).toBe("Ettor");
    expect(T.colLabel.ALAS).toBe("NER");
    expect(T.rollsLeft(2)).toBe("2 kast kvar");
    setLang("fi");
    expect(T.rows.ones.label).toBe("Ykköset");
  });

  it("erisnimet pysyvät kielestä riippumatta", () => {
    for (const lang of ["sv", "en"] as const) {
      setLang(lang);
      expect(T.title).toBe("Superjatsi");
      expect(T.rows.yatzy.label).toBe("Jatsi");
      expect(T.rows.superyatzy.label).toBe("Superjatsi");
    }
  });
});

describe("localejen pariteetti", () => {
  const locales = { fi, sv, en } as const;
  const others = [
    ["sv", sv],
    ["en", en],
  ] as const;

  it("LANGS ja localet vastaavat toisiaan", () => {
    expect(Object.keys(locales).sort()).toEqual([...LANGS].sort());
  });

  it.each(others)("%s: täsmälleen suomen avaimet samoin tyypein", (_lang, L) => {
    const fiKeys = Object.keys(fi).sort();
    expect(Object.keys(L).sort()).toEqual(fiKeys);
    for (const k of fiKeys) {
      const key = k as keyof typeof fi;
      expect(typeof L[key], key).toBe(typeof fi[key]);
    }
  });

  it.each(others)("%s: jokaisella rivillä on nimi ja selite samoilla riveillä kuin suomessa", (_lang, L) => {
    for (const r of ALL_ROWS) {
      expect(fi.rows[r.id].label.length, r.id).toBeGreaterThan(0);
      expect(L.rows[r.id].label.length, r.id).toBeGreaterThan(0);
      // Selite on alaosan riveillä, ei yläosan.
      expect(L.rows[r.id].description !== undefined, r.id).toBe(fi.rows[r.id].description !== undefined);
    }
  });

  it.each(others)("%s: sääntörivien, termien ja asennusohjeiden määrät täsmäävät", (_lang, L) => {
    expect(L.rulesLines).toHaveLength(fi.rulesLines.length);
    expect(L.terms).toHaveLength(fi.terms.length);
    expect(L.aboutParas).toHaveLength(fi.aboutParas.length);
    expect(L.installGroups.map((g) => g.rows.length)).toEqual(fi.installGroups.map((g) => g.rows.length));
    expect(Object.keys(L.sfxLabels)).toEqual(Object.keys(fi.sfxLabels));
  });

  it.each(others)("%s: suuntasarakkeet osuvat sääntötekstissä vain isoina kirjoitettuina", (_lang, L) => {
    // Ruotsin "upp"/"ner" ja englannin "up"/"down" ovat tavallisia sanoja; moottori
    // on case-insensitive, joten suuntasana proosassa korostuisi sarakkeena
    // (suomen alas/ylös-ansa).
    for (const line of L.rulesLines) {
      const hits = splitWithGlossary(line.text, L.terms).filter((p) => p.isTerm);
      for (const col of [L.colLabel.ALAS, L.colLabel.YLOS]) {
        const asTerm = hits.filter((p) => p.term === col).length;
        const literal = (line.text.match(new RegExp(`\\b${col}\\b`, "g")) ?? []).length;
        expect(asTerm, `${line.label}: ${col}`).toBe(literal);
      }
    }
  });
});
