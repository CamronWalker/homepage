import { describe, it, expect } from "vitest";
import { coastFrame, missionFrame, capsuleHold } from "../src/mission/spacewalk.js";
import { TUNABLES as T } from "../src/mission/tunables.js";

const cards = [
  { cx: 200, left: 150, right: 250, top: 400, bottom: 560, cy: 480 },
  { cx: 500, left: 450, right: 550, top: 400, bottom: 560, cy: 480 },
  { cx: 800, left: 750, right: 850, top: 400, bottom: 560, cy: 480 },
  { cx: 1100, left: 1050, right: 1150, top: 400, bottom: 560, cy: 480 },
];
const ctx = { W: 1440, H: 900, cards, cardsTop: 400 };

describe("coast", () => {
  it("enters from off-right and ends at the capsule hold (continuity into the tour)", () => {
    expect(coastFrame(0, ctx, T).s2.x).toBeGreaterThan(ctx.W);
    const f = coastFrame(1, ctx, T);
    expect(f.s2.x).toBeCloseTo(capsuleHold(ctx, T).x, 0);
    expect(f.s2.y).toBeCloseTo(capsuleHold(ctx, T).y, 0);
  });
});

describe("spacewalk tour", () => {
  it("astronaut is VISIBLE during the tour (the prototype bug)", () => {
    const f = missionFrame(0.3, ctx, T);
    expect(f.astro.opacity).toBe(1);
    expect(f.astro.scale).toBeGreaterThan(0);
  });
  it("enters from the capsule side, reaches the far-left card, then sweeps L to R", () => {
    expect(missionFrame(0.02, ctx, T).astro.x).toBeGreaterThan(cards[0].cx);
    const atLead = missionFrame(T.TOUR_END * 0.18, ctx, T);
    expect(atLead.astro.x).toBeCloseTo(cards[0].cx, 0);
    const mid = missionFrame(0.33, ctx, T), late = missionFrame(0.6, ctx, T);
    expect(mid.astro.x).toBeLessThan(late.astro.x);
  });
  it("every card is visited exactly when the astronaut is over it", () => {
    const visited = new Set();
    for (let p = 0; p < T.TOUR_END; p += 0.002) {
      const f = missionFrame(p, ctx, T);
      if (f.activeCard >= 0) {
        visited.add(f.activeCard);
        const c = cards[f.activeCard];
        expect(f.astro.x).toBeGreaterThanOrEqual(c.left - 8);
        expect(f.astro.x).toBeLessThanOrEqual(c.right + 8);
      }
    }
    expect([...visited].sort()).toEqual([0, 1, 2, 3]);
  });
  it("tether connects capsule side to the astronaut", () => {
    const f = missionFrame(0.3, ctx, T);
    expect(f.tether.d).toMatch(/^M[\d.\s-]+Q/);
    expect(f.tether.opacity).toBeGreaterThan(0);
  });
});

describe("mobile column tour", () => {
  const M = { ...T, ASTRO_ABOVE_CARDS: 24 };
  const mctx = { W: 390, H: 844, cards: [
    { cx: 195, cy: 300, top: 260, bottom: 340, left: 20, right: 370 },
    { cx: 195, cy: 560, top: 520, bottom: 600, left: 20, right: 370 },
    { cx: 195, cy: 820, top: 780, bottom: 860, left: 20, right: 370 },
  ], cardsTop: 260 };
  it("sweeps top to bottom down the stacked column, hugging it", () => {
    const early = missionFrame(0.25, mctx, M), late = missionFrame(0.6, mctx, M);
    expect(late.astro.y).toBeGreaterThan(early.astro.y);
    expect(Math.abs(late.astro.x - early.astro.x)).toBeLessThan(80);
  });
  it("every stacked card is visited", () => {
    const visited = new Set();
    for (let p = 0; p < M.TOUR_END; p += 0.002) {
      const f = missionFrame(p, mctx, M);
      if (f.activeCard >= 0) visited.add(f.activeCard);
    }
    expect([...visited].sort()).toEqual([0, 1, 2]);
  });
});

describe("handoff", () => {
  it("astronaut fades out; ship holds at capsule height ON the lane (no jump into phase 4)", () => {
    const f = missionFrame(1, ctx, T);
    expect(f.astro.opacity).toBe(0);
    expect(f.ship.y).toBeCloseTo(T.CAP_HOLD_FRAC * ctx.H, 0);
    expect(f.ship.laneBlend).toBe(1);
  });
  it("orbit line sketches in during the handoff only", () => {
    expect(missionFrame(0.5, ctx, T).orbit.opacity).toBe(0);
    const f = missionFrame(0.9, ctx, T);
    expect(f.orbit.opacity).toBeGreaterThan(0);
  });
});
