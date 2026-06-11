import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import { injectFlightLayer, sizeRocketParts, els } from "./flight-layer.js";
import { createPin } from "./mission/pins.js";
import { TUNABLES } from "./mission/tunables.js";
import { refreshCtx } from "./mission/context.js";
import { buildLaunch } from "./mission/launch.js";
import { buildSeparation } from "./mission/separation.js";
import { buildSpacewalk } from "./mission/spacewalk.js";
import { buildLanding } from "./mission/landing.js";
import { createStageManager } from "./mission/stage.js";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin);
// normalize only on touch-only devices (iOS address-bar/momentum resync); on
// desktop it proxies scrolling and breaks programmatic/embedded scroll tracking
if (ScrollTrigger.isTouch === 1) ScrollTrigger.normalizeScroll(true);
ScrollTrigger.addEventListener("refreshInit", refreshCtx);
window.__ST = ScrollTrigger;   // debug + e2e settle hooks
window.__gsap = gsap;

document.documentElement.classList.add("js");
injectFlightLayer();
sizeRocketParts();
window.addEventListener("resize", sizeRocketParts);
document.getElementById("yr").textContent = new Date().getFullYear();

/* ---------- the mission (desktop choreography; mobile variant lands in Task 9) ---------- */
const mm = gsap.matchMedia();
mm.add(
  { desktop: "(min-width: 921px)", mobile: "(max-width: 920px)", reduce: "(prefers-reduced-motion: reduce)" },
  (mmCtx) => {
    const { reduce, mobile } = mmCtx.conditions;
    const flight = document.getElementById("flight");
    if (reduce || mobile) { return; }              // CSS hides .flight ≤920 / reduced motion
    const pinGridEl = document.getElementById("pinGrid");
    const onEnter = (self) => { if (self.isActive) refreshCtx(); };
    const refs = {};
    const hooks = {};                                          // late-bound cross-phase hooks
    Object.assign(refs, buildLaunch(els, TUNABLES));
    Object.assign(refs, buildSeparation(els, TUNABLES));
    Object.assign(refs, buildSpacewalk(els, TUNABLES, hooks));
    const landing = buildLanding(els, TUNABLES, { missionST: refs.mission });
    Object.assign(refs, landing.refs);
    hooks.laneAt = landing.laneAt;                             // phase-3 handoff rides phase-4 geometry
    refs.s2Owners = [refs.separation, refs.coast, refs.mission, refs.orbit, refs.landing];
    const removeStage = createStageManager(els, refs);
    createPin({ trigger: ".about-pin",   topFrac: TUNABLES.PIN_TOP_FRAC,        durVH: TUNABLES.PIN_DUR_VH,        pinGridEl, onToggle: onEnter });
    createPin({ trigger: ".skills-pin",  topFrac: TUNABLES.SKILLS_PIN_TOP_FRAC, durVH: TUNABLES.SKILLS_PIN_DUR_VH, pinGridEl, onToggle: onEnter });
    createPin({ trigger: ".contact-pin", topFrac: TUNABLES.FOOT_PIN_TOP_FRAC,   durVH: TUNABLES.FOOT_PIN_DUR_VH,   pinGridEl, onToggle: onEnter });
    // phases are built before their pins, so re-sort into document order — otherwise
    // triggers below a pin compute their ranges without that pin's spacer
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => removeStage();            // matchMedia cleanup on breakpoint change
  }
);

/* ---------- nav: mobile burger ---------- */
var burger   = document.getElementById("burger");
var navlinks = document.getElementById("navlinks");
if (burger && navlinks) {
  burger.addEventListener("click", function () { navlinks.classList.toggle("open"); });
  navlinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") navlinks.classList.remove("open");
  });
}

/* ---------- active nav link via IntersectionObserver ---------- */
var sections = ["work", "about", "skills", "experience", "contact"];
var linkMap  = {};
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
  sections.forEach(function (id) { var s = document.getElementById(id); if (s) navObs.observe(s); });
}

/* ---------- scroll reveal ---------- */
var reveals = document.querySelectorAll(".reveal");
function revealInView() {
  var vh = window.innerHeight || document.documentElement.clientHeight;
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
