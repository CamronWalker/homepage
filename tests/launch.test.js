import { describe, it, expect } from "vitest";
import { countdownFrame, climbFrame } from "../src/mission/launch.js";

describe("countdown", () => {
  it("steps T-3/T-2/T-1/LIFTOFF at quarters", () => {
    expect(countdownFrame(0.1).label).toBe("T–3");
    expect(countdownFrame(0.3).label).toBe("T–2");
    expect(countdownFrame(0.6).label).toBe("T–1");
    expect(countdownFrame(0.8).ignite).toBe(true);
  });
  it("pad never moves during countdown (dead-zone)", () => {
    expect(countdownFrame(0.9).stack).toEqual({ x: 0, y: 0, rot: 0 });
  });
  it("shake builds through the count and snaps up at ignition", () => {
    expect(countdownFrame(0.1).shakePx).toBeLessThan(countdownFrame(0.7).shakePx);
    expect(countdownFrame(0.8).shakePx).toBeCloseTo(2.6, 5);
  });
});

describe("climb", () => {
  it("starts where the countdown ends (continuity)", () => {
    const f = climbFrame(0, { H: 900, svgH: 500 });
    expect(f.stack.x).toBe(0);
    expect(f.stack.y).toBe(0);
    expect(f.stack.rot).toBe(0);
  });
  it("clears the top by the end and leans to -13", () => {
    const f = climbFrame(1, { H: 900, svgH: 500 });
    expect(f.stack.y).toBeLessThan(-(900 * 660 / 500));
    expect(f.stack.rot).toBeCloseTo(-13, 5);
    expect(f.padOpacity).toBe(0);
  });
  it("is slow off the pad (ease-in): first tenth covers under 2% of the climb", () => {
    const f = climbFrame(0.1, { H: 900, svgH: 500 });
    const total = climbFrame(1, { H: 900, svgH: 500 }).stack.y;
    expect(Math.abs(f.stack.y / total)).toBeLessThan(0.02);
  });
});
