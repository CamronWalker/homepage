import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { clamp01, lerp, easeInOut, buildOrbitPaths } from "./geometry.js";
import { pinEnd } from "./pins.js";

/* ── PHASE 4 · ORBIT → BURN → LANDING → DONE ──────────────────────────────
   Orbit (unpinned, over Experience): the ship rides the fly-by lane prograde,
   engines cold, drifting — looking like it'll pass the planet by.
   Landing (Contact pinned, the long cinematic beat): coast to the branch;
   HOLD + flip retrograde with one short punchy flame while the single orbit
   line MORPHS from wrap-around miss to coastal descent (no second line ever
   appears); ride the new line engine-first; rotate nose-down for the final
   dive; arrive and shrink into the orange dot off the California coast while
   the globe swings the Pacific up underneath. Done: scene pegged, ghost
   trace lingering.                                                          */

export function landingBeats(t) {
  const flipStart = t.LAND_FLIP_AT;
  const flipEnd = t.LAND_FLIP_AT + t.LAND_FLIP_LEN;
  const shrinkStart = t.LAND_SHRINK_START;
  const burnP = (p) => clamp01((p - flipStart) / t.LAND_FLIP_LEN);
  const shrink = (p) => clamp01((p - shrinkStart) / (1 - shrinkStart));
  return {
    flipStart, flipEnd, shrinkStart, burnP, shrink,
    flame: (p) => (p >= flipStart && p < flipEnd) ? Math.sin(burnP(p) * Math.PI) : 0,
    noseRot: (dte) => 180 * (1 - easeInOut(clamp01((dte - t.NOSE_DOWN_AT) / (1 - t.NOSE_DOWN_AT)))),
    scaleAt: (p) => lerp(1, t.DESC_SHRINK_END, shrink(p)),
    shipFade: (p) => clamp01((0.985 - p) / 0.05),
    globeRot: (p) => t.EARTH_SPIN_DEG * easeInOut(clamp01(p)),
    glowOpacity: (p) => clamp01((shrink(p) - 0.5) / 0.35),
  };
}

/* point + travel-direction angle (deg) at param u (0–1) along a live path */
function ptAt(pathEl, u) {
  const L = pathEl.getTotalLength();
  const p = pathEl.getPointAtLength(u * L);
  const p2 = pathEl.getPointAtLength(Math.min(L, u * L + 1.5));
  return { x: p.x, y: p.y, ang: Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI };
}
/* length-fraction of the point on pathEl nearest to pt (coarse scan + refine).
   The orbit arc isn't y-monotonic any more (it enters from the right and crests
   over the planet), so the ship rides by PATH LENGTH, not by viewport height. */
function uOfPoint(pathEl, pt) {
  const L = pathEl.getTotalLength();
  let bestU = 0, bestD = Infinity;
  for (let i = 0; i <= 80; i++) {
    const u = i / 80, p = pathEl.getPointAtLength(u * L);
    const d = (p.x - pt.x) ** 2 + (p.y - pt.y) ** 2;
    if (d < bestD) { bestD = d; bestU = u; }
  }
  for (let i = -9; i <= 9; i++) {
    const u = clamp01(bestU + i / 800), p = pathEl.getPointAtLength(u * L);
    const d = (p.x - pt.x) ** 2 + (p.y - pt.y) ** 2;
    if (d < bestD) { bestD = d; bestU = u; }
  }
  return bestU;
}

/* fraction of the lane between the ride-in point and the burn knot that the
   unpinned ORBIT phase covers; the pinned landing coast rides the rest */
const LANE_SPLIT = 0.55;

