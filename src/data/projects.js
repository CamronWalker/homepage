/**
 * src/data/projects.js
 *
 * OWNER EDIT POINT — the single file to update when project details change.
 * Add a key to add a project; edit paragraphs / highlights / stats / links to
 * refresh an existing card's pop-up. The key must match the `data-project`
 * attribute on the corresponding `.proj-card` in index.html.
 */

export const PROJECTS = {
  "nauvoo-vc": {
    name: "Nauvoo Temple Visitors' Center",
    role: "Superintendent · PM",
    eyebrow: "Museum · New Construction",
    stats: [["Size", "20,200 sf"], ["Years", "2024–26"], ["Where", "Nauvoo, IL"]],
    paragraphs: [
      "Ground-up visitors' center across from the Nauvoo Temple — a 20,200 sf building that operates as a museum and exhibit space for temple visitors. I led field execution and turnover under Westland's founder toward a public opening in mid-2026, ahead of schedule.",
      "Day to day I ran the schedule, quality control, and owner-inspection coordination through the finish and turnover phases.",
    ],
    highlights: [
      "Led 5 direct reports through field execution and turnover",
      "Ran daily scheduling, QC, and owner-inspection coordination",
      "Delivered ahead of schedule toward a mid-2026 public opening",
    ],
    links: [
      ["Church Newsroom — scheduled for dedication", "https://newsroom.churchofjesuschrist.org/article/new-nauvoo-temple-visitors--center-scheduled-for-dedication"],
      ["WGEM — slated for mid-2026 completion", "https://www.wgem.com/2025/07/21/nauvoo-temple-visitors-center-slated-mid-2026-completion/"],
    ],
    photos: [],
  },

  "toronto": {
    name: "Toronto Ontario Temple",
    role: "Project Manager",
    eyebrow: "Religious · Renovation",
    stats: [["Size", "61,000 sf"], ["Years", "2023–24"], ["Where", "Toronto, ON"]],
    paragraphs: [
      "Full mechanical-system replacement plus interior renovation of an occupied temple — restrooms, ordinance rooms, and baptistry — held full budget and cost control throughout.",
      "I drove the construction management, commissioning, substantial completion, punch-list closeout, and acceptance certification to the owner's standards.",
    ],
    highlights: [
      "Full mechanical replacement on a working, occupied building",
      "Coordinated 30+ tiered subcontractor packages across the US–Canada border",
      "Led 2 direct reports plus the design and consultant team",
      "Owned commissioning through substantial completion and acceptance",
    ],
    links: [
      ["LDS Living — photos of the renovated temple", "https://www.ldsliving.com/gorgeous-photos-of-renovated-toronto-temple/s/12655"],
      ["Church News — rededication", "https://www.thechurchnews.com/temples/2024/10/28/auckland-new-zealand-temple-dedication-toronto-ontario-temple-rededication-holland-kearon/"],
      ["Video — Toronto Ontario Temple rededicated", "https://www.youtube.com/watch?v=UfZxZaSbslM"],
    ],
    photos: [],
  },

  "mountain-ridge": {
    name: "Mountain Ridge High School",
    role: "Project Engineer · APM",
    eyebrow: "K–12 · New Construction",
    stats: [["Budget", "$76M"], ["Size", "350,000 sf"], ["Where", "Herriman, UT"]],
    paragraphs: [
      "Three-year, $76M public-bid high school for Jordan School District — I served multiple roles across the build with full financial control of pay applications, change-order negotiation, and owner cost reporting.",
      "Coordinated mechanical, electrical, plumbing, and fire-suppression trades through rough-in, functional testing, and commission-agent / fire-marshal / AHJ acceptance.",
    ],
    highlights: [
      "Full financial control of pay apps, change orders, and owner cost reporting",
      "Coordinated MEP & fire-suppression trades through functional testing and AHJ acceptance",
      "Built to the LEED energy standards written into the project specifications",
    ],
    links: [
      ["MHTN — project page", "https://www.mhtn.com/portfolio-item/mountain-ridge-high-school/"],
      ["Education Snapshots — photo gallery", "https://educationsnapshots.com/projects/12967/mountain-ridge-high-school/"],
    ],
    photos: [],
  },

  "st-george": {
    name: "St. George Historic Temple",
    role: "Project Engineer",
    eyebrow: "Religious · Historic Renovation",
    stats: [["Size", "140,000 sf"], ["Years", "2019–23"], ["Where", "St. George, UT"]],
    paragraphs: [
      "Comprehensive renovation plus a new-construction addition on one of the most significant historic structures in the region — a complex historic-preservation delivery.",
      "My scope ran submittal/RFI and document control, change management, and subcontractor and schedule coordination across the multi-year effort.",
    ],
    highlights: [
      "Submittal/RFI, document control, and change management on a historic-preservation job",
      "Subcontractor and schedule coordination across a multi-year delivery",
      "Renovation plus a new-construction addition",
    ],
    links: [
      ["Church News — what changed (photos)", "https://www.thechurchnews.com/temples/2023/10/2/23889127/st-george-utah-temple-renovation-what-changed-photos/"],
      ["Video — St. George Utah Temple rededicated", "https://www.youtube.com/watch?v=vIss6KbLpJg"],
    ],
    photos: [],
  },

  "young-home": {
    name: "Brigham & Mary Ann Young Home",
    role: "Project Manager",
    eyebrow: "Historic Preservation",
    stats: [["Role", "Lead PM"], ["Years", "2025–26"], ["Where", "Nauvoo, IL"]],
    paragraphs: [
      "Period-correct historic preservation of Brigham Young's Nauvoo home with full project-budget ownership — phased to keep museum operations running throughout.",
      "Kept the work on schedule through harsh winter conditions with creative weather protection and sequencing, and sourced period-correct materials with owner coordination.",
    ],
    highlights: [
      "Lead PM with full P&L control",
      "Sourced period-correct materials for an authentic restoration",
      "Held schedule through harsh winter conditions with creative weather protection",
    ],
    links: [
      ["Church — Brigham & Mary Ann Young Home", "https://www.churchofjesuschrist.org/learn/locations/young-home?lang=eng"],
    ],
    photos: [],
  },

  "brooklyn-bowl": {
    name: "Brooklyn Bowl @ The LINQ",
    role: "Internship · McCarthy",
    eyebrow: "Retail / Entertainment · TI",
    stats: [["Size", "78,000 sf"], ["Year", "2014"], ["Where", "Las Vegas, NV"]],
    paragraphs: [
      "78,000 sf tenant improvement built into a landlord core-and-shell on an operating Las Vegas Strip property — my early-career internship with ENR Top-10 general contractor McCarthy Building Companies.",
      "Handled subcontractor coordination, RFI/submittal management, and progress tracking on a fast-paced, high-profile job.",
    ],
    highlights: [
      "RFI/submittal management and progress tracking",
      "TI built into landlord core-and-shell on an operating Strip property",
      "Early-career internship at an ENR Top-10 general contractor",
    ],
    links: [
      ["McCarthy — project page", "https://www.mccarthy.com/projects/brooklyn-bowl"],
      ["Video — Building Brooklyn Bowl Las Vegas", "https://www.youtube.com/watch?v=s1snzow2cQw"],
      ["Cerris Systems — project", "https://cerrissystems.com/portfolios/brooklyn-bowl/"],
    ],
    photos: [],
  },
};
