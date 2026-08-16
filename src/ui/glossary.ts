// Termimoduuli (TERM_SCHEMA_VERSION = 1). Vendoroitu kopio jaetusta speksistä
// `Kaanon/TERMIMODUULI.md`; sisarkopiot ovat Jaossa (`src/shared/glossary.js`) ja
// Itussa (`src/rules/terms.ts`). Speksi jakaa mekanismin, ei dataa: termistö on
// pelin omaa (`strings.ts` › T.terms). Skeeman muuttuessa bumppaa versio ja
// päivitä kaikki kopiot samalla kertaa.
//
// Moduuli on puhdas: ei DOM-viittauksia, ei riippuvuutta pelilogiikkaan.
// Renderöinti on erikseen `glossary-view.ts`:ssä.

export const TERM_SCHEMA_VERSION = 1;

export interface TermEntry {
  /** Kanoninen termi; myös näyttönimi listanäkymässä. */
  term: string;
  /** Selkokielinen selite, käsin todennettu `SUPERJATSI.md`:tä vasten. */
  selitys: string;
  /** Esiintymät joita tekstistä haetaan. `vartalo*` = alkuosuma sanarajaan asti. */
  match: readonly string[];
  /** Ryhmittelyavain listanäkymää varten. */
  kategoria: string;
  /** Konkreettinen esimerkki. */
  esimerkki?: string;
  /** Ikoni listanäkymässä. */
  emoji?: string;
}

export interface TextPart {
  text: string;
  isTerm: boolean;
  /** Kanoninen termi (ei osuman kirjoitusasu) kun isTerm on tosi. */
  term?: string;
}

/** Sanarajaluokka kattaa myös ääkköset: "Suoraa" ei saa osua termiin "suora". */
const WORD = "[a-zA-ZäöåÄÖÅ0-9]";

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isWordChar = (c: string | undefined): boolean => c !== undefined && new RegExp(WORD).test(c);

/**
 * Pilkkoo tekstin osiin, joissa termiosumat on merkitty. Kontrakti on
 * `TERMIMODUULI.md` › Moottorin kontrakti (kuusi kohtaa).
 */
export function splitWithGlossary(text: string, entries: readonly TermEntry[]): TextPart[] {
  const pats: { re: string; term: string; len: number }[] = [];
  for (const e of entries) {
    for (const raw of e.match ?? []) {
      const stem = raw.endsWith("*");
      const body = stem ? raw.slice(0, -1) : raw;
      if (body.length === 0) continue;
      // `*` ei laske pituuteen: lajittelu vertaa vain kiinteää osaa.
      pats.push({ re: escapeRe(body) + (stem ? `${WORD}*` : ""), term: e.term, len: body.length });
    }
  }
  // Kontraktin kohta 6: tyhjä kuviolista tuottaisi lausekkeen `()`, joka osuu
  // nollan mittaisena eikä kuluta tekstiä (ikuinen silmukka). Vartija ennen regexiä.
  if (pats.length === 0) return [{ text, isTerm: false }];

  // Kohta 1: pisin ensin. JS:n vaihtoehtolista valitsee ensimmäisen osuvan,
  // joten järjestys ratkaisee "Kolme paria" vs. "Pari".
  pats.sort((a, b) => b.len - a.len);
  const re = new RegExp(pats.map((p) => `(${p.re})`).join("|"), "gi");

  const parts: TextPart[] = [];
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const hit = m[0];
    if (hit.length === 0) {
      re.lastIndex = m.index + 1;
      continue;
    }
    // Kohta 2: sanaraja molemmin puolin.
    const before = text[m.index - 1];
    const after = text[m.index + hit.length];
    if (isWordChar(before) || isWordChar(after)) {
      re.lastIndex = m.index + 1;
      continue;
    }
    // Osuneen vaihtoehdon indeksi kertoo kanonisen termin (kohta 4).
    const gi = m.findIndex((g, i) => i > 0 && g !== undefined) - 1;
    if (m.index > cursor) parts.push({ text: text.slice(cursor, m.index), isTerm: false });
    parts.push({ text: hit, isTerm: true, term: pats[gi].term });
    cursor = m.index + hit.length;
    re.lastIndex = cursor;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), isTerm: false });
  // Kohta 5: myös osumaton teksti palautuu yhtenä osana.
  if (parts.length === 0) parts.push({ text, isTerm: false });
  return parts;
}

/** Termin haku kanonisella nimellä (renderöijän ja selitteen yhteinen tarve). */
export function findTerm(term: string, entries: readonly TermEntry[]): TermEntry | undefined {
  return entries.find((e) => e.term === term);
}

/** Listanäkymän ryhmittely: kategoriat esiintymisjärjestyksessä, ei aakkosissa. */
export function groupByCategory(entries: readonly TermEntry[]): { kategoria: string; terms: TermEntry[] }[] {
  const groups: { kategoria: string; terms: TermEntry[] }[] = [];
  for (const e of entries) {
    let g = groups.find((x) => x.kategoria === e.kategoria);
    if (!g) {
      g = { kategoria: e.kategoria, terms: [] };
      groups.push(g);
    }
    g.terms.push(e);
  }
  return groups;
}
