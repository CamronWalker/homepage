/**
 * src/data/gists.js
 *
 * OWNER EDIT POINT — the click-to-reveal code panels in the "Construction
 * Technology" section. Each panel stays collapsed until pressed; on first open
 * it lazy-loads the gist.
 *
 * To change a panel: edit its `label`/`blurb`, or paste a different gist URL
 * into `gist:` (copy it from the address bar at https://gist.github.com/).
 * Leave `gist: ""` to show a panel with its description but no embed yet.
 */

export const GISTS = [
  {
    label: "Schedule Intelligence",
    blurb: "A custom CPM engine, P6/XER analysis, and the weekly client schedule-update email.",
    gist: "https://gist.github.com/CamronWalker/26751a21b824e5859cd8f1a91de8427b",
  },
  {
    label: "PM Operations (Procore)",
    blurb: "The whole Procore API, organized the way a PM actually works — as an MCP connector.",
    gist: "https://gist.github.com/CamronWalker/3d3484adcb9aa0070b2a8785a83bebc2",
  },
  {
    label: "Preconstruction & Buyout",
    blurb: "Reconciling BuildingConnected bids against Procore commitments.",
    gist: "https://gist.github.com/CamronWalker/068fbd93940dc7c9a231de035c3bd9ea",
  },
  {
    label: "Ecosystem Index",
    blurb: "The whole picture — construction ops as Claude Code skills plus a remote MCP fleet.",
    gist: "https://gist.github.com/CamronWalker/2594f8256c3e11a80d767ea5e607d3f7",
  },
];
