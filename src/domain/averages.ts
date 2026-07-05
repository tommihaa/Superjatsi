import type { DiceCount } from "./types";
import type { StorageLike } from "./storage";

// Pelaajakohtainen keskiarvoseuranta (esikuva: ystävän VBScript-jatsi).
// Jokainen aloitettu peli lasketaan: loppuun pelattu lopputuloksella, kesken
// jätetty siihen asti kertyneellä summalla — keskeyttäminen ei siis koskaan
// tuota enempää kuin loppuun pelaaminen. Top 10 mittaa huippuja, keskiarvo
// johdonmukaisuutta. Avain = pelaajan nimi + variantti (5 ja 6 nopan pelit
// eivät ole vertailukelpoisia). Koko historiasta säilytetään vain juokseva
// summa + pelimäärä; liukuvaa keskiarvoa varten viimeisimmät RECENT_WINDOW
// tulosta — tallennus ei kasva rajatta.

export interface AverageEntry {
  name: string;
  games: number;
  /** Koko historian keskiarvo. */
  average: number;
  /** Viimeisimpien pelien (enintään RECENT_WINDOW) keskiarvo. */
  recentAverage: number;
  recentCount: number;
}

interface PlayerAgg {
  count: number;
  sum: number;
  recent: number[];
}

interface AverageData {
  version: number;
  players: Record<DiceCount, Record<string, PlayerAgg>>;
}

const DEFAULT_KEY = "superjatsi:averages";
const DATA_VERSION = 1;
export const RECENT_WINDOW = 20;

export class AverageStore {
  constructor(
    private readonly backend: StorageLike,
    private readonly key: string = DEFAULT_KEY,
  ) {}

  /** Kirjaa pelin (tai keskeytyksen) tulokset keskiarvoihin. */
  record(diceCount: DiceCount, results: { name: string; score: number }[]): void {
    if (results.length === 0) return;
    const data = this.read();
    for (const r of results) {
      const name = r.name.trim();
      if (!name) continue;
      const agg = data.players[diceCount][name] ?? { count: 0, sum: 0, recent: [] };
      agg.count += 1;
      agg.sum += r.score;
      agg.recent = [...agg.recent, r.score].slice(-RECENT_WINDOW);
      data.players[diceCount][name] = agg;
    }
    this.backend.setItem(this.key, JSON.stringify(data));
  }

  /** Keskiarvot parhaasta huonoimpaan (koko historian keskiarvolla). */
  list(diceCount: DiceCount): AverageEntry[] {
    const players = this.read().players[diceCount];
    return Object.entries(players)
      .map(([name, a]) => ({
        name,
        games: a.count,
        average: a.sum / a.count,
        recentAverage:
          a.recent.length > 0 ? a.recent.reduce((s, v) => s + v, 0) / a.recent.length : 0,
        recentCount: a.recent.length,
      }))
      .sort((x, y) => y.average - x.average);
  }

  clear(): void {
    this.backend.removeItem(this.key);
  }

  private read(): AverageData {
    const empty: AverageData = { version: DATA_VERSION, players: { 5: {}, 6: {} } };
    const raw = this.backend.getItem(this.key);
    if (!raw) return empty;
    try {
      const data = JSON.parse(raw) as AverageData;
      if (data.version !== DATA_VERSION) return empty;
      return {
        version: DATA_VERSION,
        players: { 5: sanitize(data.players?.[5]), 6: sanitize(data.players?.[6]) },
      };
    } catch {
      return empty;
    }
  }
}

/** Hyväksy vain ehjät merkinnät — yksi rikkinäinen ei pilaa koko tallennusta. */
function sanitize(players: unknown): Record<string, PlayerAgg> {
  if (typeof players !== "object" || players === null) return {};
  const out: Record<string, PlayerAgg> = {};
  for (const [name, agg] of Object.entries(players)) {
    const a = agg as PlayerAgg;
    if (
      typeof a === "object" &&
      a !== null &&
      typeof a.count === "number" &&
      a.count > 0 &&
      typeof a.sum === "number" &&
      Array.isArray(a.recent) &&
      a.recent.every((v) => typeof v === "number")
    ) {
      out[name] = { count: a.count, sum: a.sum, recent: a.recent.slice(-RECENT_WINDOW) };
    }
  }
  return out;
}
