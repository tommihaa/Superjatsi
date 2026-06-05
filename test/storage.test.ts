import { describe, expect, it } from "vitest";
import { GameState } from "../src/domain/game";
import { GamePersistence, type StorageLike } from "../src/domain/storage";

class MockStorage implements StorageLike {
  private store = new Map<string, string>();
  getItem(k: string): string | null {
    return this.store.has(k) ? this.store.get(k)! : null;
  }
  setItem(k: string, v: string): void {
    this.store.set(k, v);
  }
  removeItem(k: string): void {
    this.store.delete(k);
  }
}

const rng4 = () => 0.5;

describe("GamePersistence", () => {
  it("tallennus → lataus säilyttää tilan (round-trip)", () => {
    const g = new GameState(["A", "B"], 6, rng4);
    g.roll();
    g.commit("III", "fours", {});
    g.confirm();
    g.roll();

    const backend = new MockStorage();
    const p = new GamePersistence(backend);
    p.save(g);

    const loaded = p.load(rng4)!;
    expect(loaded).not.toBeNull();
    expect(loaded.diceCount).toBe(6);
    expect(loaded.currentPlayerIndex).toBe(g.currentPlayerIndex);
    expect(loaded.rollsUsed).toBe(g.rollsUsed);
    expect(loaded.players[0].card.get("III", "fours")).toBe(24);
    expect(loaded.players[0].card.grandTotal()).toBe(g.players[0].card.grandTotal());
  });

  it("puuttuva tallennus → null", () => {
    const p = new GamePersistence(new MockStorage());
    expect(p.load()).toBeNull();
  });

  it("rikkinäinen tallennus → null ja tyhjennys", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:game", "{ ei kelvollista jsonia");
    const p = new GamePersistence(backend);
    expect(p.load()).toBeNull();
    expect(backend.getItem("superjatsi:game")).toBeNull();
  });

  it("vanha versio → null (ei kaada)", () => {
    const backend = new MockStorage();
    backend.setItem("superjatsi:game", JSON.stringify({ version: 999, players: [] }));
    const p = new GamePersistence(backend);
    expect(p.load()).toBeNull();
  });
});
