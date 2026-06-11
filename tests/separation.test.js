import { describe, it, expect } from "vitest";
import { approachFrame, separationFrame, stagePoint } from "../src/mission/separation.js";
import { TUNABLES as T } from "../src/mission/tunables.js";

const ctx = { W: 1440, H: 900 };

it("approach decelerates into the staging point", () => {
  const end = approachFrame(1, ctx, T);
  expect(end.mated.x).toBeCloseTo(stagePoint(ctx, T).x, 5);
  expect(end.mated.y).toBeCloseTo(stagePoint(ctx, T).y, 5);
  expect(end.mated.rot).toBe(90);
  expect(end.mated.opacity).toBe(1);
});

it("approach starts off-screen left", () => {
  expect(approachFrame(0, ctx, T).mated.x).toBeLessThan(0);
});

it("separation t=0 keeps both pieces exactly at the seam pose (no glitch-jump)", () => {
  const f = separationFrame(0, ctx, T);
  const sp = stagePoint(ctx, T);
  expect(f.s2.x).toBeCloseTo(sp.x, 5);
  expect(f.s2.y).toBeCloseTo(sp.y, 5);
  expect(f.s2.rot).toBe(90);
  expect(f.debris.x).toBeCloseTo(sp.x, 5);
  expect(f.debris.y).toBeCloseTo(sp.y, 5);
  expect(f.debris.rot).toBeCloseTo(90, 5);
});

it("booster flame dies before second-stage ignition completes", () => {
  expect(separationFrame(0.25, ctx, T).boostFlame).toBeLessThan(0.5);
  expect(separationFrame(0.5, ctx, T).s2Flame).toBeGreaterThan(0);
});

it("second stage exits right; booster tumbles down-left and fades", () => {
  const f = separationFrame(1, ctx, T);
  const sp = stagePoint(ctx, T);
  expect(f.s2.x).toBeGreaterThan(1.3 * ctx.W);
  expect(f.debris.x).toBeLessThan(sp.x);
  expect(f.debris.y).toBeGreaterThan(sp.y);
  expect(f.debris.opacity).toBe(0);
});

it("staging height respects the nav floor on short viewports", () => {
  expect(stagePoint({ W: 1440, H: 700 }, T).y).toBe(T.ROCKET_Y_MIN);
});
