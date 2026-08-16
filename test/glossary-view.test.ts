import { describe, expect, it } from "vitest";
import {
  esc,
  glossaryListHtml,
  rulesLineHtml,
  rulesListHtml,
  termNoteHtml,
} from "../src/ui/glossary-view";
import type { TermEntry } from "../src/ui/glossary";
import { T } from "../src/ui/strings";

// Renderöijä palauttaa HTML-merkkijonoja (sama tyyli kuin muut overlayt),
// joten testit ajavat node-ympäristössä ilman jsdomia.

const entries: TermEntry[] = [
  { term: "Pari", selitys: "Kaksi samaa.", match: ["pari*"], kategoria: "Kombot", esimerkki: "5 5 → 10 p." },
  { term: "Sarake", selitys: "Pystyrivi.", match: ["sarak*"], kategoria: "Tulokortti", emoji: "↓" },
];

describe("rulesLineHtml", () => {
  it("kietoo termin napiksi ja jättää muun tekstin ennalleen", () => {
    const html = rulesLineHtml({ label: "Kombot", text: "yksi pari riittää" }, entries);
    expect(html).toBe(
      '<li><b>Kombot:</b> yksi <button type="button" class="term" data-term="Pari">pari</button> riittää</li>',
    );
  });

  it("escapaa sekä nimiön että tekstin", () => {
    const html = rulesLineHtml({ label: "A<b>", text: "x & <script>" }, entries);
    expect(html).toContain("A&lt;b&gt;");
    expect(html).toContain("x &amp; &lt;script&gt;");
    expect(html).not.toContain("<script>");
  });

  it("lista sisältää yhden li-alkion per sääntörivi", () => {
    const html = rulesListHtml(T.rulesLines, T.terms);
    expect(html.match(/<li>/g)).toHaveLength(T.rulesLines.length);
    expect(html).toContain('class="rules-list"');
  });
});

describe("termNoteHtml", () => {
  it("näyttää kanonisen termin, selitteen ja esimerkin", () => {
    const html = termNoteHtml(entries[0]);
    expect(html).toContain("<b>Pari</b>");
    expect(html).toContain("Kaksi samaa.");
    expect(html).toContain('<span class="term-example">5 5 → 10 p.</span>');
  });

  it("jättää esimerkkilohkon pois kun kenttää ei ole", () => {
    expect(termNoteHtml(entries[1])).not.toContain("term-example");
  });
});

describe("glossaryListHtml", () => {
  it("ryhmittelee kategorioittain ja ottaa emojin mukaan", () => {
    const html = glossaryListHtml(entries, "Sanasto", "Napauta");
    expect(html).toContain("<summary>Sanasto</summary>");
    expect(html).toContain("<h4>Kombot</h4>");
    expect(html).toContain("<h4>Tulokortti</h4>");
    expect(html).toContain("<b>↓ Sarake</b>");
  });

  it("listaa jokaisen Superjatsin termin täsmälleen kerran", () => {
    const html = glossaryListHtml(T.terms, T.glossaryTitle, T.glossaryHint);
    expect(html.match(/class="gloss-term"/g)).toHaveLength(T.terms.length);
  });
});

describe("esc", () => {
  it("escapaa lainausmerkin, jotta data-term ei katkea attribuutista", () => {
    expect(esc('a"b')).toBe("a&quot;b");
  });
});
