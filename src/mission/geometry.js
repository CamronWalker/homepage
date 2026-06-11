// Pure geometry module — no DOM access anywhere in this file.
// All functions are ported line-for-line from design-handoff/project/site.js.

// ── Grid ──────────────────────────────────────────────────────────────────────
export const GRID_PX = 30;

// ── Phase-4 geometry constants ────────────────────────────────────────────────
export const LANE_OFF_FRAC  = 0.095;
export const BURN_Y_FRAC    = 0.27;
export const EARTH_LAND_DEG = 256;
export const EARTH_LAND_R   = 0.42;

// Footer-globe viewBox / geometry constants (site.js line 217)
export const GLOBE_VBX = 342;
export const GLOBE_VBY = -138;
export const GLOBE_VB  = 936;
export const GLOBE_CX  = 810;
export const GLOBE_CY  = 330;
export const GLOBE_R   = 440;

// ── Primitives (site.js lines 308-312) ───────────────────────────────────────
export function clamp01(v)      { return v < 0 ? 0 : v > 1 ? 1 : v; }
export function lerp(a, b, t)   { return a + (b - a) * t; }
export function easeIn(t)       { return t * t; }
export function easeOut(t)      { return 1 - (1 - t) * (1 - t); }
export function easeInOut(t)    { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

// ── Grid snap ─────────────────────────────────────────────────────────────────
export function snapToGrid(px)  { return Math.round(px / GRID_PX) * GRID_PX; }

// ── buildOrbitPaths ───────────────────────────────────────────────────────────
// Pure port of buildPhase4 (site.js lines 246-290).
// Inputs:
//   W, H       — viewport px
//   burnP      — 0–1 burn progress
//   globeRect  — { left, top, width, offsetWidth }  (replaces live getBoundingClientRect / offsetWidth)
// Returns:
//   { flyD, descD, A, B, L, GCx, GCy, GR }
export function buildOrbitPaths(W, H, burnP, globeRect) {
  var bp = clamp01(burnP || 0);

  var fr  = globeRect;
  var ow  = globeRect.offsetWidth || fr.width;
  var scale = ow / GLOBE_VB;

  var GR  = GLOBE_R * scale;
  var GCx = fr.left + (GLOBE_CX - GLOBE_VBX) * scale;
  var GCy = fr.top  + (GLOBE_CY - GLOBE_VBY) * scale;

  var aL = EARTH_LAND_DEG * Math.PI / 180;
  var L  = { x: GCx + GR * EARTH_LAND_R * Math.cos(aL), y: GCy + GR * EARTH_LAND_R * Math.sin(aL) };

  var A  = { x: L.x - LANE_OFF_FRAC * W, y: -0.06 * H };
  var B  = { x: A.x - 0.008 * W,         y: BURN_Y_FRAC * H };

  // fly-by lower half: periapsis P just off the upper-left limb, exit E under the page
  var P  = { x: GCx + 1.22 * GR * Math.cos(222 * Math.PI / 180), y: GCy + 1.22 * GR * Math.sin(222 * Math.PI / 180) };
  var E  = { x: GCx - 1.06 * GR, y: 1.10 * H };

  var c1f = { x: B.x - 0.004 * W, y: B.y + 0.45 * (P.y - B.y) };
  var c2f = { x: P.x + 0.45 * (B.x - P.x), y: P.y - 0.40 * (P.y - B.y) };
  var c3f = { x: E.x + 0.015 * W, y: lerp(P.y, E.y, 0.55) };

  // descent lower half
  var M2  = { x: lerp(B.x, L.x, 0.30), y: lerp(B.y, L.y, 0.58) };
  var c1d = { x: B.x - 0.002 * W, y: lerp(B.y, M2.y, 0.5) };
  var c2d = { x: M2.x - 0.10 * (L.x - B.x), y: M2.y - 0.35 * (M2.y - B.y) };
  var c3d = { x: L.x - 0.05 * W, y: lerp(M2.y, L.y, 0.55) };

  function mix(p, q) { return { x: lerp(p.x, q.x, bp), y: lerp(p.y, q.y, bp) }; }

  var k  = mix(P,   M2);
  var m1 = mix(c1f, c1d);
  var m2 = mix(c2f, c2d);
  var m3 = mix(c3f, c3d);
  var en = mix(E,   L);

  var flyD =
    "M"  + A.x + " " + A.y +
    " C " + (A.x - 0.003 * W) + " " + lerp(A.y, B.y, 0.5) +
      " " + (B.x + 0.003 * W) + " " + lerp(A.y, B.y, 0.78) +
      " " + B.x + " " + B.y +
    " C " + m1.x + " " + m1.y + " " + m2.x + " " + m2.y + " " + k.x + " " + k.y +
    " S " + m3.x + " " + m3.y + " " + en.x + " " + en.y;

  var descD =
    "M"  + B.x  + " " + B.y  +
    " C " + c1d.x + " " + c1d.y + " " + c2d.x + " " + c2d.y + " " + M2.x + " " + M2.y +
    " S " + c3d.x + " " + c3d.y + " " + L.x  + " " + L.y;

  return { flyD, descD, A, B, L, GCx, GCy, GR };
}
