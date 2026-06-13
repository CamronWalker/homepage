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

  // ── THE FLY-BY IS A REAL ORBIT SEGMENT ──────────────────────────────────
  // The ship doesn't fall down the page — it's IN orbit: it enters from
  // off-screen RIGHT already travelling tangentially, sweeps over the top of
  // the planet, and wraps the left limb, concave toward the planet at every
  // point. Knots sit on near-circular radii around the globe centre; Bézier
  // handles run along the local tangents with circle-approximation lengths,
  // so the curve hugs the orbit. The burn knot B is on the descending side —
  // the retro-burn morphs only the path AHEAD of the ship (your history
  // doesn't change; your future does).
  var DEG = Math.PI / 180;
  function polar(deg, r) { return { x: GCx + r * GR * Math.cos(deg * DEG), y: GCy + r * GR * Math.sin(deg * DEG) }; }
  // direction of travel (decreasing angle: right → over the top → left limb)
  function tangent(deg) { return { x: Math.sin(deg * DEG), y: -Math.cos(deg * DEG) }; }
  function arcHandle(degSpan, r) { return (4 / 3) * Math.tan(Math.abs(degSpan) * DEG / 4) * r * GR; }

  var ENTRY_DEG = -50, APEX_DEG = -96, BURN_DEG = -112, PERI_DEG = -138;
  var ENTRY_R = 1.62, APEX_R = 1.50, BURN_R = 1.47, PERI_R = 1.46;

  var A = polar(ENTRY_DEG, ENTRY_R);
  // the entry always starts off-screen right: extend radially along the same ray
  if (A.x < W + 40 && A.x > GCx) {
    var ke = (W + 40 - GCx) / (A.x - GCx);
    A = { x: GCx + (A.x - GCx) * ke, y: GCy + (A.y - GCy) * ke };
  }
  var TOP = polar(APEX_DEG, APEX_R);
  var B   = polar(BURN_DEG, BURN_R);
  var P   = polar(PERI_DEG, PERI_R);
  var E   = { x: GCx - 1.18 * GR, y: 1.10 * H };   // exit leg = the curve's closest approach

  var tA = tangent(ENTRY_DEG), tT = tangent(APEX_DEG), tB = tangent(BURN_DEG), tP = tangent(PERI_DEG);
  var h1 = arcHandle(ENTRY_DEG - APEX_DEG, (ENTRY_R + APEX_R) / 2);
  var h2 = arcHandle(APEX_DEG - BURN_DEG, (APEX_R + BURN_R) / 2);
  var hBP = arcHandle(BURN_DEG - PERI_DEG, (BURN_R + PERI_R) / 2);

  var c0a = { x: A.x + tA.x * h1, y: A.y + tA.y * h1 };
  var c0b = { x: TOP.x - tT.x * h1, y: TOP.y - tT.y * h1 };
  var c1a = { x: TOP.x + tT.x * h2, y: TOP.y + tT.y * h2 };
  var c1b = { x: B.x - tB.x * h2, y: B.y - tB.y * h2 };

  var c1f = { x: B.x + tB.x * hBP, y: B.y + tB.y * hBP };
  var c2f = { x: P.x - tP.x * hBP, y: P.y - tP.y * hBP };
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
    " C " + c0a.x + " " + c0a.y + " " + c0b.x + " " + c0b.y + " " + TOP.x + " " + TOP.y +
    " C " + c1a.x + " " + c1a.y + " " + c1b.x + " " + c1b.y + " " + B.x + " " + B.y +
    " C " + m1.x + " " + m1.y + " " + m2.x + " " + m2.y + " " + k.x + " " + k.y +
    " S " + m3.x + " " + m3.y + " " + en.x + " " + en.y;

  var descD =
    "M"  + B.x  + " " + B.y  +
    " C " + c1d.x + " " + c1d.y + " " + c2d.x + " " + c2d.y + " " + M2.x + " " + M2.y +
    " S " + c3d.x + " " + c3d.y + " " + L.x  + " " + L.y;

  return { flyD, descD, A, B, L, GCx, GCy, GR };
}
