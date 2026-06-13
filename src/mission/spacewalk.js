import gsap from "gsap";
import { clamp01, lerp, easeOut, easeInOut } from "./geometry.js";
import { pinEnd } from "./pins.js";

/* ── PHASE 3 · COAST + SPACEWALK ──────────────────────────────────────────
   Coast: the capsule (which burned off-right in Phase 2) re-enters from
   off-right and drifts to its "mothership" hold, gently bobbing.
   Tour (first TOUR_END of the Skills pin): the astronaut emerges from the
   capsule, swims the big right-to-left crossing to the far-left card, then
   tours the cards left→right — the card under him lifts with a blue accent —
   tethered to the capsule the whole time.
   Handoff (rest of the pin): astronaut returns and fades; the dashed orbit
   line sketches in; the ship turns to face down the lane at the capsule-hold
   height, so Phase 4 begins with zero jump.                                */

export function capsuleHold(ctx, t) {
  return { x: t.CAPSULE_X_FRAC * ctx.W, y: t.CAP_HOLD_FRAC * ctx.H };
}

export function coastFrame(p, ctx, t) {
  p = clamp01(p);
  const hold = capsuleHold(ctx, t);
  return {
    s2: {
      x: lerp(1.35 * ctx.W, hold.x, easeOut(p)),
      y: hold.y,
      rot: 198 + Math.sin(p * 6.28) * 4,
      opacity: 1,
    },
  };
}

const LEAD_IN = 0.18;   // fraction of the tour spent crossing from the capsule to the first card

/* The tour is a serpentine over card ROWS: cards group into rows by centre-y,
   rows visit top→bottom, direction alternating per row, the astronaut riding
   ASTRO_ABOVE_CARDS above each row. One algorithm covers every breakpoint —
   a single desktop row degenerates to the classic far-left-then-L→R sweep,
   the tablet 2×2 serpentines, and the phone column rides straight down.    */
export function tourWaypoints(ctx, t) {
  const sorted = [...ctx.cards].sort((a, b) => a.cy - b.cy || a.cx - b.cx);
  const rows = [];
  for (const c of sorted) {
    const h = Math.max(40, (c.bottom - c.top) * 0.5);
    const row = rows.find((r) => Math.abs(r.cy - c.cy) < h);
    if (row) { row.cards.push(c); } else rows.push({ cy: c.cy, cards: [c] });
  }
  const pts = [];
  rows.forEach((row, i) => {
    row.cards.sort((a, b) => a.cx - b.cx);
    const ordered = i % 2 === 0 ? row.cards : [...row.cards].reverse();
    const y = Math.max(Math.min(...row.cards.map((c) => c.top)) - t.ASTRO_ABOVE_CARDS, 96);
    ordered.forEach((c) => pts.push({ x: c.cx, y, card: ctx.cards.indexOf(c) }));
  });
  return pts;
}

function pointAlong(pts, u) {
  if (pts.length === 1) return { x: pts[0].x, y: pts[0].y };
  const segs = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y) || 1e-6;
    segs.push(d); total += d;
  }
  let s = clamp01(u) * total;
  for (let i = 0; i < segs.length; i++) {
    if (s <= segs[i]) {
      const k = s / segs[i];
      return { x: lerp(pts[i].x, pts[i + 1].x, k), y: lerp(pts[i].y, pts[i + 1].y, k) };
    }
    s -= segs[i];
  }
  return { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y };
}

export function missionFrame(p, ctx, t) {
  p = clamp01(p);
  const hold = capsuleHold(ctx, t);
  const pts = tourWaypoints(ctx, t);
  const endWp = pts[pts.length - 1];

  if (p < t.TOUR_END) {
    const tt = clamp01(p / t.TOUR_END);
    let ax, ay;
    if (tt < LEAD_IN) {
      const k = easeInOut(tt / LEAD_IN);
      ax = lerp(hold.x, pts[0].x, k);
      ay = lerp(hold.y + 0.04 * ctx.H, pts[0].y, k);
    } else {
      const pos = pointAlong(pts, easeInOut((tt - LEAD_IN) / (1 - LEAD_IN)));
      ax = pos.x; ay = pos.y;
    }
    let active = -1;
    for (let k = 0; k < ctx.cards.length; k++) {
      const c = ctx.cards[k];
      const rowY = Math.max(c.top - t.ASTRO_ABOVE_CARDS, 96);
      if (ax >= c.left - 8 && ax <= c.right + 8 && Math.abs(ay - rowY) < 46) { active = k; break; }
    }
    ay += Math.sin(p * Math.PI * 7) * 7 + (active >= 0 ? 12 : 0);
    const swFade = clamp01(tt / 0.05);
    const px = hold.x - 0.02 * ctx.W, py = hold.y + 0.02 * ctx.H;
    const mx = (px + ax) / 2, my = Math.max(py, ay) + 0.05 * ctx.H;
    return {
      s2: { x: hold.x, y: hold.y, rot: 198 + Math.sin(p * 6.28) * 3, opacity: 1 },
      astro: { x: ax, y: ay, rot: Math.sin(p * Math.PI * 6) * 5 - 4, scale: t.ASTRO_SCALE, opacity: swFade },
      tether: { d: `M${px.toFixed(1)} ${py.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${ax.toFixed(1)} ${ay.toFixed(1)}`, opacity: swFade },
      activeCard: active,
      orbit: { opacity: 0, lineOpacity: 0 },
      ship: { x: hold.x, y: hold.y, rot: 198, laneBlend: 0 },
    };
  }

  // handoff — astronaut returns from wherever the tour ended toward the capsule
  const ht = clamp01((p - t.TOUR_END) / (1 - t.TOUR_END));
  return {
    s2: { x: hold.x, y: hold.y, rot: 198, opacity: 1 },
    astro: {
      x: lerp(endWp.x, hold.x - 0.04 * ctx.W, easeOut(ht)),
      y: lerp(endWp.y, hold.y + 0.05 * ctx.H, easeOut(ht)),
      rot: -4, scale: t.ASTRO_SCALE, opacity: clamp01(1 - ht * 1.6),
    },
    tether: { d: "", opacity: clamp01(1 - ht * 2) },
    activeCard: -1,
    orbit: { opacity: ht * 0.8, lineOpacity: ht * 0.55 },
    ship: { x: hold.x, y: hold.y, rot: 198, laneBlend: easeInOut(ht) },
  };
}

