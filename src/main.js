/* camronwalker.com — lean content site.
   The scroll-choreographed rocket "mission" lives on the `full-mission-animations`
   branch; this build keeps only the content, the project modal, the click-to-load
   gist panels, the contact reveal, and the resume download. No GSAP. */

import { initProjectsUI } from "./ui/projects-modal.js";
import { initContact } from "./ui/contact.js";
import { initGists } from "./ui/gists.js";

document.documentElement.classList.add("js");
const yr = document.getElementById("yr");
if (yr) yr.textContent = new Date().getFullYear();

/* ---------- nav: mobile burger ---------- */
var burger   = document.getElementById("burger");
var navlinks = document.getElementById("navlinks");
if (burger && navlinks) {
  burger.addEventListener("click", function () { navlinks.classList.toggle("open"); });
  navlinks.addEventListener("click", function (e) {
    if (e.target.tagName === "A") navlinks.classList.remove("open");
  });
}

/* ---------- nav: hairline border once scrolled ---------- */
var nav = document.getElementById("nav");
function onScrollNav() { if (nav) nav.classList.toggle("is-stuck", window.scrollY > 8); }
window.addEventListener("scroll", onScrollNav, { passive: true });
onScrollNav();

/* ---------- active nav link via IntersectionObserver ---------- */
var sections = ["work", "about", "skills", "tech", "experience", "contact"];
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

/* ---------- scroll reveal (subtle fade-up; robust fallbacks so content can never stay hidden) ---------- */
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
window.addEventListener("scroll", revealInView, { passive: true });
window.addEventListener("load", revealInView);
revealInView();
setTimeout(revealInView, 400);

/* ---------- features ---------- */
initProjectsUI();
initContact();
initGists();

/* ---------- resume download toast (native <a download> does the download) ---------- */
(function initDownloads() {
  var badge     = document.getElementById("dlBadge");
  var badgeName = document.getElementById("dlName");
  var timer = null;
  function showBadge(fname) {
    if (!badge) return;
    if (badgeName) badgeName.textContent = fname || "resume";
    badge.classList.add("show");
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { badge.classList.remove("show"); }, 2800);
  }
  document.querySelectorAll(".js-dl").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showBadge(btn.getAttribute("data-fname") || "resume");
    });
  });
})();
