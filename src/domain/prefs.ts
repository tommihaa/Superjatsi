import type { StorageLike } from "./storage";
import type { DiceCount } from "./types";

// Aloitusnäytön valintojen (pelaajien nimet → määrä, noppavariantti) muistaminen
// yli session. Sama kaava kuin GamePersistence/HighscoreStore: injektoitava
// backend, turvallinen lataus. Vain localStorage — ei mitään verkkoon.

export interface SetupDefaults {
  names: string[];
  /** Puuttuu vanhoista tallenteista (ennen 0.9.0) — setup pitää silloin oletuksensa. */
  diceCount?: DiceCount;
}

const DEFAULT_KEY = "superjatsi:setup";
const SOUND_KEY = "superjatsi:sound";
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
      const data = JSON.parse(raw) as { version?: number; names?: unknown; diceCount?: unknown };
      if (data.version !== DATA_VERSION || !Array.isArray(data.names)) return null;
      const names = data.names.filter((n): n is string => typeof n === "string").slice(0, MAX_PLAYERS);
      if (names.length === 0) return null;
      // Variantti vain jos se on tunnettu arvo — muu roska ei kaada eikä välity.
      return data.diceCount === 5 || data.diceCount === 6
        ? { names, diceCount: data.diceCount }
        : { names };
    } catch {
      return null;
    }
  }
}

/** Ääniasetuksen persistointi. Oletus = päällä (myös puuttuva/rikkinäinen
 *  tallennus), koska äänet ovat osa peruskokemusta ja pois-kytkin on helppo. */
export class SoundPrefs {
  constructor(
    private readonly backend: StorageLike,
    private readonly key: string = SOUND_KEY,
  ) {}

  save(enabled: boolean): void {
    this.backend.setItem(this.key, JSON.stringify({ version: DATA_VERSION, enabled }));
  }

  load(): boolean {
    const raw = this.backend.getItem(this.key);
    if (!raw) return true;
    try {
      const data = JSON.parse(raw) as { version?: number; enabled?: unknown };
      return data.version === DATA_VERSION && typeof data.enabled === "boolean" ? data.enabled : true;
    } catch {
      return true;
    }
  }
}
