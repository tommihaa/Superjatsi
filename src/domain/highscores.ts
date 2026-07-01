import type { DiceCount } from "./types";
import type { StorageLike } from "./storage";

// Paikallinen ennätyslista (top 10 per noppavariantti). Sama periaate kuin
// GamePersistence: backend injektoidaan testattavuuden takia, lataus on
// turvallinen (rikkinäinen tallennus → tyhjä lista, ei kaatumista).
// Data ei poistu laitteelta — pelkkä localStorage.

export interface HighscoreEntry {
  name: string;
  score: number;
  /** Päivä ISO-muodossa (YYYY-MM-DD) — kellonaikaa ei tallenneta. */
  date: string;
}

export interface ScoreResult {
  name: string;
  score: number;
}

interface HighscoreData {
  version: number;
  scores: Record<DiceCount, HighscoreEntry[]>;
}

const DEFAULT_KEY = "superjatsi:highscores";
const DATA_VERSION = 1;
export const TOP_N = 10;

/** Paikallinen päivä YYYY-MM-DD — EI toISOString(), joka antaisi UTC-päivän
 *  (Suomessa klo 00–03 pelatut pelit kirjautuisivat edelliselle päivälle). */
export function localToday(now: Date = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${m}-${d}`;
}

export class HighscoreStore {
  constructor(
    private readonly backend: StorageLike,
    private readonly key: string = DEFAULT_KEY,
    private readonly today: () => string = localToday,
  ) {}

  /** Ennätykset parhaasta huonoimpaan; tasapisteissä vanhempi edellä. */
  list(diceCount: DiceCount): HighscoreEntry[] {
    return this.read().scores[diceCount];
  }

  /**
   * Kirjaa pelin lopputulokset listalle. Palauttaa listalle päässeiden
   * sijoitukset (0-pohjaiset indeksit uudessa listassa) korostusta varten.
   */
  submit(diceCount: DiceCount, results: ScoreResult[]): number[] {
    const data = this.read();
    const date = this.today();
    const fresh: HighscoreEntry[] = results.map((r) => ({ name: r.name, score: r.score, date }));

    // Vakaa lajittelu: vanhat ensin → tasapisteissä aiempi ennätys pitää paikkansa.
    const merged = [...data.scores[diceCount], ...fresh]
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_N);

    data.scores[diceCount] = merged;
    this.backend.setItem(this.key, JSON.stringify(data));
    return merged.flatMap((e, i) => (fresh.includes(e) ? [i] : []));
  }

  clear(): void {
    this.backend.removeItem(this.key);
  }

  private read(): HighscoreData {
    const empty: HighscoreData = { version: DATA_VERSION, scores: { 5: [], 6: [] } };
    const raw = this.backend.getItem(this.key);
    if (!raw) return empty;
    try {
      const data = JSON.parse(raw) as HighscoreData;
      if (data.version !== DATA_VERSION) return empty;
      return {
        version: DATA_VERSION,
        scores: { 5: sanitize(data.scores?.[5]), 6: sanitize(data.scores?.[6]) },
      };
    } catch {
      return empty;
    }
  }
}

/** Hyväksy vain ehjät merkinnät — yksi rikkinäinen rivi ei pilaa koko listaa. */
function sanitize(entries: unknown): HighscoreEntry[] {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter(
      (e): e is HighscoreEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as HighscoreEntry).name === "string" &&
        typeof (e as HighscoreEntry).score === "number" &&
        typeof (e as HighscoreEntry).date === "string",
    )
    .slice(0, TOP_N);
}
