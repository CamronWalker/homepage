import { it, expect } from "vitest";
import { roughenPathD, mulberry32 } from "../src/fx/pencil.js";

it("PRNG is deterministic for a seed", () => {
  const a = mulberry32(7), b = mulberry32(7);
  expect([a(), a(), a()]).toEqual([b(), b(), b()]);
});

it("roughen is deterministic for a seed and preserves command count", () => {
  const d = "M0 0 L100 0 L100 100";
  expect(roughenPathD(d, 7)).toBe(roughenPathD(d, 7));
  expect(roughenPathD(d, 7)).not.toBe(d);
  expect((roughenPathD(d, 7).match(/[ML]/g) || []).length).toBe(3);
});

it("perturbation is bounded (±1.5 units)", () => {
  const out = roughenPathD("M10 10 L20 10", 1);
  const nums = out.match(/-?\d+(\.\d+)?/g).map(Number);
  nums.forEach((n, i) => {
    const orig = [10, 10, 20, 10][i];
    expect(Math.abs(n - orig)).toBeLessThanOrEqual(1.5);
  });
});

it("leaves arcs, relative commands, and H/V untouched", () => {
  const d = "M10 10 A5 5 0 0 1 20 20 h10 v5 l3 3";
  const out = roughenPathD(d, 3);
  expect(out).toContain("A5 5 0 0 1 20 20");
  expect(out).toContain("h10");
  expect(out).toContain("v5");
  expect(out).toContain("l3 3");
});
