import { describe, it, expect } from "vitest";
import { pinEnd } from "../src/mission/pins.js";

describe("pinEnd", () => {
  it("pin length is vh-scaled and grid-snapped", () => {
    expect(pinEnd(1.2, 900) % 30).toBe(0);
    expect(Math.abs(pinEnd(1.2, 900) - 1080)).toBeLessThanOrEqual(15);
  });
  it("snaps the skills and contact durations too", () => {
    expect(pinEnd(1.7, 937) % 30).toBe(0);
    expect(pinEnd(2.6, 811) % 30).toBe(0);
  });
});
