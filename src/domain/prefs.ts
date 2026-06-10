import type { StorageLike } from "./storage";

// Aloitusnäytön valintojen (pelaajien nimet → määrä) muistaminen yli session.
// Sama kaava kuin GamePersistence/HighscoreStore: injektoitava backend,
// turvallinen lataus. Vain localStorage — ei mitään verkkoon.

export interface SetupDefaults {
  names: string[];
}

const DEFAULT_KEY = "superjatsi:setup";
const DATA_VERSION = 1;
const MAX_PLAYERS = 6;

export class SetupPrefs {
  constructor(
    private readonly backend: StorageLike,
    private readonly key: string = DEFAULT_KEY,
  ) {}

  save(defaults: SetupDefaults): void {
    this.backend.setItem(this.key, JSON.stringify({ version: DATA_VERSION, ...defaults }));
  }

  /** Tallennetut valinnat, tai null jos puuttuu/rikki/vanha. */
  load(): SetupDefaults | null {
    const raw = this.backend.getItem(this.key);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as { version?: number; names?: unknown };
      if (data.version !== DATA_VERSION || !Array.isArray(data.names)) return null;
      const names = data.names.filter((n): n is string => typeof n === "string").slice(0, MAX_PLAYERS);
      return names.length > 0 ? { names } : null;
    } catch {
      return null;
    }
  }
}
