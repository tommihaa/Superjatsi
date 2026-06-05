// Nopat. RNG injektoidaan, jotta pelilogiikka on deterministisesti testattavissa.

export type Rng = () => number;
export const defaultRng: Rng = Math.random;

export class DiceSet {
  /** Silmäluvut; 0 tarkoittaa "ei vielä heitetty". */
  values: number[];
  /** Lukitut nopat säilyttävät arvonsa uudelleenheitossa. */
  held: boolean[];

  constructor(readonly count: number, private readonly rng: Rng = defaultRng) {
    this.values = new Array(count).fill(0);
    this.held = new Array(count).fill(false);
  }

  /** Uusi vuoro: tyhjennä nopat ja lukot. */
  reset(): void {
    this.values = new Array(this.count).fill(0);
    this.held = new Array(this.count).fill(false);
  }

  /** Heitä lukitsemattomat nopat. Heittämättömät (arvo 0) heitetään aina. */
  roll(): void {
    for (let i = 0; i < this.count; i++) {
      if (this.held[i] && this.values[i] !== 0) continue;
      this.values[i] = 1 + Math.floor(this.rng() * 6);
    }
  }

  toggleHold(i: number): void {
    if (i < 0 || i >= this.count) throw new Error(`Noppaindeksi ${i} ei kelpaa`);
    this.held[i] = !this.held[i];
  }
}
