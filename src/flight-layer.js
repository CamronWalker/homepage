import { ROCKET_PARTS as P } from "./rockets.js";

export const els = {};

export function injectFlightLayer() {
  var doc = document;

  // PHASE 1 · pad + stack into #flLaunch/#flPad/#stackShake
  var flPad = doc.getElementById("flPad");
  var stackShake = doc.getElementById("stackShake");
  if (P && flPad && stackShake) {
    flPad.innerHTML = P.PAD + P.GANTRY;
    stackShake.innerHTML =
      '<g class="fl-flame" id="flLaunchFlame"><g class="fl-fl-inner"><g id="flScale">' +
        '<g transform="translate(255,568)">' + P.plume(300, 10, 13, 3.5) + '</g>' +
        '<g transform="translate(285,568)">' + P.plume(300, 10, 13, 3.5) + '</g>' +
      '</g></g></g>' +
      '<g transform="translate(270,311)">' + P.STACK + '</g>';
  }

  // PHASE 2+ · seam-centred viewBox SVGs into #flStage2 / #flDebris / #flMated
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

    // PHASE 3 · astronaut + satellite (spacewalk uses the studio graphics)
    var _astro = doc.getElementById("flAstro");
    var _sat = doc.getElementById("flSat");
    if (_astro) _astro.innerHTML =
      '<svg viewBox="-330 -260 660 520" fill="none" style="overflow:visible;width:100%;height:auto;display:block">' + P.ASTRO + '</svg>';
    if (_sat) _sat.innerHTML =
      '<svg viewBox="-92 -56 184 112" fill="none" style="overflow:visible;width:100%;height:auto;display:block">' + P.SAT + '</svg>';

    // PHASE 4 · landing globe in the pinned Contact scene (rotation-ready North-America globe)
    var _foot = doc.getElementById("landGlobe");
    if (_foot && P.earthNA) _foot.innerHTML =
      '<svg viewBox="342 -138 936 936" fill="none" preserveAspectRatio="xMidYMid meet">' + P.earthNA() + '</svg>';
  }

  // Populate els with every element handle the animation tasks need
  var doc2 = document;
  els.flight      = doc2.getElementById("flight");
  els.flLaunch    = doc2.getElementById("flLaunch");
  els.stackG      = doc2.getElementById("stackG");
  els.stackShake  = doc2.getElementById("stackShake");
  els.flPad       = doc2.getElementById("flPad");
  els.flScale     = doc2.getElementById("flScale");
  els.heroLaunch  = doc2.getElementById("top");
  els.lFlame      = doc2.getElementById("flLaunchFlame");
  els.flCount     = doc2.getElementById("flCount");
  els.flTip       = doc2.getElementById("flTip");
  els.s2          = doc2.getElementById("flStage2");
  els.s2Flame     = doc2.getElementById("flS2Flame");
  els.debris      = doc2.getElementById("flDebris");
  els.astro       = doc2.getElementById("flAstro");
  els.sat         = doc2.getElementById("flSat");
  els.flLink      = doc2.getElementById("flLink");
  els.tether      = doc2.getElementById("flTether");
  els.boostFlame  = doc2.getElementById("flBoostFlame");
  els.mated       = doc2.getElementById("flMated");
  els.matedFlame  = doc2.getElementById("flMatedFlame");
  els.footerEarth = doc2.getElementById("landGlobe");
  els.flOrbit     = doc2.getElementById("flOrbit");
  els.orbitFly    = doc2.getElementById("flOrbitFly");
  els.orbitDesc   = doc2.getElementById("flOrbitDesc");
  els.flGlow      = doc2.getElementById("flGlow");
  els.pinGrid     = doc2.getElementById("pinGrid");

  // Section handles
  els.work        = doc2.getElementById("work");
  els.gapStage    = doc2.getElementById("gapStage");
  els.about       = doc2.getElementById("about");
  els.experience  = doc2.getElementById("experience");
  els.contact     = doc2.getElementById("contact");
  els.foot        = doc2.querySelector(".foot");
  els.aboutPin    = doc2.querySelector(".about-pin");
  els.aboutFix    = doc2.querySelector(".about-fix");
  els.skillsPin   = doc2.querySelector(".skills-pin");
  els.skillsFix   = doc2.querySelector(".skills-fix");
  els.contactPin  = doc2.querySelector(".contact-pin");
  els.contactFix  = doc2.querySelector(".contact-fix");
  els.skillCards  = doc2.querySelectorAll(".skill-cat");
  els.nav         = doc2.getElementById("nav");
  els.burger      = doc2.getElementById("burger");
  els.navlinks    = doc2.getElementById("navlinks");
}

export function sizeRocketParts() {
  var flLaunch = els.flLaunch || document.getElementById("flLaunch");
  if (!flLaunch) return;
  var lw = flLaunch.getBoundingClientRect().width;
  if (!lw) return;
  var w = (lw * 140 / 600).toFixed(1) + "px";
  var s2     = els.s2     || document.getElementById("flStage2");
  var debris = els.debris || document.getElementById("flDebris");
  var mated  = els.mated  || document.getElementById("flMated");
  if (s2)     s2.style.width     = w;
  if (debris) debris.style.width = w;
  if (mated)  mated.style.width  = w;
}
