import { describe, it, expect } from "vitest";
import { clamp01, lerp, easeIn, easeOut, easeInOut, snapToGrid, buildOrbitPaths } from "../src/mission/geometry.js";

describe("primitives", () => {
  it("clamps", () => { expect(clamp01(-1)).toBe(0); expect(clamp01(2)).toBe(1); expect(clamp01(0.4)).toBe(0.4); });
  it("lerps", () => expect(lerp(10, 20, 0.5)).toBe(15));
  it("eases hit endpoints", () => {
    for (const e of [easeIn, easeOut, easeInOut]) { expect(e(0)).toBe(0); expect(e(1)).toBe(1); }
  });
  it("snaps to 30px grid", () => { expect(snapToGrid(31)).toBe(30); expect(snapToGrid(46)).toBe(60); expect(snapToGrid(900)).toBe(900); });
});

describe("buildOrbitPaths", () => {
  const globe = { left: 800, top: 400, width: 600, offsetWidth: 600 };
  it("fly-by (burn=0) and descent share the burn point B", () => {
    const a = buildOrbitPaths(1440, 900, 0, globe);
    const b = buildOrbitPaths(1440, 900, 1, globe);
    expect(a.B).toEqual(b.B);
  });
  it("burn=1 visible line ends at landing point L", () => {
    const r = buildOrbitPaths(1440, 900, 1, globe);
    const dEnd = r.flyD.trim().split(" ").slice(-2).map(Number);
    expect(dEnd[0]).toBeCloseTo(r.L.x, 0);
    expect(dEnd[1]).toBeCloseTo(r.L.y, 0);
  });
  it("landing point sits on the globe at EARTH_LAND_DEG/R", () => {
    const r = buildOrbitPaths(1440, 900, 0, globe);
    const dist = Math.hypot(r.L.x - r.GCx, r.L.y - r.GCy);
    expect(dist).toBeCloseTo(r.GR * 0.42, 1);
  });
});
