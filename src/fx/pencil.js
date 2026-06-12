import gsap from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";

/* ── PENCIL PASS ──────────────────────────────────────────────────────────
   Three independent, individually removable layers (spec §8):
   1. paper grain — one static noise tile over the page, multiply, ~3.5%
   2. stroke wobble — sketch paths pre-roughened ONCE at load with a seeded
      jitter, so animated elements pay zero filter cost
   3. draw-on — hand annotations sketch themselves in
   If any layer reads as noise instead of pencil, delete its init call.    */

const JITTER = 1.5;          // max perturbation, in the path's own user units
const MAX_CMDS = 400;        // skip giant traced fills (astronaut, coastline)

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Jitter the coordinate pairs of absolute M/L/C/S/Q/T commands; leave arcs,
   H/V, Z, and all relative (lowercase) commands untouched so curvature flags
   and relative geometry can never break. */
export function roughenPathD(d, seed) {
  const rng = mulberry32(seed);
  return d.replace(/([MLCSQT])([^A-Za-z]*)/g, (whole, cmd, args) => {
    const jittered = args.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, (num) =>
      (parseFloat(num) + (rng() - 0.5) * 2 * JITTER).toFixed(2).replace(/\.?0+$/, "") || "0");
    return cmd + jittered;
  });
}

function hashSeed(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

/* Roughen ONLY the hand-annotation strokes (margin arrows). The rocket art is
   LOCKED — its bells, plumes, and seam geometry were tuned stroke by stroke in
   the design sessions, and jitter visibly mangles small curves (engine bells
   are ~15 units wide, so ±1.5 units is a 10% distortion). Pencil feel for the
   art itself comes from the grain layer + the drawings' own sketch style. */
export function applyWobble(root = document) {
  root.querySelectorAll(".ann svg path").forEach((p) => {
    const d = p.getAttribute("d");
    if (!d) return;
    const cmds = (d.match(/[A-Za-z]/g) || []).length;
    if (cmds > MAX_CMDS) return;                       // traced fills stay crisp
    p.setAttribute("d", roughenPathD(d, hashSeed(d)));
  });
}

/* faint paper-grain overlay (static — zero animation cost) */
export function applyGrain() {
  const tile =
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">' +
    '<filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/>' +
    '<feColorMatrix type="matrix" values="0 0 0 0 0.18 0 0 0 0 0.18 0 0 0 0 0.2 0 0 0 0.5 0"/></filter>' +
    '<rect width="160" height="160" filter="url(#g)"/></svg>';
  const div = document.createElement("div");
  div.className = "paper-grain";
  div.setAttribute("aria-hidden", "true");
  div.style.cssText =
    "position:fixed;inset:0;z-index:1;pointer-events:none;mix-blend-mode:multiply;opacity:.05;" +
    `background-image:url('data:image/svg+xml;utf8,${encodeURIComponent(tile)}');background-size:160px 160px;`;
  document.body.appendChild(div);
}

/* hand annotations draw themselves in (arrows, underlines) */
export function applyDrawOns() {
  gsap.registerPlugin(DrawSVGPlugin);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".ann svg path").forEach((p, i) => {
    gsap.fromTo(p, { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.9, delay: 0.6 + i * 0.25, ease: "power1.inOut" });
  });
}

export function initPencil() {
  applyWobble();
  applyGrain();
  applyDrawOns();
}
