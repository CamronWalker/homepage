import { injectFlightLayer, sizeRocketParts } from "./flight-layer.js";

document.documentElement.classList.add("js");
injectFlightLayer();
sizeRocketParts();
window.addEventListener("resize", sizeRocketParts);
document.getElementById("yr").textContent = new Date().getFullYear();

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