/* ── appliers ── */
function place(el, o) {
  el.style.left = o.x + "px";
  el.style.top = o.y + "px";
  el.style.transform = `translate(-50%,-50%) rotate(${o.rot}deg) scale(${o.scale == null ? 1 : o.scale})`;
  el.style.opacity = o.opacity;
}

export function buildSpacewalk(els, t, hooks = {}) {
  const ctxOf = () => {
    const cards = [...els.skillCards].map((el) => {
      const r = el.getBoundingClientRect();
      return { el, left: r.left, right: r.right, top: r.top, bottom: r.bottom, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    });
    return { W: window.innerWidth, H: window.innerHeight, cards,
             cardsTop: cards.length ? Math.min(...cards.map((c) => c.top)) : 0.4 * window.innerHeight };
  };

  const clearCards = () => els.skillCards.forEach((c) => c.classList.remove("sk-active"));

  // coast: from the About pin's release to the Skills pin's start
  const co = { p: 0 };
  const coTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-pin",
      start: () => `bottom ${(t.PIN_TOP_FRAC * 100).toFixed(1)}%`,
      endTrigger: ".skills-pin",
      end: () => `top ${(t.SKILLS_PIN_TOP_FRAC * 100).toFixed(1)}%`,
      scrub: 0.9, invalidateOnRefresh: true,
    },
  });
  coTl.to(co, { p: 1, ease: "none", duration: 1, onUpdate: () => {
    const sp = coTl.scrollTrigger.progress;
    if (sp <= 0 || sp >= 1) return;
    const f = coastFrame(co.p, ctxOf(), t);
    place(els.s2, f.s2);
    if (els.s2Flame) els.s2Flame.style.opacity = 0;     // engines cold on the drift
  } });

  // When the pinned Skills column is taller than the viewport (phones), pan it
  // up in sync with the tour so the card being visited is always on screen.
  // The astronaut tracks the pan for free — card rects are read live per frame.
  const panFor = (p) => {
    if (!els.skillsFix) return 0;
    const visible = window.innerHeight * (1 - t.SKILLS_PIN_TOP_FRAC) - 24;
    const panMax = Math.max(0, els.skillsFix.offsetHeight - visible);
    if (p < t.TOUR_END) return panMax * easeInOut(clamp01(p / t.TOUR_END));
    // handoff: pan back down so the pin releases with the content in natural flow
    return panMax * (1 - easeInOut(clamp01((p - t.TOUR_END) / (1 - t.TOUR_END))));
  };
  const resetPan = () => { if (els.skillsFix) els.skillsFix.style.transform = ""; };

  // tour + handoff: spans the Skills pin exactly
  const mi = { p: 0 };
  const miTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".skills-pin",
      start: () => `top ${(t.SKILLS_PIN_TOP_FRAC * 100).toFixed(1)}%`,
      end: () => `+=${pinEnd(t.SKILLS_PIN_DUR_VH, window.innerHeight)}`,
      scrub: 0.9, invalidateOnRefresh: true,
      onLeave: () => { clearCards(); resetPan(); },
      onLeaveBack: () => { clearCards(); resetPan(); },
    },
  });
  miTl.to(mi, { p: 1, ease: "none", duration: 1, onUpdate: () => {
    const sp = miTl.scrollTrigger.progress;
    if (sp <= 0) { resetPan(); return; }
    const pan = panFor(mi.p);
    if (pan > 0) els.skillsFix.style.transform = `translateY(${(-pan).toFixed(1)}px)`;
    const ctx = ctxOf();
    const f = missionFrame(mi.p, ctx, t);
    place(els.astro, f.astro);
    if (els.flLink) els.flLink.style.opacity = f.tether.opacity;
    if (els.tether && f.tether.d) els.tether.setAttribute("d", f.tether.d);
    els.skillCards.forEach((c, i) => c.classList.toggle("sk-active", i === f.activeCard));
    if (els.flOrbit) els.flOrbit.style.opacity = f.orbit.opacity;
    if (els.orbitFly) els.orbitFly.style.opacity = f.orbit.lineOpacity;
    if (els.orbitDesc) els.orbitDesc.style.opacity = 0;
    if (els.s2Flame) els.s2Flame.style.opacity = 0;
    // ship: hold pose blended onto the nearest point of the orbit, tangent-aligned
    // (the lane pose is resolved by phase 4's geometry)
    if (f.ship.laneBlend > 0 && hooks.laneNear) {
      const lane = hooks.laneNear({ x: f.ship.x, y: f.ship.y });
      place(els.s2, {
        x: lerp(f.ship.x, lane.x, f.ship.laneBlend),
        y: lerp(f.ship.y, lane.y, f.ship.laneBlend),
        rot: lerp(f.ship.rot, lane.ang + 90, f.ship.laneBlend),
        opacity: 1,
      });
    } else {
      place(els.s2, { x: f.ship.x, y: f.ship.y, rot: f.ship.rot, opacity: 1 });
    }
  } });

  return { coast: coTl.scrollTrigger, mission: miTl.scrollTrigger };
}
