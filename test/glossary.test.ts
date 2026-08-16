import { describe, expect, it } from "vitest";
import {
  TERM_SCHEMA_VERSION,
  findTerm,
  groupByCategory,
  splitWithGlossary,
  type TermEntry,
} from "../src/ui/glossary";
import { T } from "../src/ui/strings";

// Testit on kirjoitettu Kaanon/TERMIMODUULI.md:n moottorikontraktia vasten
// (kuusi kohtaa), ei sisarkopioita lukemalla.

const entries: TermEntry[] = [
  { term: "Pari", selitys: "kaksi samaa", match: ["pari*"], kategoria: "Kombot" },
  { term: "Kolme paria", selitys: "kolme eri paria", match: ["kolme paria"], kategoria: "Kombot" },
  { term: "Sarake", selitys: "pystyrivi", match: ["sarak*"], kategoria: "Tulokortti" },
  { term: "ALAS", selitys: "ylhäältä alas", match: ["ALAS"], kategoria: "Tulokortti" },
];

const terms = (parts: ReturnType<typeof splitWithGlossary>) =>
  parts.filter((p) => p.isTerm).map((p) => p.term);

describe("splitWithGlossary — kontrakti", () => {
  it("1. pisin ensin: 'Kolme paria' voittaa 'Pari'-kuvion", () => {
    const parts = splitWithGlossary("Kolme paria on 26 p.", entries);
    expect(terms(parts)).toEqual(["Kolme paria"]);
    expect(parts[0]).toEqual({ text: "Kolme paria", isTerm: true, term: "Kolme paria" });
  });

  it("2. sanaraja: osuma ei ala eikä pääty kirjaimen keskeltä", () => {
    // "apari" ja "1pari" eivät ole osumia, "pari." on.
    expect(terms(splitWithGlossary("apari", entries))).toEqual([]);
    expect(terms(splitWithGlossary("7pari", entries))).toEqual([]);
    expect(terms(splitWithGlossary("(pari)", entries))).toEqual(["Pari"]);
  });

  it("2. sanaraja tuntee ääkköset: 'ALASajo' ei osu", () => {
    expect(terms(splitWithGlossary("ALASÄ", entries))).toEqual([]);
    expect(terms(splitWithGlossary("ÄALAS", entries))).toEqual([]);
  });

  it("3. vartalohaku: 'sarak*' osuu taivutuksiin sanarajaan asti", () => {
    const parts = splitWithGlossary("Sarakkeiden ja sarakkeessa", entries);
    expect(terms(parts)).toEqual(["Sarake", "Sarake"]);
    expect(parts.filter((p) => p.isTerm).map((p) => p.text)).toEqual([
      "Sarakkeiden",
      "sarakkeessa",
    ]);
  });

  it("4. case-insensitive, mutta term on kanoninen ja teksti alkuperäinen", () => {
    const parts = splitWithGlossary("PARI ja Pari", entries);
    expect(terms(parts)).toEqual(["Pari", "Pari"]);
    expect(parts.filter((p) => p.isTerm).map((p) => p.text)).toEqual(["PARI", "Pari"]);
  });

  it("5. osumattomat välit palautuvat isTerm: false -osina", () => {
    const parts = splitWithGlossary("Yksi pari riittää", entries);
    expect(parts).toEqual([
      { text: "Yksi ", isTerm: false },
      { text: "pari", isTerm: true, term: "Pari" },
      { text: " riittää", isTerm: false },
    ]);
  });

  it("5. teksti ilman osumia palautuu yhtenä osana", () => {
    expect(splitWithGlossary("Ei mitään tuttua", entries)).toEqual([
      { text: "Ei mitään tuttua", isTerm: false },
    ]);
  });

  it("6. tyhjä kuviolista ei jää ikuiseen silmukkaan", () => {
    expect(splitWithGlossary("teksti", [])).toEqual([{ text: "teksti", isTerm: false }]);
    const noMatches: TermEntry[] = [{ term: "X", selitys: "", match: [], kategoria: "K" }];
    expect(splitWithGlossary("teksti", noMatches)).toEqual([{ text: "teksti", isTerm: false }]);
    const emptyPattern: TermEntry[] = [{ term: "X", selitys: "", match: ["", "*"], kategoria: "K" }];
    expect(splitWithGlossary("teksti", emptyPattern)).toEqual([{ text: "teksti", isTerm: false }]);
  });

  it("regexin erikoismerkit eivät karkaa kuviosta", () => {
    const dotted: TermEntry[] = [{ term: "P.", selitys: "", match: ["p."], kategoria: "K" }];
    expect(terms(splitWithGlossary("pa", dotted))).toEqual([]);
    expect(terms(splitWithGlossary("p.", dotted))).toEqual(["P."]);
  });
});

describe("Superjatsin termistö", () => {
  it("skeemaversio on 1 ja jokaisella termillä on pakolliset kentät", () => {
    expect(TERM_SCHEMA_VERSION).toBe(1);
    for (const t of T.terms) {
      expect(t.term.length).toBeGreaterThan(0);
      expect(t.selitys.length).toBeGreaterThan(0);
      expect(t.kategoria.length).toBeGreaterThan(0);
      expect(t.match.length).toBeGreaterThan(0);
    }
  });

  it("kanoniset termit ovat uniikkeja", () => {
    const names = T.terms.map((t) => t.term);
    expect(new Set(names).size).toBe(names.length);
  });

  it("jokainen sääntörivi tuottaa vähintään yhden termiosuman", () => {
    for (const line of T.rulesLines) {
      const hits = splitWithGlossary(line.text, T.terms).filter((p) => p.isTerm);
      expect(hits.length, `sääntörivi "${line.label}"`).toBeGreaterThan(0);
    }
  });

  it("jokainen osuma osoittaa olemassa olevaan termiin", () => {
    for (const line of T.rulesLines) {
      for (const p of splitWithGlossary(line.text, T.terms)) {
        if (p.isTerm) expect(findTerm(p.term!, T.terms), p.term).toBeDefined();
      }
    }
  });

  it("kombot-rivi korostaa kaikki neljätoista alaosan kategoriaa", () => {
    const line = T.rulesLines.find((l) => l.label === "Kombot")!;
    const hit = new Set(
      splitWithGlossary(line.text, T.terms)
        .filter((p) => p.isTerm)
        .map((p) => p.term),
    );
    for (const t of T.terms.filter((x) => x.kategoria === "Kombot")) {
      expect(hit.has(t.term), t.term).toBe(true);
    }
    expect(T.terms.filter((x) => x.kategoria === "Kombot")).toHaveLength(14);
  });

  it("ryhmittely säilyttää kaikki termit ja kategorioiden esiintymisjärjestyksen", () => {
    const groups = groupByCategory(T.terms);
    expect(groups.map((g) => g.kategoria)).toEqual(["Tulokortti", "Vuoro", "Kombot"]);
    expect(groups.reduce((n, g) => n + g.terms.length, 0)).toBe(T.terms.length);
  });
});