function place(el, x, y, rot, sc, op) {
  el.style.left = x + "px";
  el.style.top = y + "px";
  el.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(${sc == null ? 1 : sc})`;
  if (op != null) el.style.opacity = op;
}

export function buildLanding(els, t, { missionST } = {}) {
  const beats = landingBeats(t);
  let globeSpin = null;
  const spinEl = () => (globeSpin || (globeSpin = els.footerEarth && els.footerEarth.querySelector("#globeSpin")));

  function globeRect() {
    const g = els.footerEarth;
    const live = g.getBoundingClientRect();
    const pinST = lndTl && lndTl.scrollTrigger;
    // After the landing completes the scene unpins and the ghost trace must track
    // the globe as it scrolls; before/while pinned, anchor the orbit to where the
    // globe SITS once the contact pin engages — during the unpinned approach the
    // globe is still below the fold, and anchoring to its live rect would draw
    // the whole orbit off-screen. The predicted rect equals the pinned rect, so
    // the pin engages with zero jump.
    if (pinST && pinST.progress >= 1) {
      return { left: live.left, top: live.top, width: live.width, offsetWidth: g.offsetWidth || live.width };
    }
    const pinStart = pinST ? pinST.start : 0;
    const pinnedTop = (live.top + window.scrollY) - pinStart;   // viewport top at scroll == pin start
    return { left: live.left, top: pinnedTop, width: live.width, offsetWidth: g.offsetWidth || live.width };
  }

  let P4 = null;
  function rebuild(burnP) {
    if (els.flOrbit && els.flOrbit.hasAttribute("viewBox")) els.flOrbit.removeAttribute("viewBox"); // viewport px coords
    P4 = buildOrbitPaths(window.innerWidth, window.innerHeight, burnP, globeRect());
    els.orbitFly.setAttribute("d", P4.flyD);
    els.orbitDesc.setAttribute("d", P4.descD);
    els.orbitDesc.style.opacity = 0;          // math path — never drawn
    // ride anchors along the lane: nearest point to the capsule hold, and the burn knot
    P4.u0 = uOfPoint(els.orbitFly, { x: t.CAPSULE_X_FRAC * window.innerWidth, y: t.CAP_HOLD_FRAC * window.innerHeight });
    P4.uB = uOfPoint(els.orbitFly, P4.B);
    return P4;
  }

  // late-bound hook for the Phase-3 handoff: lane pose nearest a given point,
  // so the ship glides from the capsule hold ONTO the orbit, tangent-aligned
  const laneNear = (pt) => {
    rebuild(0);
    return ptAt(els.orbitFly, uOfPoint(els.orbitFly, pt));
  };

  /* ORBIT — unpinned drift down the lane while Experience scrolls */
  const orb = { p: 0 };
  const orbTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".contact-pin",
      start: () => (missionST ? missionST.end : 0),
      end: () => `top ${(t.FOOT_PIN_TOP_FRAC * 100).toFixed(1)}%`,
      scrub: 0.9, invalidateOnRefresh: true,
    },
  });
  orbTl.to(orb, { p: 1, ease: "none", duration: 1, onUpdate: () => {
    const sp = orbTl.scrollTrigger.progress;
    if (sp <= 0 || sp >= 1) return;
    rebuild(0);
    // ride the orbit by length: from the handoff point partway toward the burn knot
    const pos = ptAt(els.orbitFly, lerp(P4.u0, lerp(P4.u0, P4.uB, LANE_SPLIT), easeInOut(orb.p)));
    const drift = Math.sin(orb.p * Math.PI * 2) * 5;
    els.flOrbit.style.opacity = Math.min(1, 0.8 + orb.p * 2);
    els.orbitFly.style.opacity = 0.55;
    place(els.s2, pos.x + drift * 0.6, pos.y, pos.ang + 90, 1, 1);   // prograde — nose leads
    if (els.s2Flame) els.s2Flame.style.opacity = 0;                  // coasting — engines cold
    const gs = spinEl(); if (gs) gs.setAttribute("transform", "rotate(0 810 330)");
  } });

  /* LANDING — spans the Contact pin */
  const lnd = { p: 0 };
  const lndTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".contact-pin",
      start: () => `top ${(t.FOOT_PIN_TOP_FRAC * 100).toFixed(1)}%`,
      end: () => `+=${pinEnd(t.FOOT_PIN_DUR_VH, window.innerHeight)}`,
      scrub: 0.9, invalidateOnRefresh: true,
    },
  });
  lndTl.to(lnd, { p: 1, ease: "none", duration: 1, onUpdate: () => {
    const sp = lndTl.scrollTrigger.progress;
    if (sp <= 0) return;
    const p = lnd.p;
    const bp = beats.burnP(p);
    rebuild(bp);                                       // the burn RESHAPES the one orbit line
    const shr = beats.shrink(p);
    els.flOrbit.style.opacity = 1;
    els.orbitFly.style.opacity = (0.55 * (1 - shr * 0.7)).toFixed(2);
    const proAng = ptAt(els.orbitFly, P4.uB).ang + 90;
    const retroAng = ptAt(els.orbitDesc, 0).ang + 90 + 180;
    let pos, rot, sc = 1;
    const flame = beats.flame(p);
    if (els.s2Flame) els.s2Flame.classList.toggle("burn", p >= beats.flipStart && p < beats.flipEnd);
    if (p < beats.flipStart) {                          // coast along the orbit, prograde, cold
      const uS = lerp(P4.u0, P4.uB, LANE_SPLIT);
      pos = ptAt(els.orbitFly, lerp(uS, P4.uB, easeInOut(p / beats.flipStart)));
      rot = pos.ang + 90;
    } else if (p < beats.flipEnd) {                     // BURN: hold at the branch, flip retrograde
      pos = P4.B;
      rot = lerp(proAng, retroAng, easeInOut(bp));
    } else if (p < beats.shrinkStart) {                 // engine-first descent, then nose-down
      const dte = easeInOut(clamp01((p - beats.flipEnd) / (beats.shrinkStart - beats.flipEnd)));
      pos = ptAt(els.orbitDesc, dte);
      rot = pos.ang + 90 + beats.noseRot(dte);
    } else {                                            // arrived: slow shrink into the dot
      pos = P4.L;
      rot = ptAt(els.orbitDesc, 0.99).ang + 90;         // u=1 tangent degenerates — sample just shy
      sc = beats.scaleAt(p);
    }
    if (els.s2Flame) els.s2Flame.style.opacity = flame;
    place(els.s2, pos.x, pos.y, rot, sc, beats.shipFade(p));
    const gs = spinEl(); if (gs) gs.setAttribute("transform", `rotate(${beats.globeRot(p)} 810 330)`);
    if (els.flGlow) {
      els.flGlow.setAttribute("cx", P4.L.x); els.flGlow.setAttribute("cy", P4.L.y);
      els.flGlow.setAttribute("r", "7");
      els.flGlow.style.opacity = beats.glowOpacity(p).toFixed(2);
    }
  } });

  /* HEAL — a scrubbed timeline init-renders once during load/refresh, possibly
     before pin layout settles; if the trigger progress then doesn't change, no
     onUpdate fires and a line built from a mid-layout globe rect would survive.
     After every refresh, rebuild the line from the LIVE rect at live progress. */
  ScrollTrigger.addEventListener("refresh", () => {
    const lp = lndTl.scrollTrigger ? lndTl.scrollTrigger.progress : 0;
    const op = orbTl.scrollTrigger ? orbTl.scrollTrigger.progress : 0;
    if (lp > 0 || op > 0) rebuild(beats.burnP(lp));
  });

  /* DONE — past the pin the scene stays pegged to the globe (ghost trace + dot) */
  const doneST = (function () {
    let st = null;
    st = gsap.timeline({
      scrollTrigger: {
        trigger: ".contact-pin",
        start: () => `top+=${pinEnd(t.FOOT_PIN_DUR_VH, window.innerHeight)} ${(t.FOOT_PIN_TOP_FRAC * 100).toFixed(1)}%`,
        end: "max",
        scrub: true, invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (self.progress <= 0 && !self.isActive) return;   // refresh fires this out of range
          rebuild(1);                                   // line stays in its final bent shape
          els.flOrbit.style.opacity = 1;
          els.orbitFly.style.opacity = 0.2;             // the flight path lingers faintly
          const gs = spinEl(); if (gs) gs.setAttribute("transform", `rotate(${t.EARTH_SPIN_DEG} 810 330)`);
          if (els.flGlow) {
            els.flGlow.setAttribute("cx", P4.L.x); els.flGlow.setAttribute("cy", P4.L.y);
            els.flGlow.setAttribute("r", "7"); els.flGlow.style.opacity = "1";
          }
        },
      },
    });
    return st.scrollTrigger;
  })();

  return { refs: { orbit: orbTl.scrollTrigger, landing: lndTl.scrollTrigger, done: doneST }, laneNear };
}
