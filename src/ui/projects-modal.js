/**
 * src/ui/projects-modal.js
 * Project detail overlay — opens when a [data-project] card is clicked.
 * No animation library: a short CSS opacity fade is the only motion.
 */

import { PROJECTS } from "../data/projects.js";

// ── internal state ────────────────────────────────────────────────────────────
let _previousFocus = null;
let _keyHandler    = null;
let _pendingRemove = null;   // { backdrop, dialog } queued for DOM removal
let _removeTimer   = null;

// ── helpers ───────────────────────────────────────────────────────────────────
function _focusableEls(dialog) {
  return Array.from(
    dialog.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

function _trapFocus(e, dialog) {
  const els = _focusableEls(dialog);
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

// ── openProject ───────────────────────────────────────────────────────────────
export function openProject(slug) {
  const data = PROJECTS[slug];
  if (!data) return;                    // unknown slug → no-op

  // if a previous modal is mid-close, finish removing it first
  if (_removeTimer) _flushRemove();

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
  dialog.className = "pmodal";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", headingId);

  // close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "pm-close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closeProject);

  // eyebrow
  const eyebrow = document.createElement("span");
  eyebrow.className = "pm-eyebrow";
  eyebrow.textContent = data.eyebrow;

  // heading
  const h3 = document.createElement("h3");
  h3.id = headingId;
  h3.textContent = data.name;

  // role chip
  const roleEl = document.createElement("span");
  roleEl.className = "pm-role";
  roleEl.textContent = data.role;

  // stats row
  const statsRow = document.createElement("div");
  statsRow.className = "pm-stats";
  (data.stats || []).forEach(function ([label, value]) {
    const item = document.createElement("span");
    item.className = "pm-stat";
    const dt = document.createElement("span");
    dt.className = "pm-stat-label";
    dt.textContent = label;
    const dd = document.createElement("span");
    dd.className = "pm-stat-value";
    dd.textContent = value;
    item.appendChild(dt);
    item.appendChild(dd);
    statsRow.appendChild(item);
  });

  // body
  const body = document.createElement("div");
  body.className = "pm-body";
  (data.paragraphs || []).forEach(function (text) {
    const p = document.createElement("p");
    p.textContent = text;
    body.appendChild(p);
  });

  // highlights — "What I did"
  if (data.highlights && data.highlights.length) {
    const title = document.createElement("span");
    title.className = "pm-hl-title";
    title.textContent = "What I did";
    const ul = document.createElement("ul");
    ul.className = "pm-highlights";
    data.highlights.forEach(function (text) {
      const li = document.createElement("li");
      li.textContent = text;
      ul.appendChild(li);
    });
    body.appendChild(title);
    body.appendChild(ul);
  }

  // links — "Coverage & video"
  if (data.links && data.links.length) {
    const title = document.createElement("span");
    title.className = "pm-links-title";
    title.textContent = "Coverage & video";
    const linksList = document.createElement("ul");
    linksList.className = "pm-links";
    data.links.forEach(function ([label, url]) {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = url;
      a.textContent = label;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      li.appendChild(a);
      linksList.appendChild(li);
    });
    body.appendChild(title);
    body.appendChild(linksList);
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

  // CSS fade-in on the next frame
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(function () {
      backdrop.classList.add("pm-shown");
      dialog.classList.add("pm-shown");
    });
  } else {
    backdrop.classList.add("pm-shown");
    dialog.classList.add("pm-shown");
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

  if (_keyHandler) {
    document.removeEventListener("keydown", _keyHandler);
    _keyHandler = null;
  }

  document.body.style.overflow = "";

  if (_previousFocus && typeof _previousFocus.focus === "function") {
    _previousFocus.focus();
  }
  _previousFocus = null;

  if (typeof history !== "undefined") {
    try { history.replaceState(null, "", "#work"); } catch (_) {}
  }

  // fade out, then remove
  _pendingRemove = { backdrop, dialog };
  if (backdrop) backdrop.classList.remove("pm-shown");
  if (dialog)   dialog.classList.remove("pm-shown");
  _removeTimer = setTimeout(_flushRemove, 200);
}

// Remove the DOM nodes — called by the fade-out timer or by flushForTests().
function _flushRemove() {
  if (_removeTimer) { clearTimeout(_removeTimer); _removeTimer = null; }
  if (!_pendingRemove) return;
  const { backdrop, dialog } = _pendingRemove;
  _pendingRemove = null;
  if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
  if (dialog   && dialog.parentNode)   dialog.parentNode.removeChild(dialog);
}

/**
 * closeProject.flushForTests()
 * jsdom has no real transitions, so tests call this to synchronously complete
 * the removal that closeProject() queued.
 */
closeProject.flushForTests = function () {
  _flushRemove();
};

// ── initProjectsUI ────────────────────────────────────────────────────────────
export function initProjectsUI() {
  document.querySelectorAll("[data-project]").forEach(function (el) {
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
