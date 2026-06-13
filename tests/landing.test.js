import { describe, it, expect } from "vitest";
import { landingBeats } from "../src/mission/landing.js";
import { TUNABLES as T } from "../src/mission/tunables.js";

const b = landingBeats(T);
const mid = T.LAND_FLIP_AT + T.LAND_FLIP_LEN / 2;

it("beat boundaries derive from tunables and stay ordered", () => {
  expect(b.flipStart).toBeCloseTo(T.LAND_FLIP_AT, 5);
  expect(b.flipEnd).toBeCloseTo(T.LAND_FLIP_AT + T.LAND_FLIP_LEN, 5);
  expect(b.flipEnd).toBeLessThan(b.shrinkStart);
  expect(b.shrinkStart).toBeCloseTo(T.LAND_SHRINK_START, 5);
});

it("burn progress maps 0..1 across the flip window only", () => {
  expect(b.burnP(b.flipStart - 0.01)).toBe(0);
  expect(b.burnP(mid)).toBeCloseTo(0.5, 5);
  expect(b.burnP(b.flipEnd + 0.02)).toBe(1);
});

it("flame pulses only during the burn, peaking mid-flip", () => {
  expect(b.flame(b.flipStart - 0.05)).toBe(0);
  expect(b.flame(mid)).toBeCloseTo(1, 5);
  expect(b.flame(b.flipEnd + 0.02)).toBe(0);
});

it("nose-down blend: engine-first (180) until NOSE_DOWN_AT, nose-down (0) at the end", () => {
  expect(b.noseRot(0)).toBeCloseTo(180, 5);
  expect(b.noseRot(T.NOSE_DOWN_AT)).toBeCloseTo(180, 5);
  expect(b.noseRot(1)).toBeCloseTo(0, 5);
});

it("ship shrinks from full size to the dot scale and pops out at the very end", () => {
  expect(b.scaleAt(b.shrinkStart - 0.05)).toBe(1);
  expect(b.scaleAt(1)).toBeCloseTo(T.DESC_SHRINK_END, 5);
  expect(b.shipFade(0.9)).toBe(1);
  expect(b.shipFade(1)).toBe(0);
});

it("globe rotates to EARTH_SPIN_DEG; glow lights in the back half of the shrink", () => {
  expect(b.globeRot(0)).toBe(0);
  expect(b.globeRot(1)).toBeCloseTo(T.EARTH_SPIN_DEG, 5);
  expect(b.glowOpacity(b.shrinkStart + 0.1 * (1 - b.shrinkStart))).toBe(0);
  expect(b.glowOpacity(1)).toBe(1);
});
