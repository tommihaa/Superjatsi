// Termimoduulin renderöijä: vanilla-DOM ilman Reactia, HTML-merkkijonoina samaan
// tapaan kuin muut overlayt (`app.ts`). Moottori (`glossary.ts`) on tästä erillään,
// koska se on vendoroitu kopio jaetusta speksistä eikä saa tuntea tätä pintaa.
//
// UX-konventio on speksin (Kaanon/TERMIMODUULI.md): termi näkyy tekstissä
// katkoviiva-alleviivattuna, napautus avaa selitteen tekstin alle, ja toinen
// termi korvaa avoimen selitteen.

import { groupByCategory, splitWithGlossary, type TermEntry } from "./glossary";

export const esc = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Yksi sääntörivi termit korostettuina. */
export function rulesLineHtml(
  line: { label: string; text: string },
  terms: readonly TermEntry[],
): string {
  const parts = splitWithGlossary(line.text, terms)
    .map((p) =>
      p.isTerm
        ? `<button type="button" class="term" data-term="${esc(p.term!)}">${esc(p.text)}</button>`
        : esc(p.text),
    )
    .join("");
  return `<li><b>${esc(line.label)}:</b> ${parts}</li>`;
}

export function rulesListHtml(
  lines: readonly { label: string; text: string }[],
  terms: readonly TermEntry[],
): string {
  return `<ul class="rules-list">${lines.map((l) => rulesLineHtml(l, terms)).join("")}</ul>`;
}

/** Selite, joka avataan termin alle. Sama merkintä käytössä myös listanäkymässä. */
export function termNoteHtml(entry: TermEntry): string {
  const example = entry.esimerkki ? `<span class="term-example">${esc(entry.esimerkki)}</span>` : "";
  return `<div class="term-note"><b>${esc(entry.term)}</b><span>${esc(entry.selitys)}</span>${example}</div>`;
}

/** Listanäkymä: kaikki termit kategorioittain, skeeman `kategoria`-kenttää käyttäen.
 *  Lista on `details`in sisällä, jotta säännöt mahtuvat paneeliin ilman rullausta. */
export function glossaryListHtml(terms: readonly TermEntry[], title: string, hint: string): string {
  const groups = groupByCategory(terms)
    .map((g) => {
      const rows = g.terms
        .map(
          (t) =>
            `<div class="gloss-term"><b>${t.emoji ? `${esc(t.emoji)} ` : ""}${esc(t.term)}</b>` +
            `<span>${esc(t.selitys)}</span>` +
            (t.esimerkki ? `<span class="term-example">${esc(t.esimerkki)}</span>` : "") +
            `</div>`,
        )
        .join("");
      return `<div class="gloss-group"><h4>${esc(g.kategoria)}</h4>${rows}</div>`;
    })
    .join("");
  return (
    `<details class="gloss-details"><summary>${esc(title)}</summary>` +
    `<p class="gloss-hint">${esc(hint)}</p><div class="glossary">${groups}</div></details>`
  );
}
