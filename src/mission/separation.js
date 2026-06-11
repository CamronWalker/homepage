import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { clamp01, lerp, easeIn, easeOut } from "./geometry.js";
import { pinEnd } from "./pins.js";

/* ── PHASE 2 · APPROACH + STAGE SEPARATION ────────────────────────────────
   The mated stack (identical to the launch rocket) coasts in from off-left,
   nose right, decelerating to the staging point in the clear band above the
   pinned About. Separation is GRADUAL: booster throttles down, slides back
   along the flight axis, then tumbles down-left into About — drawing the eye
   to the copy — while the second stage ignites and burns off right. All three
   pieces share seam-centred coordinate frames, so a glitch-jump at the split
   is geometrically impossible.                                              */

export function stagePoint(ctx, t) {
  return { x: t.ROCKET_X_FRAC * ctx.W, y: Math.max(t.ROCKET_Y_FRAC * ctx.H, t.ROCKET_Y_MIN) };
}

export function approachFrame(p, ctx, t) {
  const au = easeOut(clamp01(p));
  const sp = stagePoint(ctx, t);
  return {
    mated: {
      x: lerp(-0.34 * ctx.W, sp.x, au),
      y: lerp(sp.y + 0.07 * ctx.H, sp.y, au),
      rot: 90, scale: 1, opacity: 1,
    },
    matedFlame: 1,
  };
}

const PART_END = 0.50;   // first half: gradual detach; second half: burn-off

export function separationFrame(p, ctx, t) {
  p = clamp01(p);
  const sp = stagePoint(ctx, t);
  if (p < PART_END) {
    const dt = clamp01(p / PART_END);
    const ed = easeIn(dt);
    return {
      s2: { x: sp.x, y: sp.y, rot: 90, opacity: 1 },                 // holds at the seam point
      debris: {                                                       // sheds down-left, tumbling
        x: sp.x - ed * 0.10 * ctx.W,
        y: sp.y + ed * 0.16 * ctx.H,
        rot: 90 + ed * ed * 240,
        opacity: 1,
      },
      boostFlame: clamp01(1 - dt * 2.2),                              // booster engine dies as it parts
      s2Flame: clamp01((dt - 0.5) / 0.4),                             // 2nd-stage ignition builds
    };
  }
  const sv = easeIn((p - PART_END) / (1 - PART_END));
  return {
    s2: { x: lerp(sp.x, 1.34 * ctx.W, sv), y: sp.y, rot: 90, opacity: 1 },   // burns off right
    debris: {
      x: sp.x - 0.10 * ctx.W - sv * 0.06 * ctx.W,
      y: sp.y + 0.16 * ctx.H + sv * 0.40 * ctx.H,
      rot: 90 + 240 + sv * 200,
      opacity: clamp01(1 - sv * 1.1),
    },
    boostFlame: 0,
    s2Flame: 1,
  };
}

/* ── appliers ── */
function place(el, o) {
  el.style.left = o.x + "px";
  el.style.top = o.y + "px";
  el.style.transform = `translate(-50%,-50%) rotate(${o.rot}deg) scale(${o.scale == null ? 1 : o.scale})`;
  el.style.opacity = o.opacity;
}

function applyApproach(f, els) {
  if (els.mated) { place(els.mated, f.mated); }
  if (els.matedFlame) els.matedFlame.style.opacity = f.matedFlame;
}

function applySeparation(f, els) {
  if (els.mated) els.mated.style.opacity = 0;          // the split pair takes over from the mated stack
  if (els.matedFlame) els.matedFlame.style.opacity = 0;
  place(els.s2, f.s2);
  place(els.debris, f.debris);
  if (els.boostFlame) els.boostFlame.style.opacity = f.boostFlame;
  if (els.s2Flame) els.s2Flame.style.opacity = f.s2Flame;
}

export function buildSeparation(els, t) {
  const ctxOf = () => ({ W: window.innerWidth, H: window.innerHeight });

  // approach: starts APPROACH_LEAD_VH before the Work→About gap, ends exactly
  // where the About pin starts (same trigger + position formula as the pin)
  const ap = { p: 0 };
  const apTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#gapStage",
      start: () => `top bottom-=${Math.round((1 - t.APPROACH_LEAD_VH) * window.innerHeight)}`,
      endTrigger: ".about-pin",
      end: () => `top ${(t.PIN_TOP_FRAC * 100).toFixed(1)}%`,
      scrub: 0.9, invalidateOnRefresh: true,
    },
  });
  apTl.to(ap, { p: 1, ease: "none", duration: 1, onUpdate: () => {
    // a scrubbed timeline renders p=0 at load/refresh — never paint outside the phase
    const sp = apTl.scrollTrigger.progress;
    if (sp <= 0 || sp >= 1) return;
    applyApproach(approachFrame(ap.p, ctxOf(), t), els);
  } });

  // separation: spans the About pin exactly (same start formula + grid-snapped length)
  const se = { p: 0 };
  const seTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-pin",
      start: () => `top ${(t.PIN_TOP_FRAC * 100).toFixed(1)}%`,
      end: () => `+=${pinEnd(t.PIN_DUR_VH, window.innerHeight)}`,
      scrub: 0.9, invalidateOnRefresh: true,
    },
  });
  seTl.to(se, { p: 1, ease: "none", duration: 1, onUpdate: () => {
    if (seTl.scrollTrigger.progress <= 0) return;
    applySeparation(separationFrame(se.p, ctxOf(), t), els);
  } });

  return { approach: apTl.scrollTrigger, separation: seTl.scrollTrigger };
}
