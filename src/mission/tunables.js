/* ════════════════════════════════════════════════════════════════════════
   MISSION TUNABLES — the feel of the whole scroll-choreographed flight.

   Everything is anchored to ELEMENT POSITIONS (ScrollTrigger element-based
   start/end + the measured ctx), never to hard-coded scroll pixels — so you
   can freely edit the résumé copy (add jobs, rewrite paragraphs, resize
   sections) and the rocket choreography keeps lining up automatically.
   Tweak these constants to retune the feel; you should not need to touch
   the math.

     GRID_PX          graph-paper square size (must match camron.css/site.css = 30)
     APPROACH_LEAD_VH how early the rocket flies in, in viewport-heights BEFORE
                      the Work→About gap. Smaller = enters later (less Work overlap)
     PIN_DUR_VH       how long the About stays frozen (scroll distance, in vh).
                      Snapped to whole grid squares so the frozen graph-paper layer
                      hands back to the page with no jump.
     PIN_TOP_FRAC     where the frozen About sits: its top this far below the
                      viewport top. The rocket flies in the clear band ABOVE it.
     ROCKET_Y_FRAC /  staging height of the rocket (fraction of viewport) + a px
     ROCKET_Y_MIN     floor so it never collides with the fixed nav.
     ROCKET_X_FRAC    horizontal staging point (fraction of viewport width).

   PHASE 3 · the Skills section freezes for the astronaut tour + handoff.
     SKILLS_PIN_DUR_VH    frozen scroll length for the tour + handoff only.
     SKILLS_PIN_TOP_FRAC  where the frozen Skills sits.
     ASTRO_ABOVE_CARDS    px the astronaut floats above the card row.
     TOUR_END             astronaut tour done (enter → far-left → touch L→R);
                          the remainder of the pin is the handoff to orbit.
     CAPSULE_X_FRAC       capsule "mothership" hold during the tour.

   PHASE 4 · ORBIT (unpinned, over Experience) → LANDING (Contact pinned).
     CAP_HOLD_FRAC        capsule hold height during tour = orbit entry (no jump)
     ORBIT_EXIT_FRAC      viewport height the orbit coast reaches before the pin
     LANE_OFF_FRAC        lane longitude: this far left of the landing spot
     BURN_Y_FRAC          viewport height of the burn point on the lane
     NOSE_DOWN_AT         frac of the descent where engine-first → nose-down
     FOOT_PIN_DUR_VH      landing pin scroll length — the long, slow shrink
     LAND_FLIP_AT/_LEN    where along the landing pin the retro-burn flip happens
     LAND_SHRINK_START    ship reaches the globe full-size, then shrinks slowly
     EARTH_LAND_DEG/_R    landing spot relative to the globe centre (deg / radius frac)
     EARTH_SPIN_DEG       globe rotation during descent (swings the Pacific coast up)
   ════════════════════════════════════════════════════════════════════════ */
export const TUNABLES = {
  GRID_PX: 30,
  // phase 1 · launch
  LAUNCH_CD_VH: 0.78,
  LAUNCH_TILT: 13,
  // phase 2 · approach + separation
  APPROACH_LEAD_VH: 0.55,
  PIN_DUR_VH: 1.2,
  PIN_TOP_FRAC: 0.26,
  ROCKET_Y_FRAC: 0.13, ROCKET_Y_MIN: 115,
  ROCKET_X_FRAC: 0.44,
  // phase 3 · spacewalk
  SKILLS_PIN_DUR_VH: 1.7,
  SKILLS_PIN_TOP_FRAC: 0.07,
  ASTRO_ABOVE_CARDS: 64,
  ASTRO_SCALE: 1,
  CAPSULE_X_FRAC: 0.84,
  TOUR_END: 0.66,
  // phase 4 · orbit + landing
  CAP_HOLD_FRAC: 0.12,
  ORBIT_EXIT_FRAC: 0.22,
  LANE_OFF_FRAC: 0.095,
  BURN_Y_FRAC: 0.27,
  NOSE_DOWN_AT: 0.72,
  FOOT_PIN_DUR_VH: 2.6,
  FOOT_PIN_TOP_FRAC: 0.0,
  LAND_FLIP_AT: 0.16, LAND_FLIP_LEN: 0.12,
  LAND_SHRINK_START: 0.56,
  DESC_SHRINK_END: 0.05,
  EARTH_LAND_DEG: 256,
  EARTH_LAND_R: 0.42,
  EARTH_SPIN_DEG: 16,
};

/* mobile (≤768px) re-staging — spread over TUNABLES by the matchMedia boot */
export const MOBILE = {
  PIN_TOP_FRAC: 0.34,
  ROCKET_Y_FRAC: 0.10,
  SKILLS_PIN_TOP_FRAC: 0.04,
  ASTRO_ABOVE_CARDS: 24,
};

export const GRID_PX = TUNABLES.GRID_PX;
