import { describe, it, expect } from "vitest";
import { landingBeats } from "../src/mission/landing.js";
import { TUNABLES as T } from "../src/mission/tunables.js";

const b = landingBeats(T);

it("beat boundaries are ordered and within the pin", () => {
  expect(b.flipStart).toBeCloseTo(0.16, 5);
  expect(b.flipEnd).toBeCloseTo(0.28, 5);
  expect(b.flipEnd).toBeLessThan(b.shrinkStart);
  expect(b.shrinkStart).toBeCloseTo(0.56, 5);
});

it("burn progress maps 0..1 across the flip window only", () => {
  expect(b.burnP(0.15)).toBe(0);
  expect(b.burnP(0.22)).toBeGreaterThan(0);
  expect(b.burnP(0.22)).toBeLessThan(1);
  expect(b.burnP(0.3)).toBe(1);
});

it("flame pulses only during the burn", () => {
  expect(b.flame(0.10)).toBe(0);
  expect(b.flame(0.22)).toBeGreaterThan(0.9);
  expect(b.flame(0.4)).toBe(0);
});

it("nose-down blend: engine-first (180) until NOSE_DOWN_AT, nose-down (0) at the end", () => {
  expect(b.noseRot(0)).toBeCloseTo(180, 5);
  expect(b.noseRot(T.NOSE_DOWN_AT)).toBeCloseTo(180, 5);
  expect(b.noseRot(1)).toBeCloseTo(0, 5);
});

it("ship shrinks from full size to the dot scale and pops out at the very end", () => {
  expect(b.scaleAt(0.5)).toBe(1);
  expect(b.scaleAt(1)).toBeCloseTo(T.DESC_SHRINK_END, 5);
  expect(b.shipFade(0.9)).toBe(1);
  expect(b.shipFade(1)).toBe(0);
});

it("globe rotates to EARTH_SPIN_DEG; glow lights in the back half of the shrink", () => {
  expect(b.globeRot(0)).toBe(0);
  expect(b.globeRot(1)).toBeCloseTo(T.EARTH_SPIN_DEG, 5);
  expect(b.glowOpacity(0.6)).toBe(0);
  expect(b.glowOpacity(1)).toBe(1);
});
