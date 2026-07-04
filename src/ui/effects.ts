// Juhlaefektit erinomaiselle heitolle. Väri on --accent (sama kuin tulokortin
// ★-maksimimerkki) — kulta on varattu lukitus-/pending-tilalle (ks. CLAUDE.md).
// Kumpikin efekti on puhtaasti koristeellinen: ei estä klikkauksia eikä muuta tilaa,
// ja prefers-reduced-motion kytkee sen kokonaan pois.

/** Tähtisade koko näkymän yli (~2 s), poistaa itsensä lopuksi. */
export function starStorm(count = 26): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const host = document.createElement("div");
  host.className = "star-storm";
  host.setAttribute("aria-hidden", "true");
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "storm-star";
    s.textContent = "★";
    s.style.left = `${Math.random() * 100}%`;
    s.style.animationDelay = `${Math.random() * 0.5}s`;
    s.style.animationDuration = `${1 + Math.random() * 0.8}s`;
    s.style.fontSize = `${0.6 + Math.random() * 0.9}rem`;
    host.append(s);
  }
  document.body.append(host);
  setTimeout(() => host.remove(), 2600);
}

/** Soluhehku: kolme sykäystä annettuihin soluihin (~1.5 s). Kohteet tulevat
 *  view'n celebrationCells-listasta, jotta hehku osuu juhlan aiheuttajiin
 *  (myös ei-maksimi kolme paria ja bonuksen varmistava kirjaus). */
export function glowCells(
  root: ParentNode,
  cells: ReadonlyArray<{ columnId: string; rowId: string }>,
): void {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (const c of cells) {
    const td = root.querySelector<HTMLElement>(`td[data-col="${c.columnId}"][data-row="${c.rowId}"]`);
    if (!td) continue;
    td.classList.remove("max-glow"); // uudelleenkäynnistys jos edellinen kesken
    void td.offsetWidth;
    td.classList.add("max-glow");
    td.addEventListener("animationend", () => td.classList.remove("max-glow"), { once: true });
  }
}
