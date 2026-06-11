/* camronwalker.com — interactions */
(function () {
  "use strict";
  var doc = document;
  var body = doc.body;

  /* ---------- year ---------- */
  var yr = doc.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- nav: stuck border + mobile burger + active link ---------- */
  var nav = doc.getElementById("nav");
  var burger = doc.getElementById("burger");
  var navlinks = doc.getElementById("navlinks");
  if (burger && navlinks) {
    burger.addEventListener("click", function () { navlinks.classList.toggle("open"); });
    navlinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") navlinks.classList.remove("open");
    });
  }

  /* ---------- scroll: nav border + the scroll-choreographed rocket mission ----------
     One fixed overlay (#flight) carries the whole journey. Phases are pinned to
     content anchors so each beat lines up with a section:
       LAUNCH   (top → #work)      blast off out the top, tilting left
       STAGING  (#work → #about)   horizontal L→R; stage 1 sheds, stage 2 ignites
       COAST    (#about → #exp)    capsule drifts; astronaut spacewalk R→L (tethered)
       REENTRY  (#exp → bottom)    dive from top-right down to the Earth (footer)   */
  var rmq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  var flight   = doc.getElementById("flight");
  var flLaunch = doc.getElementById("flLaunch");
  var stackG   = doc.getElementById("stackG");
  var stackShake = doc.getElementById("stackShake");
  var flPad    = doc.getElementById("flPad");

  // Build the launch scene from the shared studio parts (single source of truth)
  var P = window.ROCKET_PARTS;
  if (P && flPad && stackShake) {
    flPad.innerHTML = P.PAD + P.GANTRY;
    stackShake.innerHTML =
      '<g class="fl-flame" id="flLaunchFlame"><g class="fl-fl-inner"><g id="flScale">' +
        '<g transform="translate(255,568)">' + P.plume(300, 10, 13, 3.5) + '</g>' +
        '<g transform="translate(285,568)">' + P.plume(300, 10, 13, 3.5) + '</g>' +
      '</g></g></g>' +
      '<g transform="translate(270,311)">' + P.STACK + '</g>';
  }

  // Build phases 2+ from the same shared parts. All three use width-140 viewBoxes
  // CENTRED ON THE SEPARATION SEAM, so placing any of them at the same (x,y,rot)
  // lines their seams up exactly — the mated stack and the two split pieces share
  // one coordinate frame. Widths are set in JS (sizeRocketParts) to the launch scale.
  if (P) {
    var _s2 = doc.getElementById("flStage2");
    var _deb = doc.getElementById("flDebris");
    var _mat = doc.getElementById("flMated");
    // 2nd stage alone — mating face at part-y 90 → centre viewBox there
    if (_s2) _s2.innerHTML =
      '<svg viewBox="-70 -190 140 560" fill="none" style="overflow:visible;width:100%;height:auto;display:block">' +
        '<g class="fl-flame" id="flS2Flame"><g class="fl-fl-inner">' +
          '<g transform="translate(0,129)">' + P.plume(190, 12, 16, 4) + '</g>' +
        '</g></g>' + P.STAGE2 +
      '</svg>';
    // booster alone — mating face (top) at part-y -114 → centre viewBox there
    if (_deb) _deb.innerHTML =
      '<svg viewBox="-70 -394 140 560" fill="none" style="overflow:visible;width:100%;height:auto;display:block">' +
        '<g class="fl-flame" id="flBoostFlame"><g class="fl-fl-inner">' +
          '<g transform="translate(-15,143)">' + P.plume(150, 8, 11, 3) + '</g>' +
          '<g transform="translate(15,143)">' + P.plume(150, 8, 11, 3) + '</g>' +
        '</g></g>' + P.BOOSTER +
      '</svg>';
    // mated full stack — seam at part-y 0 → centre viewBox there (identical to launch rocket)
    if (_mat) _mat.innerHTML =
      '<svg viewBox="-70 -280 140 560" fill="none" style="overflow:visible;width:100%;height:auto;display:block">' +
        '<g class="fl-flame" id="flMatedFlame"><g class="fl-fl-inner">' +
          '<g transform="translate(-15,257)">' + P.plume(150, 8, 11, 3) + '</g>' +
          '<g transform="translate(15,257)">' + P.plume(150, 8, 11, 3) + '</g>' +
        '</g></g>' + P.STACK +
      '</svg>';
    // PHASE 3 · studio astronaut + satellite (the spacewalk uses the studio graphics)
    var _astro = doc.getElementById("flAstro");
    var _sat = doc.getElementById("flSat");
    if (_astro) _astro.innerHTML =
      '<svg viewBox="-330 -260 660 520" fill="none" style="overflow:visible;width:100%;height:auto;display:block">' + P.ASTRO + '</svg>';
    if (_sat) _sat.innerHTML =
      '<svg viewBox="-92 -56 184 112" fill="none" style="overflow:visible;width:100%;height:auto;display:block">' + P.SAT + '</svg>';
    // PHASE 4 · the landing globe lives in the pinned Contact scene now (rotation-ready
    // North-America globe). viewBox frames the studio globe square with margin.
    var _foot = doc.getElementById("landGlobe");
    if (_foot && P.earthNA) _foot.innerHTML =
      '<svg viewBox="342 -138 936 936" fill="none" preserveAspectRatio="xMidYMid meet">' + P.earthNA() + '</svg>';
  }
  var flScale  = doc.getElementById("flScale");
  var heroLaunch = doc.getElementById("top");
  var lFlame   = doc.getElementById("flLaunchFlame");
  var flCount  = doc.getElementById("flCount");
  var flTip    = doc.getElementById("flTip");
  var s2       = doc.getElementById("flStage2");
  var s2Flame  = doc.getElementById("flS2Flame");
  var debris   = doc.getElementById("flDebris");
  var astro    = doc.getElementById("flAstro");
  var sat      = doc.getElementById("flSat");
  var flLink   = doc.getElementById("flLink");
  var tether   = doc.getElementById("flTether");
  var boostFlame = doc.getElementById("flBoostFlame");
  var mated    = doc.getElementById("flMated");
  var matedFlame = doc.getElementById("flMatedFlame");
  var flEarth  = null;                             // big mid-page earth removed; landing is on the footer globe
  var footerEarth = doc.getElementById("landGlobe");
  var globeSpin = null;                            // resolved (landing globe) after earthNA injection
  var flOrbit  = doc.getElementById("flOrbit");
  var orbitSvg = doc.getElementById("flOrbit");
  var orbitFly = doc.getElementById("flOrbitFly");
  var orbitDesc = doc.getElementById("flOrbitDesc");
  var flGlow   = doc.getElementById("flGlow");

  // Size the Phase-2 pieces to the SAME px-per-svg-unit as the launch rocket, so the
  // mated stack is the same ~12 grid squares as Phase 1. Launch viewBox is 600 wide;
  // the part viewBoxes are 140 wide → partWidth = launchWidth * 140/600.
  function sizeRocketParts() {
    if (!flLaunch) return;
    var lw = flLaunch.getBoundingClientRect().width;
    if (!lw) return;
    var w = (lw * 140 / 600).toFixed(1) + "px";
    if (s2) s2.style.width = w;
    if (debris) debris.style.width = w;
    if (mated) mated.style.width = w;
  }
  sizeRocketParts();

  var elWork = doc.getElementById("work");
  var elGap = doc.getElementById("gapStage");
  var elAbout = doc.getElementById("about");
  var elExp = doc.getElementById("experience");
  var elContact = doc.getElementById("contact");
  var elFoot = doc.querySelector(".foot");
  var aboutPinEl = doc.querySelector(".about-pin");
  var aboutFixEl = doc.querySelector(".about-fix");
  var skillsPinEl = doc.querySelector(".skills-pin");
  var skillsFixEl = doc.querySelector(".skills-fix");
  var footPinEl = doc.querySelector(".contact-pin");
  var footFixEl = doc.querySelector(".contact-fix");
  var skillCards = skillsFixEl ? skillsFixEl.querySelectorAll(".skill-cat") : [];
  var pinGridEl = doc.getElementById("pinGrid");

  /* ════════════════════════════════════════════════════════════════════════
     PHASE-2 TRANSITION TUNABLES  (stage separation over the About section)

     Everything below is anchored to ELEMENT POSITIONS (measured live with
     topOf()), never to hard-coded scroll pixels — so you can freely edit the
     résumé copy (add jobs, rewrite paragraphs, resize sections) and the rocket
     choreography keeps lining up automatically. Tweak these constants to retune
     the feel; you should not need to touch the math.

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

     PHASE 3 + 4 · ONE pinned scene over the Skills section. Skills freezes once;
     the astronaut tours the cards, then the rocket flies in, retro-flips, and
     PHASE 3 (pinned) → PHASE 4 (unpinned scroll-down to the footer globe).
     The Skills section freezes ONLY for the astronaut tour + handoff; then the pin
     releases and the rocket flies DOWN the page along a dashed orbit line that runs
     from up in the scene all the way to the FOOTER globe, where it re-enters and
     lands just off the Pacific coast. Tour beats are fractions of the Skills pin;
     descent beats are fractions of the scroll from the pin end to the landing.
       SKILLS_PIN_DUR_VH    frozen scroll length for the tour + handoff only.
       SKILLS_PIN_TOP_FRAC  where the frozen Skills sits.
       ASTRO_ABOVE_CARDS    px the astronaut floats above the card row.
       TOUR_END             astronaut tour done (enter → far-left → touch L→R).
       (TOUR_END → 1)       handoff: astronaut fades, rocket + orbit line appear.
       CAPSULE_X_FRAC       capsule "mothership" hold during the tour.
       DESCENT_END_FRAC     scroll point (frac of page below the pin) where the
                            rocket reaches the footer globe and vanishes.
       LAND_FLIP_AT/_LEN    where along the landing pin (0–1) the retro-burn flip happens.
       NOSE_DOWN_AT         frac of the descent where engine-first rotates nose-down.
       EARTH_LAND_DEG/_R    landing spot relative to the globe centre (deg / radius frac).
       EARTH_SPIN_DEG       globe rotation during descent (swings the Pacific coast up).
     ════════════════════════════════════════════════════════════════════════ */
  var GRID_PX = 30;
  var APPROACH_LEAD_VH = 0.55;
  var PIN_DUR_VH = 1.2;
  var PIN_TOP_FRAC = 0.26;
  var ROCKET_Y_FRAC = 0.13, ROCKET_Y_MIN = 115;
  var ROCKET_X_FRAC = 0.44;
  var SKILLS_PIN_DUR_VH = 1.7;
  var SKILLS_PIN_TOP_FRAC = 0.07;
  var ASTRO_ABOVE_CARDS = 64;
  var ASTRO_SCALE = 1;
  var CAPSULE_X_FRAC = 0.84;
  // Phase 3 sub-beats (fractions of the Skills pin)
  var TOUR_END = 0.66;
  // Phase 4 · ORBIT (unpinned, over Experience) → LANDING (Contact PINNED).
  var CAP_HOLD_FRAC = 0.12;               // capsule hold height during tour = orbit entry (no jump)
  var ORBIT_EXIT_FRAC = 0.22;             // viewport height the orbit coast reaches before the pin takes over
  var LANE_OFF_FRAC = 0.095;              // lane longitude: this far left of the landing spot
  var BURN_Y_FRAC = 0.27;                 // viewport height of the burn point on the lane
  var NOSE_DOWN_AT = 0.72;                // frac of the descent where engine-first gives way to nose-down
  var FOOT_PIN_DUR_VH = 2.6;              // landing pin scroll length — the long, slow shrink
  var FOOT_PIN_TOP_FRAC = 0.0;            // Contact frozen at the top of the viewport
  var LAND_FLIP_AT = 0.16, LAND_FLIP_LEN = 0.12;  // burn happens early, right at the branch
  var LAND_SHRINK_START = 0.56;           // ship reaches the globe full-size, then shrinks slowly
  var DESC_SHRINK_END = 0.05;             // final scale before it becomes the landed dot
  var EARTH_LAND_DEG = 256;         // angle from globe centre to the landing spot (deg; 0=right, 270=up)
  var EARTH_LAND_R = 0.42;          // radius fraction — just off the California coast once rotated in
  var EARTH_SPIN_DEG = 16;          // globe rotation during descent (+ swings the Pacific coast up into view)
  // footer globe: studio globe is circle (810,330) r440; frame it with margin (like the
  // original hand-drawn globe) so its top isn't clipped by the footer. VB is square.
  var GLOBE_VBX = 342, GLOBE_VBY = -138, GLOBE_VB = 936, GLOBE_CX = 810, GLOBE_CY = 330, GLOBE_R = 440;

  function pinDurPxVH(vh) {
    var raw = vh * (window.innerHeight || 800);
    return Math.round(raw / GRID_PX) * GRID_PX;   // snap to whole grid squares (no grid jump)
  }
  function aboutPinDur()  { return pinDurPxVH(PIN_DUR_VH); }
  function skillsPinDur() { return pinDurPxVH(SKILLS_PIN_DUR_VH); }
  function footPinDur()   { return pinDurPxVH(FOOT_PIN_DUR_VH); }
  // Generic pin sizing: the spacer must hold the frozen content PLUS the pin scroll
  // length; .*-fix is then absolute/fixed inside it. Anchored to live content height,
  // so editing résumé copy auto-resizes the pin.
  function sizePin(pinEl, fixEl, durPx) {
    if (!pinEl || !fixEl) return;
    if (window.innerWidth <= 920) { pinEl.style.height = "auto"; fixEl.style.position = "static"; fixEl.style.top = "auto"; return; }
    var prev = fixEl.style.position;
    fixEl.style.position = "static";              // measure natural content height
    var contentH = fixEl.offsetHeight;
    fixEl.style.position = prev || "absolute";
    pinEl.style.height = (contentH + durPx) + "px";
  }
  function sizePins() { sizePin(aboutPinEl, aboutFixEl, aboutPinDur()); sizePin(skillsPinEl, skillsFixEl, skillsPinDur()); sizePin(footPinEl, footFixEl, footPinDur()); }
  sizePins();

  /* ── Phase-4 geometry: globe on the right + dashed fly-by and descent lines.
     During the Contact LANDING pin the scene is frozen, so Phase 4 is choreographed in
     plain VIEWPORT coordinates: the globe's frozen position gives the landing point L,
     and the descent arc runs from the ship's orbit-exit down into the coast. ── */
  var P4 = null;
  function buildPhase4(W, H, burnP) {
    var bp = clamp01(burnP || 0);
    if (!footerEarth || !orbitDesc) return;
    if (orbitSvg && orbitSvg.hasAttribute("viewBox")) orbitSvg.removeAttribute("viewBox");  // viewport px coords
    var fr = footerEarth.getBoundingClientRect();   // VIEWPORT rect (globe frozen while pinned)
    var ow = footerEarth.offsetWidth || fr.width;
    var scale = ow / GLOBE_VB;
    var GR = GLOBE_R * scale;
    var GCx = fr.left + (GLOBE_CX - GLOBE_VBX) * scale;
    var GCy = fr.top + (GLOBE_CY - GLOBE_VBY) * scale;
    if (!globeSpin) globeSpin = footerEarth.querySelector("#globeSpin");
    var aL = EARTH_LAND_DEG * Math.PI / 180;
    var L = { x: GCx + GR * EARTH_LAND_R * Math.cos(aL), y: GCy + GR * EARTH_LAND_R * Math.sin(aL) };
    // ── ONE orbit line. Pre-burn it's a realistic fly-by: down the lane, then bending
    // AROUND the globe's left limb (gravity — concave toward the planet) and off the
    // bottom of the page. The burn RESHAPES the part of the line ahead of the ship: its
    // knot + control points morph (bp 0→1) from the wrap-around miss into the descent
    // that dives into the coast at L. No second line ever appears. ──
    var A = { x: L.x - LANE_OFF_FRAC * W, y: -0.06 * H };
    var B = { x: A.x - 0.008 * W, y: BURN_Y_FRAC * H };
    // fly-by lower half: periapsis P just off the upper-left limb, exit E under the page
    var P = { x: GCx + 1.22 * GR * Math.cos(222 * Math.PI / 180), y: GCy + 1.22 * GR * Math.sin(222 * Math.PI / 180) };
    var E = { x: GCx - 1.06 * GR, y: 1.10 * H };
    var c1f = { x: B.x - 0.004 * W, y: B.y + 0.45 * (P.y - B.y) };
    var c2f = { x: P.x + 0.45 * (B.x - P.x), y: P.y - 0.40 * (P.y - B.y) };
    var c3f = { x: E.x + 0.015 * W, y: lerp(P.y, E.y, 0.55) };
    // descent lower half: same knot/control structure so the line can morph between them
    var M2 = { x: lerp(B.x, L.x, 0.30), y: lerp(B.y, L.y, 0.58) };
    var c1d = { x: B.x - 0.002 * W, y: lerp(B.y, M2.y, 0.5) };
    var c2d = { x: M2.x - 0.10 * (L.x - B.x), y: M2.y - 0.35 * (M2.y - B.y) };
    var c3d = { x: L.x - 0.05 * W, y: lerp(M2.y, L.y, 0.55) };
    function mix(p, q) { return { x: lerp(p.x, q.x, bp), y: lerp(p.y, q.y, bp) }; }
    var k = mix(P, M2), m1 = mix(c1f, c1d), m2 = mix(c2f, c2d), m3 = mix(c3f, c3d), en = mix(E, L);
    var d = "M" + A.x + " " + A.y +
            " C " + (A.x - 0.003 * W) + " " + lerp(A.y, B.y, 0.5) + " " + (B.x + 0.003 * W) + " " + lerp(A.y, B.y, 0.78) + " " + B.x + " " + B.y +
            " C " + m1.x + " " + m1.y + " " + m2.x + " " + m2.y + " " + k.x + " " + k.y +
            " S " + m3.x + " " + m3.y + " " + en.x + " " + en.y;
    orbitFly.setAttribute("d", d);
    // hidden MATH path (never drawn): the pure descent the ship rides after the burn
    var descD = "M" + B.x + " " + B.y +
                " C " + c1d.x + " " + c1d.y + " " + c2d.x + " " + c2d.y + " " + M2.x + " " + M2.y +
                " S " + c3d.x + " " + c3d.y + " " + L.x + " " + L.y;
    orbitDesc.setAttribute("d", descD);
    P4 = { A: A, L: L, B: B, GCx: GCx, GCy: GCy, GR: GR };
  }

  // point + travel-direction angle (deg) at param u (0–1) along a path element
  function ptAt(pathEl, u) {
    var Ln = pathEl.getTotalLength();
    var p = pathEl.getPointAtLength(u * Ln);
    var p2 = pathEl.getPointAtLength(Math.min(Ln, u * Ln + 1.5));
    return { x: p.x, y: p.y, ang: Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI };
  }
  // point + angle at the place where the path crosses a given (page) Y — used so the
  // rocket can ride the line at a controlled viewport height while the page scrolls.
  function ptAtY(pathEl, targetY) {
    var Ln = pathEl.getTotalLength(), lo = 0, hi = Ln, mid = 0, p = null;
    for (var i = 0; i < 18; i++) { mid = (lo + hi) / 2; p = pathEl.getPointAtLength(mid); if (p.y < targetY) lo = mid; else hi = mid; }
    var p1 = pathEl.getPointAtLength(Math.max(0, mid - 1.5)), p2 = pathEl.getPointAtLength(Math.min(Ln, mid + 1.5));
    return { x: p.x, y: p.y, ang: Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI };
  }

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeIn(t) { return t * t; }
  function easeOut(t) { return 1 - (1 - t) * (1 - t); }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function topOf(el) { return el ? el.getBoundingClientRect().top + (window.scrollY || window.pageYOffset) : 0; }

  // place a .fl-obj div centered on (cx,cy) viewport px, rotated + scaled
  function place(el, cx, cy, rot, sc) {
    el.style.left = cx + "px"; el.style.top = cy + "px";
    el.style.transform = "translate(-50%,-50%) rotate(" + rot + "deg) scale(" + (sc == null ? 1 : sc) + ")";
  }
  function fade(el, o) { el.style.opacity = o; }

  function choreograph() {
    // test hook: set window.__FORCE_Y to drive the choreography without real scrolling
    // (the preview can't truly scroll). Real document coords stay valid because the page
    // remains at scroll 0 — only the virtual `y` is forced.
    var y = (typeof window.__FORCE_Y === "number") ? window.__FORCE_Y : (window.scrollY || window.pageYOffset);
    if (nav) nav.classList.toggle("is-stuck", y > 8);
    if (!flight) return;
    if (rmq.matches) { flight.style.display = "none"; return; }

    var W = window.innerWidth, H = window.innerHeight;
    var maxScroll = Math.max(1, doc.documentElement.scrollHeight - H);
    var wTop = topOf(elWork);
    var gapTop = topOf(elGap), gapBot = gapTop + (elGap ? elGap.offsetHeight : 0);
    var eTop = topOf(elExp);
    buildPhase4(W, H);                  // page-anchored; cheap; gives us P4.A / P4.L

    var phase, t;
    var aboutTop = topOf(elAbout);
    // rocket starts flying in APPROACH_LEAD_VH viewport-heights before the gap, so it
    // crosses empty space — not the Selected Work cards. (clamped to stay after Work top)
    var approachStart = Math.max(wTop + 40, gapTop - APPROACH_LEAD_VH * H);

    // --- Pin regions. Both About (stage separation) and Skills (spacewalk) freeze the
    //     same way; helpers keep them in one coordinate model. canPin gates desktop only. ---
    var canPin = window.innerWidth > 920 && !rmq.matches;
    function pinRegionFor(pinEl, topFrac, durPx) {
      var top = topFrac * H, start = topOf(pinEl) - top;
      return { start: start, end: start + durPx, dur: durPx, topPx: top };
    }
    function applyPinPos(fixEl, reg, yy) {
      var on = (yy >= reg.start && yy < reg.end);
      if (yy < reg.start)  { fixEl.style.position = "absolute"; fixEl.style.top = "0px"; }
      else if (on)         { fixEl.style.position = "fixed";    fixEl.style.top = reg.topPx.toFixed(1) + "px"; }
      else                 { fixEl.style.position = "absolute"; fixEl.style.top = reg.dur.toFixed(1) + "px"; }
      return on;
    }
    var FAR = 1e12;
    var aboutReg  = (canPin && aboutPinEl)  ? pinRegionFor(aboutPinEl, PIN_TOP_FRAC, aboutPinDur())          : { start: aboutTop, end: aboutTop, dur: 0, topPx: 0 };
    var skillsReg = (canPin && skillsPinEl) ? pinRegionFor(skillsPinEl, SKILLS_PIN_TOP_FRAC, skillsPinDur()) : { start: FAR, end: FAR, dur: 0, topPx: 0 };
    var footReg   = (canPin && footPinEl)   ? pinRegionFor(footPinEl, FOOT_PIN_TOP_FRAC, footPinDur())        : { start: FAR, end: FAR, dur: 0, topPx: 0 };

    if (y < wTop)                  { phase = "launch";    t = clamp01(wTop ? y / wTop : 0); }
    else if (y < approachStart)    { phase = "transit";   t = clamp01((y - wTop) / Math.max(1, approachStart - wTop)); }
    else if (y < aboutReg.start)   { phase = "approach";  t = clamp01((y - approachStart) / Math.max(1, aboutReg.start - approachStart)); }
    else if (y < aboutReg.end)     { phase = "separate";  t = clamp01((y - aboutReg.start) / Math.max(1, aboutReg.dur)); }
    else if (y < skillsReg.start)  { phase = "coast";     t = clamp01((y - aboutReg.end) / Math.max(1, skillsReg.start - aboutReg.end)); }
    else if (y < skillsReg.end)    { phase = "mission";   t = clamp01((y - skillsReg.start) / Math.max(1, skillsReg.dur)); }
    else if (y < footReg.start)    { phase = "orbit";     t = clamp01((y - skillsReg.end) / Math.max(1, footReg.start - skillsReg.end)); }
    else if (y < footReg.end)      { phase = "landing";   t = clamp01((y - footReg.start) / Math.max(1, footReg.dur)); }
    else                           { phase = "done";      t = 1; }

    // Apply both pins every frame; switch the frozen graph-paper layer on for whichever
    // is active (so the grid freezes WITH the words, matching Phase 1).
    var aboutPinning = false, skillsPinning = false;
    if (canPin) {
      if (aboutPinEl)  aboutPinning  = applyPinPos(aboutFixEl, aboutReg, y);
      if (skillsPinEl) skillsPinning = applyPinPos(skillsFixEl, skillsReg, y);
      var footPinning = false;
      if (footPinEl) footPinning = applyPinPos(footFixEl, footReg, y);
      var activeReg = aboutPinning ? aboutReg : (skillsPinning ? skillsReg : (footPinning ? footReg : null));
      if (pinGridEl) {
        pinGridEl.style.opacity = activeReg ? "1" : "0";
        if (activeReg) pinGridEl.style.backgroundPositionY = (-(activeReg.start % GRID_PX)).toFixed(1) + "px";
      }
    } else {
      if (aboutFixEl)  { aboutFixEl.style.position = "static";  aboutFixEl.style.top = "auto"; }
      if (skillsFixEl) { skillsFixEl.style.position = "static"; skillsFixEl.style.top = "auto"; }
      if (footFixEl)   { footFixEl.style.position = "static";   footFixEl.style.top = "auto"; }
      if (pinGridEl) pinGridEl.style.opacity = "0";
    }

    // mating distance no longer needed — the stack flies in as ONE element (flMated)
    // and the split pieces share its seam-aligned coordinate frame.

    // reset the cast each frame; each phase lights up only what it needs
    flLaunch.style.opacity = (phase === "launch") ? 1 : 0;
    fade(s2, 0);
    fade(debris, 0);
    if (mated) fade(mated, 0);
    fade(astro, 0);
    fade(sat, 0);
    fade(flLink, 0);
    fade(s2Flame, 0);
    if (boostFlame) fade(boostFlame, 0);
    if (matedFlame) fade(matedFlame, 0);
    s2Flame.classList.remove("reentry");
    if (phase !== "mission") { for (var sci = 0; sci < skillCards.length; sci++) skillCards[sci].classList.remove("sk-active"); }
    // Phase-4 layers hidden unless the mission/descent phases turn them on
    if (flOrbit) fade(flOrbit, 0);
    if (orbitDesc) orbitDesc.style.opacity = 0;
    if (flGlow) flGlow.style.opacity = 0;
    // footer globe sits in its default orientation until the landing rotates it
    if (globeSpin && phase !== "landing" && phase !== "done") globeSpin.setAttribute("transform", "rotate(0 810 330)");
    if (flCount) flCount.style.opacity = 0;
    if (flTip) flTip.style.opacity = 0;
    if (stackShake && phase !== "launch") stackShake.style.setProperty("--rk-shake", "0px");

    if (phase === "launch") {
      var TILT = 13;
      var CDpx = Math.max(1, (launchCDvh / 100) * H);   // countdown pin distance (px)
      if (y < CDpx) {
        // COUNTDOWN — hero pinned (CSS sticky); rocket on the pad, ticking down on scroll
        var ct = clamp01(y / CDpx);
        var label, ignite = false;
        if (ct < 0.25) label = "T\u20133";
        else if (ct < 0.5) label = "T\u20132";
        else if (ct < 0.75) label = "T\u20131";
        else { label = "LIFTOFF"; ignite = true; }
        stackG.setAttribute("transform", "translate(0 0)");
        if (stackShake) stackShake.style.setProperty("--rk-shake",
          (ignite ? 2.6 : (0.3 + ct * 1.6)).toFixed(2) + "px");
        flPad.style.opacity = 1;
        // flame: small ember growing through the count, strong flare building at LIFTOFF
        var ember = ignite ? lerp(0.5, 0.78, clamp01((ct - 0.75) * 4)) : (0.06 + ct * 0.32);
        if (flScale) flScale.style.transform = "scaleY(" + ember.toFixed(3) + ")";
        fade(lFlame, ignite ? 1 : clamp01(ct * 0.8));
        if (flCount) {
          flCount.innerHTML = ignite ? "LIFT<br>OFF" : label;
          flCount.style.opacity = (y > 2) ? 1 : 0;
          flCount.classList.toggle("liftoff", ignite);
        }
        if (flTip) flTip.style.opacity = 1;
      } else {
        // CLIMB — hero scrolls away; rocket blasts off up and out, leaning gently right-to-left
        var u = clamp01((y - CDpx) / Math.max(1, wTop - CDpx));
        var ue = easeIn(u);
        var lr = flLaunch.getBoundingClientRect();
        var svgH = lr.height || 500;
        var climb = (H + svgH * 1.2) * (660 / svgH) * ue;   // svg units, guaranteed to clear the top
        var driftX = -lerp(0, 150, ue);
        var rot = -TILT * easeIn(u);     // gentle, progressive lean (slow at first)
        stackG.setAttribute("transform",
          "translate(" + driftX.toFixed(1) + " " + (-climb).toFixed(1) + ") rotate(" + rot.toFixed(2) + " 270 337)");
        if (stackShake) stackShake.style.setProperty("--rk-shake", "0px");
        // big flame — as tall as the rocket, growing a touch as it accelerates
        if (flScale) flScale.style.transform = "scaleY(" + (1.0 + u * 0.2).toFixed(3) + ")";
        flPad.style.opacity = clamp01(1 - u / 0.08);
        fade(lFlame, 1);
        if (flCount) flCount.style.opacity = 0;
        if (flTip) flTip.style.opacity = clamp01(1 - u / 0.5);
      }

    } else if (phase === "transit") {
      // Work section — the vehicle has climbed out of frame; stage is clear
      flPad.style.opacity = 0;
      fade(lFlame, 0);

    } else if (phase === "approach") {
      // the mated stack (ONE element, identical to the launch rocket) coasts in from
      // the left, booster burning, nose pointing right; decelerates toward staging
      flPad.style.opacity = 0; fade(lFlame, 0);
      var au = easeOut(t);
      var stageY = Math.max(ROCKET_Y_FRAC * H, ROCKET_Y_MIN);
      var amx = lerp(-0.34 * W, ROCKET_X_FRAC * W, au);
      var amy = lerp(stageY + 0.07 * H, stageY, au);
      if (mated) { fade(mated, 1); place(mated, amx, amy, 90, 1); }
      if (matedFlame) fade(matedFlame, 1);          // booster still burning

    } else if (phase === "separate") {
      // About is pinned (CSS sticky). The mated stack splits at the seam: booster
      // throttles down, drifts back along the axis, then tumbles away; the 2nd stage
      // holds, ignites, and burns off to the RIGHT. The split pieces share the mated
      // stack's seam frame, so they start perfectly joined (no jump).
      flPad.style.opacity = 0; fade(lFlame, 0);
      var pinX = ROCKET_X_FRAC * W, pinY = Math.max(ROCKET_Y_FRAC * H, ROCKET_Y_MIN), partEnd = 0.50;
      fade(s2, 1);
      if (t < partEnd) {
        var dt = clamp01(t / partEnd);
        var ed = easeIn(dt);
        place(s2, pinX, pinY, 90, 1);                       // 2nd stage holds at the seam point
        fade(debris, 1);
        // spent booster sheds DOWN-LEFT, tumbling into the About section below — it draws
        // the eye toward the copy you read next (intentional, per direction)
        place(debris, pinX - ed * 0.10 * W, pinY + ed * 0.16 * H, 90 + ed * ed * 240, 1);
        fade(boostFlame, clamp01(1 - dt * 2.2));            // booster engine dies as it parts
        fade(s2Flame, clamp01((dt - 0.5) / 0.4));           // 2nd-stage ignition builds
      } else {
        var sv = easeIn((t - partEnd) / (1 - partEnd));
        place(s2, lerp(pinX, 1.34 * W, sv), pinY, 90, 1);   // 2nd stage burns off right
        fade(s2Flame, 1);
        fade(debris, clamp01(1 - sv * 1.1));                // booster tumbles down into About, fading
        place(debris, pinX - 0.10 * W - sv * 0.06 * W, pinY + 0.16 * H + sv * 0.40 * H, 90 + 240 + sv * 200, 1);
      }

    } else if (phase === "coast") {
      // CAPSULE re-enters from off-right (it burned off-right in Phase 2) and drifts to
      // its "mothership" hold, ready for the spacewalk. Astronaut stays hidden until then.
      fade(s2, 1);
      var bandTopC = Math.max(SKILLS_PIN_TOP_FRAC * H + 40, 104);
      var cu = easeOut(t);
      var capXc = lerp(1.35 * W, CAPSULE_X_FRAC * W, cu);
      place(s2, capXc, bandTopC, 198 + Math.sin(t * 6.28) * 4, 1);

    } else if (phase === "mission") {
      // ══ PHASE 3 (pinned): astronaut tours the frozen Skills, then hands off ══
      var n = skillCards.length;
      var cxs = [], cardsTop = 1e9;
      for (var ci = 0; ci < n; ci++) { var cr = skillCards[ci].getBoundingClientRect(); cxs[ci] = cr.left + cr.width / 2; cardsTop = Math.min(cardsTop, cr.top); }
      if (!n) { cxs = [0.2 * W, 0.4 * W, 0.6 * W, 0.8 * W]; cardsTop = 0.4 * H; }
      var bandY = Math.max(cardsTop - ASTRO_ABOVE_CARDS, 96);
      var capHoldX = CAPSULE_X_FRAC * W, capHoldY = CAP_HOLD_FRAC * H;   // = descent line top → no jump

      if (t < TOUR_END) {
        // astronaut tour: enter, dart to the FAR-LEFT card, then touch each card
        // LEFT→RIGHT, flashing its highlight as it passes; ends back on the right.
        fade(s2, 1); place(s2, capHoldX, capHoldY, 198 + Math.sin(t * 6.28) * 3, 1);
        var tt = clamp01(t / TOUR_END);
        var ax, leadIn = 0.18;
        if (tt < leadIn) ax = lerp(capHoldX, cxs[0], easeInOut(tt / leadIn));
        else             ax = lerp(cxs[0], cxs[n - 1], easeInOut((tt - leadIn) / (1 - leadIn)));
        var active = -1;
        for (var k = 0; k < n; k++) { var crk = skillCards[k].getBoundingClientRect(); if (ax >= crk.left - 8 && ax <= crk.right + 8) { active = k; break; } }
        var ay = bandY + Math.sin(t * Math.PI * 7) * 7 + (active >= 0 ? 12 : 0);
        var swFade = clamp01(tt / 0.05);
        fade(astro, swFade);
        place(astro, ax, ay, Math.sin(t * Math.PI * 6) * 5 - 4, ASTRO_SCALE);
        for (var hi = 0; hi < n; hi++) skillCards[hi].classList.toggle("sk-active", hi === active);
        fade(flLink, swFade);
        var px = capHoldX - 0.02 * W, py = capHoldY + 0.02 * H, mx = (px + ax) / 2, my = Math.max(py, ay) + 0.05 * H;
        tether.setAttribute("d", "M" + px + " " + py + " Q " + mx + " " + my + " " + ax + " " + ay);

      } else {
        // hand-off: astronaut fades out; the ship holds at the capsule spot (= orbit-exit,
        // top of the descent arc) ready to keep going on the next scroll — no jump.
        var ht = clamp01((t - TOUR_END) / (1 - TOUR_END));
        for (var hc = 0; hc < n; hc++) skillCards[hc].classList.remove("sk-active");
        fade(astro, clamp01(1 - ht * 1.6));
        place(astro, lerp(cxs[n - 1], capHoldX - 0.04 * W, easeOut(ht)), bandY - ht * 0.05 * H, -4, ASTRO_SCALE);
        fade(flLink, clamp01(1 - ht * 2));
        fade(flOrbit, ht * 0.8);
        orbitFly.style.opacity = (ht * 0.55).toFixed(2);
        orbitDesc.style.opacity = 0;                       // re-entry line only appears at the burn
        fade(s2, 1);
        // rocket sits AT the capsule hold (on the fly-by lane) and turns to face down it.
        var ph = ptAtY(orbitFly, capHoldY);
        place(s2, lerp(capHoldX, ph.x, easeInOut(ht)), capHoldY, lerp(198, ph.ang + 90, easeInOut(ht)), 1);
        fade(s2Flame, 0);                                  // engines cold — flame is for the burn only
      }

    } else if (phase === "orbit") {
      // ══ PHASE 4a · ORBIT (unpinned, over Experience): the ship is ON the fly-by line,
      //    coasting in like it'll pass the planet by. ══
      buildPhase4(W, H);
      fade(s2, 1); fade(astro, 0); fade(flLink, 0);
      fade(flOrbit, Math.min(1, 0.8 + t * 2));
      orbitFly.style.opacity = "0.55";
      orbitDesc.style.opacity = 0;                            // reentry path hidden until the burn
      var op = ptAtY(orbitFly, lerp(CAP_HOLD_FRAC * H, ORBIT_EXIT_FRAC * H, easeInOut(t)));
      var drift = Math.sin(t * Math.PI * 2) * 5;
      place(s2, op.x + drift * 0.6, op.y, op.ang + 90, 1);    // prograde — nose leads, floating down the lane
      fade(s2Flame, 0);                                       // coasting — engines cold
      s2Flame.classList.remove("reentry");
      if (globeSpin) globeSpin.setAttribute("transform", "rotate(0 810 330)");

    } else if (phase === "landing") {
      // ══ PHASE 4b · LANDING (Contact PINNED, frozen): the ship coasts to the branch,
      //    then the BURN changes the orbit — the fly-by line gives way to a re-entry line
      //    curving into the coast; the ship rides it down and shrinks to a dot. ══
      var flipEnd = LAND_FLIP_AT + LAND_FLIP_LEN;
      var burnP = clamp01((t - LAND_FLIP_AT) / LAND_FLIP_LEN);
      buildPhase4(W, H, burnP);             // the burn RESHAPES the one orbit line
      fade(flOrbit, 1); fade(s2, 1); fade(astro, 0); fade(flLink, 0);
      var shr = clamp01((t - LAND_SHRINK_START) / (1 - LAND_SHRINK_START));
      orbitFly.style.opacity = (0.55 * (1 - shr * 0.7)).toFixed(2);
      orbitDesc.style.opacity = 0;          // math path only — never drawn
      var proAng = ptAtY(orbitFly, P4.B.y).ang + 90;          // prograde heading at the burn point
      var retroAng = ptAt(orbitDesc, 0).ang + 90 + 180;       // retrograde heading on the new line
      var pos, rot, sc = 1, flame = 0;
      s2Flame.classList.remove("reentry");
      s2Flame.classList.toggle("burn", t >= LAND_FLIP_AT && t < flipEnd);
      if (t < LAND_FLIP_AT) {                                  // coast on down the lane, prograde, engines cold
        pos = ptAtY(orbitFly, lerp(ORBIT_EXIT_FRAC * H, P4.B.y, easeInOut(t / LAND_FLIP_AT)));
        rot = pos.ang + 90;
      } else if (t < flipEnd) {                               // BURN: hold at the branch, flip retrograde —
        pos = P4.B;                                           // one short punchy flame and the orbit changes
        rot = lerp(proAng, retroAng, easeInOut(burnP));
        flame = Math.sin(burnP * Math.PI);
      } else if (t < LAND_SHRINK_START) {                     // ride the re-entry line down engine-first…
        var dte = easeInOut(clamp01((t - flipEnd) / (LAND_SHRINK_START - flipEnd)));
        pos = ptAt(orbitDesc, dte);
        var noseP = clamp01((dte - NOSE_DOWN_AT) / (1 - NOSE_DOWN_AT));
        rot = pos.ang + 90 + 180 * (1 - easeInOut(noseP));    // …then rotate nose-down for the last stretch
      } else {                                                // arrived: nose-down, slow shrink into the dot
        pos = P4.L;
        rot = ptAt(orbitDesc, 0.99).ang + 90;                 // sample just shy of the end — at u=1 the tangent degenerates
        sc = lerp(1, DESC_SHRINK_END, shr);
      }
      fade(s2Flame, flame);
      place(s2, pos.x, pos.y, rot, sc);
      fade(s2, clamp01((0.985 - t) / 0.05));                 // shrinks for ages, then pops out at the very end
      // the globe slowly rotates the Pacific coast up INTO place beneath the descending ship
      if (globeSpin) globeSpin.setAttribute("transform", "rotate(" + (EARTH_SPIN_DEG * easeInOut(t)) + " 810 330)");
      // the landing site lights up as the ship arrives and STAYS as a small orange dot
      if (flGlow) {
        flGlow.setAttribute("cx", P4.L.x); flGlow.setAttribute("cy", P4.L.y);
        flGlow.setAttribute("r", "7");
        flGlow.style.opacity = clamp01((shr - 0.5) / 0.35).toFixed(2);
      }

    } else { // done — ship has landed; keep the scene PEGGED so the globe doesn't scroll
      flPad.style.opacity = 0;
      if (footFixEl) { footFixEl.style.position = "fixed"; footFixEl.style.top = footReg.topPx.toFixed(1) + "px"; }
      if (pinGridEl) { pinGridEl.style.opacity = "1"; pinGridEl.style.backgroundPositionY = (-(footReg.start % GRID_PX)).toFixed(1) + "px"; }
      if (P4 && flOrbit && flGlow) {
        buildPhase4(W, H, 1);                                  // line stays in its final bent shape
        fade(flOrbit, 1);
        if (orbitDesc) orbitDesc.style.opacity = 0;
        if (orbitFly) orbitFly.style.opacity = 0.2;            // the flight path lingers faintly
        if (globeSpin) globeSpin.setAttribute("transform", "rotate(" + EARTH_SPIN_DEG + " 810 330)");  // coast stays rotated in
        flGlow.setAttribute("cx", P4.L.x); flGlow.setAttribute("cy", P4.L.y);
        flGlow.setAttribute("r", "7"); flGlow.style.opacity = "1";
      }
    }
  }

  /* ---------- launch length tweak (sticky hero pins the page during the countdown) ---------- */
  var launchLen = (window.CW_TWEAKS && window.CW_TWEAKS.launchLength) || 1.3;
  var launchCDvh = 78;
  function applyLaunchLen(v) {
    launchLen = (typeof v === "number" && v > 0) ? v : 1.3;
    launchCDvh = Math.round(launchLen * 60);            // countdown scroll distance (vh)
    if (heroLaunch) heroLaunch.style.height = (100 + launchCDvh) + "vh";
    choreograph();
  }
  window.cwApplyTweaks = function (t) {
    if (t && typeof t.launchLength === "number") applyLaunchLen(t.launchLength);
  };
  applyLaunchLen(launchLen);

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      try { choreograph(); } catch (e) { if (window.console) console.error(e); }
      ticking = false;                              // ALWAYS reset, even on error, so scroll never dies
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { sizeRocketParts(); sizePins(); buildPhase4(window.innerWidth, window.innerHeight); choreograph(); });
  window.addEventListener("load", function () { sizeRocketParts(); sizePins(); buildPhase4(window.innerWidth, window.innerHeight); choreograph(); });
  buildPhase4(window.innerWidth, window.innerHeight);
  choreograph();

  /* ---------- active nav link via IntersectionObserver ---------- */
  var sections = ["work", "about", "skills", "experience", "contact"];
  var linkMap = {};
  if (navlinks) {
    navlinks.querySelectorAll("a").forEach(function (a) {
      var id = a.getAttribute("href").replace("#", "");
      linkMap[id] = a;
    });
  }
  if ("IntersectionObserver" in window) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          Object.keys(linkMap).forEach(function (k) { linkMap[k].classList.remove("active"); });
          var id = en.target.id;
          if (linkMap[id]) linkMap[id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (id) { var s = doc.getElementById(id); if (s) navObs.observe(s); });
  }

  /* ---------- scroll reveal ---------- */
  var reveals = doc.querySelectorAll(".reveal");
  function revealInView() {
    var vh = window.innerHeight || doc.documentElement.clientHeight;
    reveals.forEach(function (el) {
      if (el.classList.contains("in")) return;
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) el.classList.add("in");
    });
  }
  if ("IntersectionObserver" in window) {
    var revObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { revObs.observe(el); });
  }
  // robust fallbacks so content can never stay hidden
  window.addEventListener("scroll", revealInView, { passive: true });
  window.addEventListener("load", revealInView);
  revealInView();
  setTimeout(revealInView, 400);

  /* ---------- contact: scraper-safe reveal (built in JS, not in HTML) ---------- */
  function fromCodes(arr) { return arr.map(function (c) { return String.fromCharCode(c); }).join(""); }
  var EMAIL = fromCodes([99,97,109,114,111,110,119,97,108,107,101,114,64,103,109,97,105,108,46,99,111,109]);
  var PHONE_DISP = fromCodes([56,48,49,46,56,55,53,46,50,54,48,48]);     // 801.875.2600
  var PHONE_TEL = fromCodes([43,49,56,48,49,56,55,53,50,54,48,48]);      // +18018752600
  var ce = doc.getElementById("c-email");
  if (ce) { ce.textContent = EMAIL; ce.setAttribute("href", "mailto:" + EMAIL); }
  var cp = doc.getElementById("c-phone");
  if (cp) { cp.textContent = PHONE_DISP; cp.setAttribute("href", "tel:" + PHONE_TEL); }

  /* ---------- paper-airplane resume download ---------- */
  var PLANE_SVG = '<svg viewBox="-20 -14 40 28" width="34" height="24" fill="none">' +
    '<path d="M18 0 L-15 -11 L-5 0 L-15 11 Z" fill="#fff" stroke="#44484E" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M18 0 L-5 0 M-5 0 L-15 11" stroke="#1093C9" stroke-width="2" stroke-linecap="round"/></svg>';

  var badge = doc.getElementById("dlBadge");
  var badgeName = doc.getElementById("dlName");
  var badgeTimer = null;

  function reduceMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function triggerDownload(href, fname) {
    var a = doc.createElement("a");
    a.href = href; a.download = fname || ""; a.style.display = "none";
    doc.body.appendChild(a); a.click();
    setTimeout(function () { doc.body.removeChild(a); }, 100);
  }

  function showBadge(fname) {
    if (!badge) return;
    if (badgeName) badgeName.textContent = fname || "resume";
    badge.classList.add("show");
    if (badgeTimer) clearTimeout(badgeTimer);
    badgeTimer = setTimeout(function () { badge.classList.remove("show"); }, 2800);
  }

  // Flight route: gentle wave to the right → a full loop-the-loop → steep
  // climb up into the top-right "downloads" corner. Coords are viewport px.
  function buildFlightPath(sx, sy, ex, ey, H) {
    var dx = ex - sx;
    var cx = sx + dx * 0.60;            // loop center x
    var cy = Math.max(sy - 70, 150);    // loop center y (keep off the top)
    // radius that fits between the top edge and the bottom of the viewport
    var r = Math.min(110, dx * 0.13, cy - 80, (H - cy) - 40);
    if (r < 50) r = 50;
    var k = r * 0.5523;                 // cubic circle constant

    var bx = cx, by = cy + r;           // bottom of loop = entry/exit point

    var p = "M " + sx + " " + sy;
    // wave in to the bottom of the loop (slight dip then rise)
    p += " C " + (sx + dx * 0.20) + " " + (sy + 34) +
         ", " + (bx - r * 1.6) + " " + (by + 18) +
         ", " + bx + " " + by;
    // full clockwise loop: bottom → right → top → left → bottom
    p += " C " + (cx + k) + " " + (cy + r) + ", " + (cx + r) + " " + (cy + k) + ", " + (cx + r) + " " + cy;
    p += " C " + (cx + r) + " " + (cy - k) + ", " + (cx + k) + " " + (cy - r) + ", " + cx + " " + (cy - r);
    p += " C " + (cx - k) + " " + (cy - r) + ", " + (cx - r) + " " + (cy - k) + ", " + (cx - r) + " " + cy;
    p += " C " + (cx - r) + " " + (cy + k) + ", " + (cx - k) + " " + (cy + r) + ", " + bx + " " + by;
    // exit the loop and climb steeply into the top-right corner
    p += " C " + (cx + dx * 0.22) + " " + (by - 8) +
         ", " + (ex - 12) + " " + (ey + 260) +
         ", " + ex + " " + ey;
    return p;
  }

  function flyPlane(startX, startY, done) {
    var W = window.innerWidth, H = window.innerHeight;
    var endX = W - 34;   // TOP-RIGHT "downloads" corner (Chrome)
    var endY = 30;
    var d = buildFlightPath(startX, startY, endX, endY, H);
    var NS = "http://www.w3.org/2000/svg";

    // 1) dashed flight path that fades in BEFORE the plane takes off
    var svg = doc.createElementNS(NS, "svg");
    svg.setAttribute("class", "fly-path");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    var path = doc.createElementNS(NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "fly-path-line");
    svg.appendChild(path);
    doc.body.appendChild(svg);

    var fadeIn = svg.animate([{ opacity: 0 }, { opacity: 1 }],
      { duration: 480, easing: "ease-out", fill: "forwards" });

    // 2) once the line is drawn, the plane rides along it
    fadeIn.onfinish = function () {
      var plane = doc.createElement("div");
      plane.className = "fly-plane";
      plane.innerHTML = PLANE_SVG;
      plane.style.offsetPath = "path('" + d + "')";
      plane.style.webkitOffsetPath = "path('" + d + "')";
      plane.style.offsetRotate = "auto";
      doc.body.appendChild(plane);

      var fly = plane.animate([
        { offsetDistance: "0%", opacity: 1 },
        { offsetDistance: "90%", opacity: 1, offset: 0.86 },
        { offsetDistance: "100%", opacity: 0 }
      ], { duration: 2500, easing: "cubic-bezier(.38,.04,.34,1)", fill: "forwards" });

      // fade the dashed line out as the plane arrives
      svg.animate([{ opacity: 1 }, { opacity: 0 }],
        { duration: 700, delay: 1950, easing: "ease-in", fill: "forwards" });

      fly.onfinish = function () {
        plane.remove();
        svg.remove();
        if (done) done();
      };
    };
  }

  doc.querySelectorAll(".js-dl").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var href = btn.getAttribute("href");
      var fname = btn.getAttribute("data-fname") || "resume";

      if (reduceMotion()) {
        triggerDownload(href, fname);
        showBadge(fname);
        return;
      }
      var r = btn.getBoundingClientRect();
      var sx = r.left + r.width / 2;
      var sy = r.top + r.height / 2;
      flyPlane(sx, sy, function () { showBadge(fname); });
      // start the download mid-flight
      setTimeout(function () { triggerDownload(href, fname); }, 1500);
    });
  });
})();
