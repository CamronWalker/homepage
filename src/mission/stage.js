import gsap from "gsap";

/* ── STAGE MANAGER ────────────────────────────────────────────────────────
   One writer owns "who is allowed on stage". Phase appliers paint elements
   while their trigger is in range; this ticker callback runs AFTER all tween
   updates each frame (user ticker callbacks run after GSAP's render pass)
   and force-hides anything whose phase is provably out of range. This kills
   the race between scrub catch-up tweens and trigger enter/leave callbacks —
   the prototype solved the same problem by resetting the cast every frame.

   Each rule: [element key(s), predicate(refs) → true when the cast member
   must be OFF stage]. Rules only ever hide; appliers own in-phase opacity. */

export function createStageManager(els, refs) {
  const past = (st) => !!st && st.progress >= 1;
  const before = (st) => !!st && st.progress <= 0;
  const out = (st) => !st || st.progress <= 0 || st.progress >= 1;

  const rules = [
    // launch cast leaves once the climb range is fully passed
    [["flLaunch", "flPad", "lFlame", "flTip", "flCount"], (r) => past(r.climb)],
    // mated stack only exists inside the approach range
    [["mated", "matedFlame"], (r) => out(r.approach)],
    // split pair appears only inside the separation pin (s2 ownership is
    // widened by later phases via refs.s2Owners)
    [["debris", "boostFlame"], (r) => out(r.separation)],
    [["s2", "s2Flame"], (r) => (r.s2Owners || [r.separation]).every(out)],
    // astronaut + tether exist only inside the spacewalk pin
    [["astro", "flLink"], (r) => out(r.mission)],
    // orbit line + landing glow live from the handoff through the pegged done state
    [["flOrbit", "flGlow"], (r) => [r.mission, r.orbit, r.landing, r.done].every(out)],
  ];

  const tick = () => {
    for (const [keys, off] of rules) {
      if (!off(refs)) continue;              // applier owns it while in range
      for (const key of keys) { const el = els[key]; if (el) el.style.opacity = 0; }
    }
  };
  gsap.ticker.add(tick);
  return () => gsap.ticker.remove(tick);
}
