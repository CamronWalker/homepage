/**
 * src/data/gists.js
 *
 * OWNER EDIT POINT — the click-to-reveal code panels in the "Construction
 * Technology" section. Each panel stays collapsed until pressed; on first open
 * it lazy-loads the gist.
 *
 * To embed a real gist:
 *   1. Go to https://gist.github.com/  (sign in as Camron) and open a gist.
 *   2. Copy its URL from the address bar
 *      — e.g. https://gist.github.com/CamronWalker/abcdef1234567890
 *   3. Paste it into the `gist:` field below.
 * Leave `gist: ""` to show the panel with its description but no embed yet.
 */

export const GISTS = [
  {
    label: "Weekly schedule update — email generator",
    blurb: "Pulls SmartPM + Primavera P6 data and drafts the client schedule-update email.",
    gist: "",
  },
  {
    label: "Subcontractor buyout tracker",
    blurb: "Reconciles bids and buyout status across Procore and the bid platform.",
    gist: "",
  },
  {
    label: "P6 / XER schedule analyzer",
    blurb: "Quality, float, and critical-path checks straight off a P6 .xer export.",
    gist: "",
  },
];
