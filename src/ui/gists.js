/**
 * src/ui/gists.js
 * Click-to-load GitHub Gist panels. Nothing is fetched until a panel is pressed;
 * on first open we JSONP the gist's `.json` endpoint and inject its rendered HTML
 * plus stylesheet. Configure which gists appear in src/data/gists.js.
 */

import { GISTS } from "../data/gists.js";

let _seq = 0;

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// JSONP-load a gist by URL/ID into `mount`. Resolves on success, rejects on
// network error or timeout.
function loadGist(gistUrl, mount) {
  return new Promise(function (resolve, reject) {
    var cb = "__gistcb_" + _seq++;
    var script = null;
    var done = false;
    var timer = setTimeout(function () { fail(new Error("timeout")); }, 9000);

    function cleanup() {
      done = true;
      clearTimeout(timer);
      try { delete window[cb]; } catch (_) { window[cb] = undefined; }
      if (script && script.parentNode) script.parentNode.removeChild(script);
    }
    function fail(err) { if (done) return; cleanup(); reject(err); }

    window[cb] = function (data) {
      if (done) return;
      cleanup();
      if (data && data.stylesheet && !document.querySelector("link[data-gist-css]")) {
        var link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = data.stylesheet;
        link.setAttribute("data-gist-css", "");
        document.head.appendChild(link);
      }
      mount.innerHTML = (data && data.div) || "";
      resolve();
    };

    var base = String(gistUrl).trim().replace(/\/+$/, "").replace(/\.(js|json)$/, "");
    script = document.createElement("script");
    script.src = base + ".json?callback=" + cb;
    script.onerror = function () { fail(new Error("network")); };
    document.body.appendChild(script);
  });
}

export function initGists() {
  var host = document.getElementById("gistPanels");
  if (!host || !GISTS || !GISTS.length) return;

  GISTS.forEach(function (g, i) {
    var panel = document.createElement("div");
    panel.className = "gist-panel";

    var btnId = "gist-btn-" + i;
    var regId = "gist-reg-" + i;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gist-toggle";
    btn.id = btnId;
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", regId);
    btn.innerHTML =
      '<span class="gist-caret" aria-hidden="true"></span>' +
      '<span class="gist-text">' +
        '<span class="gist-label">' + escapeHtml(g.label) + "</span>" +
        (g.blurb ? '<span class="gist-blurb">' + escapeHtml(g.blurb) + "</span>" : "") +
      "</span>";

    var region = document.createElement("div");
    region.className = "gist-region";
    region.id = regId;
    region.setAttribute("role", "region");
    region.setAttribute("aria-labelledby", btnId);
    region.hidden = true;

    var mount = document.createElement("div");
    mount.className = "gist-mount";
    region.appendChild(mount);

    var loaded = false;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      region.hidden = open;
      panel.classList.toggle("is-open", !open);

      if (open || loaded) return;
      if (g.gist) {
        loaded = true;
        mount.innerHTML = '<div class="gist-loading">loading gist…</div>';
        loadGist(g.gist, mount).catch(function () {
          mount.innerHTML =
            '<p class="gist-err">Couldn’t embed this gist. ' +
            '<a href="' + escapeHtml(g.gist) + '" target="_blank" rel="noopener noreferrer">Open it on GitHub →</a></p>';
        });
      } else {
        mount.innerHTML =
          '<p class="gist-todo">Gist coming soon — paste a gist URL into ' +
          "<code>src/data/gists.js</code> to embed it here.</p>";
      }
    });

    panel.appendChild(btn);
    panel.appendChild(region);
    host.appendChild(panel);
  });
}
