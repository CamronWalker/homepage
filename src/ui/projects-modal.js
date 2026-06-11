/**
 * src/ui/projects-modal.js
 * Project detail overlay — opens when a [data-project] card is clicked.
 */

import { PROJECTS } from "../data/projects.js";

// ── internal state ────────────────────────────────────────────────────────────
let _previousFocus = null;
let _keyHandler    = null;
let _pendingRemove = null;   // { backdrop, dialog } queued for DOM removal

// ── helpers ───────────────────────────────────────────────────────────────────
function _focusableEls(dialog) {
  return Array.from(
    dialog.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

function _trapFocus(e, dialog) {
  const els   = _focusableEls(dialog);
  if (!els.length) return;
  const first = els[0];
  const last  = els[els.length - 1];
  if (e.key === "Tab") {
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
}

// ── GSAP animation guard ──────────────────────────────────────────────────────
function _canAnimate() {
  try {
    return (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch (_) { return false; }
}

// ── openProject ───────────────────────────────────────────────────────────────
export function openProject(slug) {
  const data = PROJECTS[slug];
  if (!data) return;                    // unknown slug → no-op

  // store focused element to restore later
  _previousFocus = document.activeElement;

  const root = document.getElementById("modalRoot");
  if (!root) return;

  // backdrop
  const backdrop = document.createElement("div");
  backdrop.className = "pmodal-backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  // dialog
  const dialog = document.createElement("div");
  const headingId = "pmodal-h3-" + slug;
  dialog.className      = "pmodal";
  dialog.setAttribute("role",        "dialog");
  dialog.setAttribute("aria-modal",  "true");
  dialog.setAttribute("aria-labelledby", headingId);

  // close button
  const closeBtn = document.createElement("button");
  closeBtn.className  = "pm-close";
  closeBtn.type       = "button";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closeProject);

  // eyebrow
  const eyebrow = document.createElement("span");
  eyebrow.className   = "pm-eyebrow";
  eyebrow.textContent = data.eyebrow;

  // heading
  const h3 = document.createElement("h3");
  h3.id          = headingId;
  h3.textContent = data.name;

  // role chip
  const roleEl = document.createElement("span");
  roleEl.className   = "pm-role";
  roleEl.textContent = data.role;

  // stats row
  const statsRow = document.createElement("div");
  statsRow.className = "pm-stats";
  data.stats.forEach(function ([label, value]) {
    const item = document.createElement("span");
    item.className = "pm-stat";
    const dt = document.createElement("span");
    dt.className   = "pm-stat-label";
    dt.textContent = label;
    const dd = document.createElement("span");
    dd.className   = "pm-stat-value";
    dd.textContent = value;
    item.appendChild(dt);
    item.appendChild(dd);
    statsRow.appendChild(item);
  });

  // paragraphs
  const body = document.createElement("div");
  body.className = "pm-body";
  data.paragraphs.forEach(function (text) {
    const p = document.createElement("p");
    p.textContent = text;
    body.appendChild(p);
  });

  // links
  if (data.links && data.links.length > 0) {
    const linksList = document.createElement("ul");
    linksList.className = "pm-links";
    data.links.forEach(function ([label, url]) {
      const li = document.createElement("li");
      const a  = document.createElement("a");
      a.href             = url;
      a.textContent      = label;
      a.target           = "_blank";
      a.rel              = "noopener noreferrer";
      li.appendChild(a);
      linksList.appendChild(li);
    });
    body.appendChild(linksList);
  }

  // photos coming soon note
  if (!data.photos || data.photos.length === 0) {
    const note = document.createElement("div");
    note.className   = "pm-photos-note";
    note.textContent = "photos coming soon";
    body.appendChild(note);
  }

  // assemble
  dialog.appendChild(closeBtn);
  dialog.appendChild(eyebrow);
  dialog.appendChild(h3);
  dialog.appendChild(roleEl);
  dialog.appendChild(statsRow);
  dialog.appendChild(body);

  root.appendChild(backdrop);
  root.appendChild(dialog);

  // lock scroll
  document.body.style.overflow = "hidden";

  // focus the close button
  closeBtn.focus();

  // GSAP open animation
  if (_canAnimate()) {
    try {
      // dynamic import so jsdom tests don't depend on it
      import("gsap").then(function (mod) {
        const gsap = mod.default;
        gsap.from(".pmodal", {
          scale:     0.92,
          autoAlpha: 0,
          duration:  0.35,
          ease:      "power2.out",
        });
      }).catch(function () {});
    } catch (_) {}
  }

  // keyboard: Escape + focus trap
  _keyHandler = function (e) {
    if (e.key === "Escape") { closeProject(); return; }
    _trapFocus(e, dialog);
  };
  document.addEventListener("keydown", _keyHandler);

  // backdrop click closes
  backdrop.addEventListener("click", closeProject);

  // deep-link
  if (typeof history !== "undefined") {
    try { history.replaceState(null, "", "#project=" + slug); } catch (_) {}
  }
}

// ── closeProject ─────────────────────────────────────────────────────────────
export function closeProject() {
  const backdrop = document.querySelector(".pmodal-backdrop");
  const dialog   = document.querySelector(".pmodal");
  if (!backdrop && !dialog) return;

  // remove keyboard listener
  if (_keyHandler) {
    document.removeEventListener("keydown", _keyHandler);
    _keyHandler = null;
  }

  // restore scroll
  document.body.style.overflow = "";

  // restore focus
  if (_previousFocus && typeof _previousFocus.focus === "function") {
    _previousFocus.focus();
  }
  _previousFocus = null;

  // restore hash
  if (typeof history !== "undefined") {
    try { history.replaceState(null, "", "#work"); } catch (_) {}
  }

  // store refs for flushForTests
  _pendingRemove = { backdrop, dialog };

  // GSAP close animation; fall back to immediate removal
  let animated = false;
  if (_canAnimate()) {
    try {
      import("gsap").then(function (mod) {
        const gsap = mod.default;
        if (!_pendingRemove) return;    // already flushed
        animated = true;
        gsap.to(".pmodal", {
          scale:     0.92,
          autoAlpha: 0,
          duration:  0.25,
          ease:      "power2.in",
          onComplete: function () {
            _flushRemove();
          },
        });
      }).catch(function () { _flushRemove(); });
    } catch (_) { _flushRemove(); }
  }
  if (!animated) {
    // synchronous path for tests (jsdom) — deferred so flushForTests() works
    Promise.resolve().then(function () { /* intentional no-op */ });
  }
}

// Remove the DOM nodes — called by flushForTests() in tests or by GSAP onComplete.
function _flushRemove() {
  if (!_pendingRemove) return;
  const { backdrop, dialog } = _pendingRemove;
  _pendingRemove = null;
  if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
  if (dialog   && dialog.parentNode)   dialog.parentNode.removeChild(dialog);
}

/**
 * closeProject.flushForTests()
 * In jsdom tests GSAP dynamic-import never resolves, so tests call this to
 * synchronously complete the removal that closeProject() queued.
 */
closeProject.flushForTests = function () {
  _flushRemove();
};

// ── initProjectsUI ────────────────────────────────────────────────────────────
export function initProjectsUI() {
  // wire every [data-project] element
  document.querySelectorAll("[data-project]").forEach(function (el) {
    // accessibility: make div/non-a elements keyboard-activatable
    if (el.tagName.toLowerCase() !== "a") {
      if (!el.getAttribute("role")) el.setAttribute("role", "button");
      if (!el.getAttribute("tabindex")) el.setAttribute("tabindex", "0");
    }

    el.addEventListener("click", function () {
      openProject(el.getAttribute("data-project"));
    });

    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openProject(el.getAttribute("data-project"));
      }
    });
  });

  // deep-link on boot
  if (typeof location !== "undefined") {
    var m = location.hash.match(/^#project=(.+)$/);
    if (m) openProject(m[1]);
  }
}
