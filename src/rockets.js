import { ASTRO_PATH } from "./astro_path.js";
import { NA_PATH } from "./land_path.js";

/* Four mission PHASES for camronwalker.com, each a static graph-paper scene
   using the locked "Rocket A" design (one-piece pointed 2nd stage, square crew
   hatch up high, squared-off booster, gimbaled engine bells — no fins).
   Strokes use the .cw-sketch classes from camron.css (linked by the host page). */
  /* engine bell pointing DOWN — solid dark silhouette: a wide flat top flange,
     then sides that flare OUTWARD (convex) to a wide flat mouth at the bottom.
     Drawn at (cx, topY); w = base half-width; optional tilt in degrees. */
  function bell(cx, topY, w, tilt) {
    tilt = tilt || 0;
    var ft = +(w * 0.55).toFixed(1);  // top flange half-width
    var fh = +(w * 0.4).toFixed(1);   // flange height
    var H = +(w * 2.6).toFixed(1);    // overall height
    var y1 = +(fh + (H - fh) * 0.4).toFixed(1);
    var y2 = +(fh + (H - fh) * 0.75).toFixed(1);
    var d = 'M' + (-ft) + ' 0 L' + ft + ' 0 L' + ft + ' ' + fh + ' ' +
      'C ' + (w * 0.97).toFixed(1) + ' ' + y1 + ' ' + w + ' ' + y2 + ' ' + w + ' ' + H + ' ' +
      'L ' + (-w) + ' ' + H + ' ' +
      'C ' + (-w) + ' ' + y2 + ' ' + (-w * 0.97).toFixed(1) + ' ' + y1 + ' ' + (-ft) + ' ' + fh + ' Z';
    return '<g transform="translate(' + cx + ',' + topY + ') rotate(' + tilt + ')">' +
      '<path class="cw-sketch" d="' + d + '"/>' +
      '</g>';
  }

  /* ---- reusable parts, drawn around their own origin (centerline x=0, nose up) ---- */

  // mated full stack (2nd stage + booster) — shorter 2nd stage, taller booster
  var STACK =
    // 2nd stage — one piece, ends flat at the seam (y=0)
    '<path class="cw-sketch" d="M0 -205 C -16 -160 -30 -126 -30 -96 L-30 0 L30 0 L30 -96 C 30 -126 16 -160 0 -205 Z"/>' +
    '<rect class="cw-sketch cw-sketch--blue" x="-16" y="-126" width="32" height="32" rx="3"/>' +
    '<path class="cw-sketch cw-sketch--blue cw-sketch--thin" d="M11 -118 L11 -102"/>' +
    // separation seam
    '<path class="cw-sketch cw-sketch--thin" d="M-30 0 L30 0"/>' +
    // booster — taller, squared-off bottom
    // straight booster body
    '<path class="cw-sketch" d="M-30 0 L-30 228 L30 228 L30 0"/>' +
    // three raised conduits (flutes) running down the lower booster
    '<g class="cw-sketch">' +
      '<rect x="-23" y="116" width="8" height="108" rx="4" style="fill:#fff"/>' +
      '<rect x="-4" y="116" width="8" height="108" rx="4" style="fill:#fff"/>' +
      '<rect x="15" y="116" width="8" height="108" rx="4" style="fill:#fff"/>' +
    '</g>' +
    // twin engine bells — flush at the body, flared, straight
    bell(-15, 228, 11, 0) +
    bell(15, 228, 11, 0);

  // 2nd stage ALONE — EXACTLY matches the stack's 2nd stage (205 tall, same nose)
  var STAGE2 =
    '<path class="cw-sketch" d="M0 -115 C -16 -70 -30 -36 -30 -6 L-30 90 L30 90 L30 -6 C 30 -36 16 -70 0 -115 Z"/>' +
    '<rect class="cw-sketch cw-sketch--blue" x="-16" y="-36" width="32" height="32" rx="3"/>' +
    '<path class="cw-sketch cw-sketch--blue cw-sketch--thin" d="M11 -28 L11 -12"/>' +
    // single flared engine bell
    bell(0, 90, 15, 0);

  // spent booster ALONE — same length as the stack's booster
  var BOOSTER =
    // straight booster body
    '<path class="cw-sketch" d="M-30 -114 L-30 114 L30 114 L30 -114"/>' +
    '<path class="cw-sketch cw-sketch--thin" d="M-30 -114 L30 -114"/>' +
    // three raised conduits (flutes) running down the lower booster
    '<g class="cw-sketch">' +
      '<rect x="-23" y="2" width="8" height="108" rx="4" style="fill:#fff"/>' +
      '<rect x="-4" y="2" width="8" height="108" rx="4" style="fill:#fff"/>' +
      '<rect x="15" y="2" width="8" height="108" rx="4" style="fill:#fff"/>' +
    '</g>' +
    // twin engine bells — flush at the body, flared, straight
    bell(-15, 114, 11, 0) +
    bell(15, 114, 11, 0);

  // a flame plume from origin pointing DOWN (+y), height h, half-width w
  function flame(h, w) {
    var i = h * 0.62, iw = w * 0.5;
    return '<g class="rk-flame">' +
      '<path d="M' + (-w) + ' 0 C ' + (-w) + ' ' + (h * 0.55) + ' 0 ' + (h * 0.72) + ' 0 ' + h +
        ' C 0 ' + (h * 0.72) + ' ' + w + ' ' + (h * 0.55) + ' ' + w + ' 0 Z" ' +
        'fill="#8FCDE6" stroke="#1093C9" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M' + (-iw) + ' 0 C ' + (-iw) + ' ' + (i * 0.6) + ' 0 ' + (i * 0.75) + ' 0 ' + i +
        ' C 0 ' + (i * 0.75) + ' ' + iw + ' ' + (i * 0.6) + ' ' + iw + ' 0 Z" fill="#E1F1F8"/>' +
      '</g>';
  }

  // an exhaust plume pointing DOWN (+y) from a single nozzle. Leaves at exactly
  // nozzle width (wNoz), bulges to a shock diamond just below (wBulge), then trails
  // off as a thin tail (wTail) to a soft point at height h — so twin plumes read as
  // two separate streams rather than one merged tail.
  function plume(h, wNoz, wBulge, wTail) {
    var f = function (n) { return +(+n).toFixed(1); };
    var yB = h * 0.13, yM = h * 0.42;
    return '<g class="rk-flame">' +
      '<path d="M' + (-wNoz) + ' 0 ' +
        'C ' + f(-wBulge) + ' ' + f(h * 0.035) + ' ' + f(-wBulge) + ' ' + f(yB) + ' ' + f(-wBulge * 0.66) + ' ' + f(yM) + ' ' +
        'C ' + f(-wTail) + ' ' + f(h * 0.72) + ' ' + f(-wTail) + ' ' + f(h * 0.9) + ' 0 ' + h + ' ' +
        'C ' + f(wTail) + ' ' + f(h * 0.9) + ' ' + f(wTail) + ' ' + f(h * 0.72) + ' ' + f(wBulge * 0.66) + ' ' + f(yM) + ' ' +
        'C ' + f(wBulge) + ' ' + f(yB) + ' ' + f(wBulge) + ' ' + f(h * 0.035) + ' ' + wNoz + ' 0 Z" ' +
        'fill="#8FCDE6" stroke="#1093C9" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M' + f(-wNoz * 0.5) + ' 0 ' +
        'C ' + f(-wBulge * 0.5) + ' ' + f(h * 0.045) + ' ' + f(-wBulge * 0.46) + ' ' + f(yB) + ' 0 ' + f(yM * 0.96) + ' ' +
        'C ' + f(wBulge * 0.46) + ' ' + f(yB) + ' ' + f(wBulge * 0.5) + ' ' + f(h * 0.045) + ' ' + f(wNoz * 0.5) + ' 0 Z" ' +
        'fill="#E1F1F8"/>' +
      '</g>';
  }

  // astronaut centered at origin (~0.8 scale of site version)
  // astronaut — detailed spacesuit figure, front-facing, gently floating.
  // built from chained <g> transforms so joints bend naturally. centered at origin.
  var ASTRO =
    // real vector astronaut (path 1 of the reference set), centered via translate
    '<g transform="translate(-440,-376)">' +
      '<path d="' + (ASTRO_PATH || '') + '" fill-rule="evenodd" style="fill:#33373d"/>' +
    '</g>';

  // satellite centered at origin
  var SAT =
    '<g transform="translate(-75,-40)">' +
      '<rect class="cw-sketch" x="58" y="26" width="34" height="28" rx="2" fill="#fff"/>' +
      '<path class="cw-sketch cw-sketch--thin" d="M66 26 L66 54 M75 26 L75 54 M84 26 L84 54"/>' +
      '<ellipse class="cw-sketch cw-sketch--blue" cx="75" cy="14" rx="11" ry="5"/>' +
      '<path class="cw-sketch cw-sketch--thin" d="M75 19 L75 26"/>' +
      '<g class="cw-sketch cw-sketch--thin">' +
        '<rect x="6" y="30" width="44" height="20" fill="#fff"/>' +
        '<path d="M50 40 L58 40 M17 30 L17 50 M28 30 L28 50 M39 30 L39 50"/>' +
        '<rect x="100" y="30" width="44" height="20" fill="#fff"/>' +
        '<path d="M92 40 L100 40 M111 30 L111 50 M122 30 L122 50 M133 30 L133 50"/>' +
      '</g>' +
    '</g>';

  // sketch Earth globe centered at origin, radius r
  function earth(r) {
    var s = r / 282;
    return '<g transform="scale(' + s + ')">' +
      '<defs><clipPath id="rkGlobe"><circle cx="0" cy="0" r="282"/></clipPath></defs>' +
      '<circle cx="0" cy="0" r="282" fill="#C2C6C9"/>' +
      '<g clip-path="url(#rkGlobe)">' +
        '<g stroke="#9AA0A4" stroke-width="1" opacity=".35">' +
          '<path d="M-340 -220 L340 -340 M-340 -160 L340 -280 M-340 -100 L340 -220 M-340 -40 L340 -160 M-340 20 L340 -100 M-340 80 L340 -40 M-340 140 L340 20 M-340 200 L340 80 M-340 260 L340 140 M-340 320 L340 200"/>' +
          '<path d="M-340 -340 L340 -220 M-340 -280 L340 -160 M-340 -220 L340 -100 M-340 -160 L340 -40 M-340 -100 L340 20 M-340 -40 L340 80 M-340 20 L340 140 M-340 80 L340 200 M-340 140 L340 260"/>' +
        '</g>' +
        '<g fill="#F4F2EC" stroke="#5B6166" stroke-width="2.4" stroke-linejoin="round">' +
          '<path d="M0 -230 C 50 -222 92 -204 104 -168 C 116 -134 96 -112 72 -94 C 92 -86 110 -68 104 -38 C 96 0 66 18 36 26 C 48 48 42 72 18 84 C 0 92 -14 80 -18 60 C -32 72 -52 66 -56 44 C -60 22 -44 0 -52 -24 C -60 -50 -48 -78 -60 -102 C -70 -124 -50 -150 -24 -160 C -32 -184 -22 -214 0 -230 Z"/>' +
          '<path d="M30 92 C 52 92 60 110 52 130 C 72 136 84 158 76 188 C 68 222 44 248 22 256 C 6 240 0 212 8 184 C -4 172 -4 148 12 136 C 8 116 14 98 30 92 Z"/>' +
          '<path d="M-230 -50 C -204 -56 -182 -38 -180 -10 C -178 20 -200 38 -224 40 C -236 18 -242 -12 -238 -32 Z"/>' +
        '</g>' +
        '<g stroke="#7C878E" stroke-width="1.4" opacity=".4" fill="none">' +
          '<ellipse cx="0" cy="0" rx="120" ry="282"/>' +
          '<ellipse cx="0" cy="0" rx="232" ry="282"/>' +
          '<path d="M-282 0 H282 M-256 -112 H256 M-256 112 H256 M-204 -200 H204 M-204 200 H204"/>' +
        '</g>' +
      '</g>' +
      '<circle cx="0" cy="0" r="282" fill="none" stroke="#3F454A" stroke-width="3"/>' +
      '<circle cx="0" cy="0" r="290" fill="none" stroke="#8FCDE6" stroke-width="2" opacity=".5"/>' +
    '</g>';
  }

  // Earth showing the US Pacific coast on the far right; ocean fills the rest
  function earthCoast(r) {
    var s = r / 282;
    return '<g transform="scale(' + s + ')">' +
      '<defs><clipPath id="rkGlobe2"><circle cx="0" cy="0" r="282"/></clipPath></defs>' +
      '<circle cx="0" cy="0" r="282" fill="#C2C6C9"/>' +
      '<g clip-path="url(#rkGlobe2)">' +
        // ocean sheen
        '<g stroke="#9AA0A4" stroke-width="1" opacity=".3">' +
          '<path d="M-340 -160 L340 -280 M-340 -40 L340 -160 M-340 80 L340 -40 M-340 200 L340 80 M-340 320 L340 200"/>' +
        '</g>' +
        // US West Coast land mass on the far right (east); its wavy west edge is the coastline
        '<path d="M-150 -282 C -158 -212 -138 -150 -158 -86 C -176 -22 -146 30 -170 90 C -192 154 -150 214 -176 282 L 282 282 L 282 -282 Z" fill="#EDEBE3" stroke="#5B6166" stroke-width="2.4" stroke-linejoin="round"/>' +
        // a couple of inland ridge marks
        '<g stroke="#7C878E" stroke-width="1.3" opacity=".5" fill="none">' +
          '<path d="M-146 -56 C -130 -66 -116 -52 -104 -64 M-156 70 C -140 60 -126 74 -112 62 M-150 8 C -134 -2 -120 12 -108 0"/>' +
        '</g>' +
        // lat/long grid
        '<g stroke="#7C878E" stroke-width="1.4" opacity=".38" fill="none">' +
          '<ellipse cx="0" cy="0" rx="120" ry="282"/>' +
          '<ellipse cx="0" cy="0" rx="232" ry="282"/>' +
          '<path d="M-282 0 H282 M-256 -112 H256 M-256 112 H256 M-204 -200 H204 M-204 200 H204"/>' +
        '</g>' +
      '</g>' +
      '<circle cx="0" cy="0" r="282" fill="none" stroke="#3F454A" stroke-width="3"/>' +
      '<circle cx="0" cy="0" r="290" fill="none" stroke="#8FCDE6" stroke-width="2" opacity=".5"/>' +
    '</g>';
  }

  // Earth with the real North America outline (from the attached map). Rotation-ready:
  // the meridians + continent live in <g id="globeSpin">, pinned to the globe centre
  // (810,330). Animate its rotation, e.g. el.setAttribute('transform','rotate('+deg+' 810 330)').
  function earthNA() {
    return '<defs><clipPath id="rkGlobeNA"><circle cx="810" cy="330" r="440"/></clipPath></defs>' +
      '<circle cx="810" cy="330" r="440" fill="#AEB6BC"/>' +
      '<g clip-path="url(#rkGlobeNA)">' +
        // fixed latitude lines (reference)
        '<g stroke="#8A9298" stroke-width="1.4" opacity=".32" fill="none">' +
          '<path d="M370 330 H1250 M404 180 H1216 M404 480 H1216"/>' +
        '</g>' +
        // rotating group — meridians turn with the land so it reads as the globe spinning
        '<g id="globeSpin" transform="rotate(0 810 330)" style="transform-box:view-box;transform-origin:810px 330px;">' +
          '<g stroke="#8A9298" stroke-width="1.4" opacity=".32" fill="none">' +
            '<ellipse cx="810" cy="330" rx="185" ry="440"/>' +
            '<ellipse cx="810" cy="330" rx="350" ry="440"/>' +
          '</g>' +
          '<g transform="translate(810,330) scale(2.2,2.68) translate(-480,-360) matrix(0.13333333,0,0,-0.13333333,0,720)" ' +
            'fill="#EDEBE3" stroke="#5B6166" stroke-width="7" stroke-linejoin="round">' +
            '<path d="' + (NA_PATH || '') + '"/>' +
          '</g>' +
        '</g>' +
      '</g>' +
      '<circle cx="810" cy="330" r="440" fill="none" stroke="#3F454A" stroke-width="3"/>' +
      '<circle cx="810" cy="330" r="448" fill="none" stroke="#8FCDE6" stroke-width="2" opacity=".5"/>';
  }

  function scene(inner) {
    return '<svg width="100%" height="100%" viewBox="0 0 600 660" preserveAspectRatio="xMidYMid meet" fill="none" style="display:block;">' + inner + '</svg>';
  }
  function frame(svg, note) {
    return '<div class="cw-graph" style="width:100%;height:100%;display:grid;grid-template-rows:1fr auto;' +
      'place-items:center;padding:22px 18px 16px;position:relative;">' +
      '<div style="width:100%;height:100%;display:grid;place-items:center;">' + svg + '</div>' +
      '<div style="font-family:var(--cw-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;' +
      'color:var(--cw-graphite-2);">' + note + '</div></div>';
  }

  /* launch-pad ground + flame trench (reused by the live page) */
  var PAD =
    '<line class="cw-sketch cw-sketch--thin" x1="40" y1="600" x2="470" y2="600"/>' +
    '<path class="cw-sketch" d="M214 600 L326 600 L342 572 L198 572 Z"/>';

  /* gantry tower (right) + access walkway to the hatch */
  var GANTRY =
    '<g class="cw-sketch cw-sketch--thin">' +
      '<path d="M430 150 L430 600 M470 150 L470 600 M426 150 L474 150"/>' +
      '<path d="M430 196 L470 232 M470 196 L430 232 M430 268 L470 304 M470 268 L430 304 M430 340 L470 376 M470 340 L430 376 M430 412 L470 448 M470 412 L430 448 M430 484 L470 520 M470 484 L430 520"/>' +
      '<path d="M430 200 L300 200 M426 192 L426 208"/>' +
    '</g>';

  /* ───────── PHASE 1 · LAUNCH ───────── */
  var P1 = frame(scene(
    PAD + GANTRY +
    // twin exhaust + rocket (origin at 270,311 — sits on the pad, not sunk in)
    '<g transform="translate(255,568)">' + flame(86, 10) + '</g>' +
    '<g transform="translate(285,568)">' + flame(86, 10) + '</g>' +
    '<g transform="translate(270,311)">' + STACK + '</g>'
  ), 'Phase 1 · Launch');

  /* ───────── PHASE 2 · STAGE SEPARATION ───────── */
  var P2 = frame(scene(
    // 2nd stage, horizontal (nose right), igniting — flame fires left
    '<g transform="translate(410,300) rotate(90) scale(0.9)">' +
      '<g transform="translate(0,129)">' + flame(120, 15) + '</g>' + STAGE2 +
    '</g>' +
    // spent booster, separated & tumbling to the lower-left
    '<g transform="translate(150,388) rotate(116) scale(0.9)">' + BOOSTER + '</g>' +
    // separation gap ticks
    '<g class="cw-sketch cw-sketch--blue cw-sketch--thin" opacity=".7">' +
      '<path d="M232 332 L252 326 M236 350 L256 346 M244 368 L262 366"/>' +
    '</g>'
  ), 'Phase 2 · Stage separation');

  /* ───────── PHASE 3 · SPACEWALK / COAST ───────── */
  var P3 = frame(scene(
    // stars
    '<g class="cw-sketch cw-sketch--blue cw-sketch--thin" opacity=".6">' +
      '<path d="M90 120 L90 134 M83 127 L97 127 M500 480 L500 492 M494 486 L506 486 M120 520 L120 530 M115 525 L125 525"/>' +
    '</g>' +
    // capsule (2nd stage), far left
    '<g transform="translate(120,300) rotate(-18) scale(0.82)">' + STAGE2 + '</g>' +
    // astronaut (real vector) floating, right of center
    '<g transform="translate(330,340) scale(0.34)">' + ASTRO + '</g>' +
    // tether: capsule hatch → astronaut
    '<path d="M150 296 Q 230 400 320 358" fill="none" stroke="#1093C9" stroke-width="1.6" ' +
      'stroke-dasharray="4 6" stroke-linecap="round" opacity=".8"/>'
  ), 'Phase 3 · Spacewalk / coast');

  /* ───────── PHASE 4 · RE-ENTRY / RETRO-BURN ───────── */
  var P4 = frame(scene(
    // Earth showing the real North America — Pacific + US West Coast visible (landing zone)
    earthNA() +
    // one elliptical-orbit line coming down from the top, sweeping into the Pacific
    '<path d="M268 70 C 262 205 288 355 360 452 C 408 517 452 548 484 562" fill="none" stroke="#1093C9" stroke-width="2" ' +
      'stroke-dasharray="7 9" stroke-linecap="round" opacity=".55"/>' +
    // capsule near the top of the descent, retro-burning to slow down — on the orbit line,
    // nose trailing back up the orbit, engine firing down toward the Earth
    '<g transform="translate(272,162) rotate(-22) scale(0.8)">' +
      '<g transform="translate(0,129)">' + flame(80, 15) + '</g>' + STAGE2 +
    '</g>'
  ), 'Phase 4 · Re-entry / retro-burn');

  export const ROCKETS = { P1: P1, P2: P2, P3: P3, P4: P4 };

  /* Raw building blocks so the live page can choreograph the same drawings the
     studio shows. Each part is drawn around its own origin (centerline x=0). */
  export const ROCKET_PARTS = {
    STACK: STACK, STAGE2: STAGE2, BOOSTER: BOOSTER, ASTRO: ASTRO, SAT: SAT,
    bell: bell, flame: flame, plume: plume, earth: earth, earthCoast: earthCoast, earthNA: earthNA,
    PAD: PAD, GANTRY: GANTRY
  };