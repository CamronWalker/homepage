/**
 * src/data/projects.js
 *
 * OWNER EDIT POINT — this is the single file to update when project details change.
 * Add a new key to add a project; update paragraphs/stats/links to refresh existing cards.
 * The key must match the `data-project` attribute on the corresponding `.proj-card` in index.html.
 */

export const PROJECTS = {
  "nauvoo-vc": {
    name: "Nauvoo Temple Visitors' Center",
    role: "Superintendent · APM",
    eyebrow: "Religious · New Construction",
    stats: [["Size", "20,200 sf"], ["Years", "2024–26"], ["Where", "Nauvoo, IL"]],
    paragraphs: [
      "Ground-up visitors' center across from the Nauvoo Temple — led field execution under Westland founder Stan Houghton toward a public opening in mid-2026.",
      "Managed daily schedule, QC, and owner-inspection coordination through the finish phases.",
    ],
    links: [["Read coverage", "https://www.wgem.com/2025/07/21/nauvoo-temple-visitors-center-slated-mid-2026-completion/"]],
    photos: [],
  },

  "toronto": {
    name: "Toronto Ontario Temple",
    role: "Project Manager",
    eyebrow: "Religious · Renovation",
    stats: [["Size", "61,000 sf"], ["Years", "2023–24"], ["Where", "Toronto, ON"]],
    paragraphs: [
      "Full mechanical replacement and interior renovation of an occupied temple — 30+ tiered subcontractor packages coordinated across the US–Canada border.",
      "Held P&L and cost control throughout; coordinated cross-border logistics for materials and specialty trades while keeping the building operational.",
    ],
    links: [],
    photos: [],
  },

  "mountain-ridge": {
    name: "Mountain Ridge High School",
    role: "PE · APM",
    eyebrow: "K–12 · New Construction",
    stats: [["Budget", "$76M"], ["Size", "350,000 sf"], ["Where", "Herriman, UT"]],
    paragraphs: [
      "Three-year, public-bid high school build with full financial control of pay applications, change orders, and owner cost reporting alongside 40+ trade crews.",
      "Served as effective project lead with responsibility spanning procurement, subcontractor management, and schedule control across the full three-year build.",
    ],
    links: [],
    photos: [],
  },

  "st-george": {
    name: "St. George Historic Temple",
    role: "PE · APM",
    eyebrow: "Religious · Historic Renovation",
    stats: [["Size", "142,000 sf"], ["Years", "2019–23"], ["Where", "St. George, UT"]],
    paragraphs: [
      "Comprehensive renovation in a historic-preservation setting — submittal/RFI, document control, and change-management workflows across a complex delivery.",
      "Subcontractor and schedule coordination through a four-year effort on one of the most significant historic structures in the region.",
    ],
    links: [],
    photos: [],
  },

  "young-home": {
    name: "Brigham & Mary Ann Young Home",
    role: "Project Manager",
    eyebrow: "Historic Preservation",
    stats: [["Role", "Lead PM"], ["Years", "2025–26"], ["Where", "Nauvoo, IL"]],
    paragraphs: [
      "Period-correct preservation of Brigham Young's Nauvoo home — phased to keep museum operations running, with specialist material sourcing and owner coordination.",
      "Full P&L control on a specialty historic-preservation project, including sourcing period-correct materials and coordinating phased work around active museum visitors.",
    ],
    links: [],
    photos: [],
  },

  "brooklyn-bowl": {
    name: "Brooklyn Bowl @ The LINQ",
    role: "Field / PE support",
    eyebrow: "Retail / Entertainment · TI",
    stats: [["Size", "78,000 sf"], ["Year", "2014"], ["Where", "Las Vegas, NV"]],
    paragraphs: [
      "High-profile tenant build-out on the Las Vegas Strip with McCarthy Building Companies — RFI/submittal management and progress tracking on a fast-paced job.",
      "Gained early-career field and PE experience at an ENR Top-10 general contractor on one of the Strip's signature entertainment venues.",
    ],
    links: [],
    photos: [],
  },
};
