/**
 * src/fx/plane.js
 * Paper-airplane resume-download flight.
 * Ported from design-handoff/project/site.js lines 712–849.
 * WAAPI offset-path replaced with GSAP MotionPath.
 */

import gsap from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";
gsap.registerPlugin(MotionPathPlugin);

const PLANE_SVG =
  '<svg viewBox="-20 -14 40 28" width="34" height="24" fill="none">' +
  '<path d="M18 0 L-15 -11 L-5 0 L-15 11 Z" fill="#fff" stroke="#44484E" stroke-width="2" stroke-linejoin="round"/>' +
  '<path d="M18 0 L-5 0 M-5 0 L-15 11" stroke="#1093C9" stroke-width="2" stroke-linecap="round"/></svg>';

// ── helpers ───────────────────────────────────────────────────────────────────

function reduceMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function triggerDownload(href, fname) {
  var a = document.createElement("a");
  a.href = href; a.download = fname || ""; a.style.display = "none";
  document.body.appendChild(a); a.click();
  setTimeout(function () { document.body.removeChild(a); }, 100);
}

var badge      = null;
var badgeName  = null;
var badgeTimer = null;

function showBadge(fname) {
  if (!badge) badge     = document.getElementById("dlBadge");
  if (!badgeName) badgeName = document.getElementById("dlName");
  if (!badge) return;
  if (badgeName) badgeName.textContent = fname || "resume";
  badge.classList.add("show");
  if (badgeTimer) clearTimeout(badgeTimer);
  badgeTimer = setTimeout(function () { badge.classList.remove("show"); }, 2800);
}

// Flight route: gentle wave to the right → full loop-the-loop → steep climb
// up into the top-right "downloads" corner. Coords are viewport px.
function buildFlightPath(sx, sy, ex, ey, H) {
  var dx = ex - sx;
  var cx = sx + dx * 0.60;             // loop centre x
  var cy = Math.max(sy - 70, 150);     // loop centre y (keep off top)
  var r  = Math.min(110, dx * 0.13, cy - 80, (H - cy) - 40);
  if (r < 50) r = 50;
  var k  = r * 0.5523;                 // cubic circle constant
  var bx = cx, by = cy + r;            // bottom of loop

  var p = "M " + sx + " " + sy;
  // wave in to the bottom of the loop
  p += " C " + (sx + dx * 0.20) + " " + (sy + 34) +
       ", "  + (bx - r * 1.6)   + " " + (by + 18) +
       ", "  + bx               + " " + by;
  // full clockwise loop: bottom → right → top → left → bottom
  p += " C " + (cx + k) + " " + (cy + r) + ", " + (cx + r) + " " + (cy + k) + ", " + (cx + r) + " " + cy;
  p += " C " + (cx + r) + " " + (cy - k) + ", " + (cx + k) + " " + (cy - r) + ", " + cx       + " " + (cy - r);
  p += " C " + (cx - k) + " " + (cy - r) + ", " + (cx - r) + " " + (cy - k) + ", " + (cx - r) + " " + cy;
  p += " C " + (cx - r) + " " + (cy + k) + ", " + (cx - k) + " " + (cy + r) + ", " + bx       + " " + by;
  // exit the loop and climb into the top-right corner
  p += " C " + (cx + dx * 0.22)  + " " + (by - 8) +
       ", "  + (ex - 12)          + " " + (ey + 260) +
       ", "  + ex                 + " " + ey;
  return p;
}

function flyPlane(startX, startY, done) {
  var W  = window.innerWidth;
  var H  = window.innerHeight;
  var ex = W - 34;   // top-right "downloads" corner
  var ey = 30;
  var d  = buildFlightPath(startX, startY, ex, ey, H);
  var NS = "http://www.w3.org/2000/svg";

  // 1) dashed flight path that fades in BEFORE the plane takes off
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class",   "fly-path");
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  svg.setAttribute("width",  String(W));
  svg.setAttribute("height", String(H));
  var pathEl = document.createElementNS(NS, "path");
  pathEl.setAttribute("d",     d);
  pathEl.setAttribute("class", "fly-path-line");
  svg.appendChild(pathEl);
  document.body.appendChild(svg);

  // fade the dashed path in
  gsap.fromTo(svg, { opacity: 0 }, {
    opacity:  1,
    duration: 0.48,
    ease:     "power1.out",
    onComplete: function () {
      // 2) once the line is visible, let the plane ride it
      var plane = document.createElement("div");
      plane.className = "fly-plane";
      plane.innerHTML = PLANE_SVG;
      // position fixed at 0,0 — MotionPath will move it
      plane.style.left = "0px";
      plane.style.top  = "0px";
      document.body.appendChild(plane);

      // fade the dashed line out as the plane arrives
      gsap.to(svg, { opacity: 0, duration: 0.7, delay: 1.95, ease: "power1.in" });

      // plane fades near the end
      gsap.to(plane, { opacity: 0, duration: 0.4, delay: 2.1 });

      gsap.to(plane, {
        motionPath: { path: d, autoRotate: true },
        duration:   2.5,
        ease:       "power2.inOut",
        onComplete: function () {
          plane.remove();
          svg.remove();
          if (done) done();
        },
      });
    },
  });
}

// ── public API ────────────────────────────────────────────────────────────────

export function initPlane() {
  document.querySelectorAll(".js-dl").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var href  = btn.getAttribute("href");
      var fname = btn.getAttribute("data-fname") || "resume";

      if (reduceMotion()) {
        triggerDownload(href, fname);
        showBadge(fname);
        return;
      }

      var r  = btn.getBoundingClientRect();
      var sx = r.left + r.width  / 2;
      var sy = r.top  + r.height / 2;

      flyPlane(sx, sy, function () { showBadge(fname); });
      // start the download mid-flight
      setTimeout(function () { triggerDownload(href, fname); }, 1500);
    });
  });
}
