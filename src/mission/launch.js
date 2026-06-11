import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { clamp01, lerp, easeIn } from "./geometry.js";

/* ── PHASE 1 · LAUNCH ─────────────────────────────────────────────────────
   Countdown: hero pinned; the pad NEVER moves (dead-zone) while the
   hand-lettered count steps T–3 → T–2 → T–1 → LIFTOFF at quarter-points,
   shake and ember building, flame flaring at ignition.
   Climb: ease-in (slow off the pad, heavy-lift feel), progressive lean to
   LAUNCH_TILT with a slight leftward drift; pad fades in the first 8%.   */

export function countdownFrame(ct) {
  ct = clamp01(ct);
  let label, ignite = false;
  if (ct < 0.25) label = "T–3";
  else if (ct < 0.5) label = "T–2";
  else if (ct < 0.75) label = "T–1";
  else { label = "LIFTOFF"; ignite = true; }
  return {
    label, ignite,
    shakePx: ignite ? 2.6 : 0.3 + ct * 1.6,
    emberScaleY: ignite ? lerp(0.5, 0.78, clamp01((ct - 0.75) * 4)) : 0.06 + ct * 0.32,
    flameOpacity: ignite ? 1 : clamp01(ct * 0.8),
    tipOpacity: 1,
    stack: { x: 0, y: 0, rot: 0 },
  };
}

export function climbFrame(u, { H, svgH, tilt = 13 }) {
  u = clamp01(u);
  const ue = easeIn(u);
  // climb in svg units, guaranteed to clear the viewport top (prototype math)
  const climbTotal = (H + svgH * 1.2) * (660 / svgH);
  return {
    stack: { x: lerp(0, -150, ue), y: lerp(0, -climbTotal, ue), rot: lerp(0, -tilt, ue) },
    flameScaleY: 1 + u * 0.2,
    padOpacity: clamp01(1 - u / 0.08),
    tipOpacity: clamp01(1 - u / 0.5),
    flameOpacity: 1,
  };
}

/* ── appliers ── */
function applyCountdown(f, p, els) {
  els.flLaunch.style.opacity = 1;
  els.stackG.setAttribute("transform", "translate(0 0)");
  els.stackShake.style.setProperty("--rk-shake", f.shakePx.toFixed(2) + "px");
  els.flPad.style.opacity = 1;
  if (els.flScale) els.flScale.style.transform = `scaleY(${f.emberScaleY.toFixed(3)})`;
  if (els.lFlame) els.lFlame.style.opacity = f.flameOpacity;
  if (els.flCount) {
    els.flCount.innerHTML = f.ignite ? "LIFT<br>OFF" : f.label;
    els.flCount.style.opacity = p > 0.01 ? 1 : 0;
    els.flCount.classList.toggle("liftoff", f.ignite);
  }
  if (els.flTip) els.flTip.style.opacity = f.tipOpacity;
}

function applyClimb(f, els) {
  els.flLaunch.style.opacity = 1;
  els.stackShake.style.setProperty("--rk-shake", "0px");
  els.stackG.setAttribute("transform",
    `translate(${f.stack.x.toFixed(1)} ${f.stack.y.toFixed(1)}) rotate(${f.stack.rot.toFixed(2)} 270 337)`);
  if (els.flScale) els.flScale.style.transform = `scaleY(${f.flameScaleY.toFixed(3)})`;
  els.flPad.style.opacity = f.padOpacity;
  if (els.lFlame) els.lFlame.style.opacity = f.flameOpacity;
  if (els.flCount) els.flCount.style.opacity = 0;
  if (els.flTip) els.flTip.style.opacity = f.tipOpacity;
}

export function buildLaunch(els, t) {
  const cdEnd = () => `+=${Math.round(t.LAUNCH_CD_VH * window.innerHeight)}`;

  // hero pinned for the countdown
  ScrollTrigger.create({
    trigger: "#top", start: "top top", end: cdEnd,
    pin: true, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
  });

  const cd = { p: 0 };
  const cdTl = gsap.timeline({
    scrollTrigger: { trigger: "#top", start: "top top", end: cdEnd, scrub: 0.6, invalidateOnRefresh: true },
  });
  cdTl.to(cd, { p: 1, ease: "none", duration: 1, onUpdate: () => {
    if (cdTl.scrollTrigger.progress >= 1) return;   // climb (or transit) owns the cast now
    applyCountdown(countdownFrame(cd.p), cd.p, els);
  } });

  // climb: from hero-pin release (work top at viewport bottom) to work top at viewport top
  const cl = { p: 0 };
  const clTl = gsap.timeline({
    scrollTrigger: { trigger: "#work", start: "top bottom", end: "top top", scrub: 0.9, invalidateOnRefresh: true },
  });
  clTl.to(cl, {
    p: 1, ease: "none", duration: 1,
    onUpdate: () => {
      if (clTl.scrollTrigger.progress >= 1) return;   // stage manager masks the cast past here
      const svgH = els.flLaunch.getBoundingClientRect().height || 500;
      applyClimb(climbFrame(cl.p, { H: window.innerHeight, svgH, tilt: t.LAUNCH_TILT }), els);
    },
  });

  return { climb: clTl.scrollTrigger };   // the stage manager masks the launch cast past this
}
