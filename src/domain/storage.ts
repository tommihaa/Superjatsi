import { GameState } from "./game";
import type { Rng } from "./dice";
import type { GameSnapshot } from "./types";

// Persistointi localStorageen. Backend injektoidaan (StorageLike), jotta tämä on
// testattavissa ilman selainta. Lataus on "turvallinen": rikkinäinen tai vanha
// tallennus ei kaada peliä, vaan palauttaa null → aloitus puhtaalta pöydältä.

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const DEFAULT_KEY = "superjatsi:game";

export class GamePersistence {
  constructor(
    private readonly backend: StorageLike,
    private readonly key: string = DEFAULT_KEY,
  ) {}

  save(game: GameState): void {
    this.backend.setItem(this.key, JSON.stringify(game.toSnapshot()));
  }

  clear(): void {
    this.backend.removeItem(this.key);
  }

  /** Palauta tallennettu peli, tai null jos puuttuu/rikki/vanha. */
  load(rng?: Rng): GameState | null {
    const raw = this.backend.getItem(this.key);
    if (!raw) return null;
    try {
      const snap = JSON.parse(raw) as GameSnapshot;
      return rng ? GameState.fromSnapshot(snap, rng) : GameState.fromSnapshot(snap);
    } catch {
      this.clear();
      return null;
    }
  }
}
