# camronwalker.com — Design & Animation Spec

**Date:** 2026-06-11 · **Status:** Approved (port & polish, one pass) · **Owner:** Camron Walker

## 1 · Goal

Implement the Claude Design prototype (`design-handoff/project/`) as a production site on camronwalker.com — a personal portfolio whose signature is a scroll-driven, hand-sketched rocket mission. Ship today. Two things the prototype lacks are first-class requirements: a **real mobile experience** (full mission, adapted — today everything below 920px is `display:none`) and **smooth, beautiful motion** (rebuild the hand-rolled scroll engine on GSAP).

Differentiator goal, in Camron's words: "create something unique here to hopefully set me apart from other applicants."

## 2 · References

- `design-handoff/project/index.html` — approved markup/copy (primary design)
- `design-handoff/project/site.js` — prototype choreography; the behavior baseline and source of all tunable starting values
- `design-handoff/project/rockets.js` — **single source of truth** for all rocket/astronaut/globe SVG parts; carries over as-is (converted to ES module)
- `design-handoff/project/site.css`, `camron.css` — layout + design tokens
- `design-handoff/chats/chat1-4.md` — design intent record

## 3 · Architecture & stack

- **Vite** vanilla-JS project at repo root. No framework — single page, content-editable by hand.
- **GSAP** (npm, all plugins free since 3.13): `ScrollTrigger` (phase timelines, pinning, scrub), `MotionPathPlugin` (orbit/descent riding, paper airplane), `DrawSVGPlugin` (draw-on effects). MorphSVG not required — the orbit-line reshape stays a control-point lerp (proven in prototype).
- Module layout:
  - `src/main.js` — boot, plugin registration, reduced-motion gate
  - `src/mission/` — `tunables.js`, `paths.js`, `launch.js`, `separation.js`, `spacewalk.js`, `landing.js`, `finale.js`
  - `src/fx/` — `pencil.js` (roughen + grain), `reveal.js`, `plane.js`
  - `src/ui/` — `nav.js`, `projects-modal.js`, `contact.js`
  - `src/data/projects.js` — projects content (modal copy lives here, not in markup)
  - `src/rockets.js` — SVG parts module
- **Tweaks panel removed from production.** React/Babel CDN scripts deleted; every tunable becomes a named constant in `src/mission/tunables.js` with the prototype's documentation comments preserved.
- **Edit-safety invariant (carry-over requirement):** all phase boundaries are measured from live element positions at load/resize (section tops, card rects, globe rect) — never hardcoded scroll pixels — so résumé copy can change without breaking choreography. ScrollTrigger's element-based `start`/`end` + `invalidateOnRefresh: true` is the implementation.
- **Deploy:** Cloudflare Pages connected to this GitHub repo (domain already on Cloudflare). Build `npm run build`, output `dist/`. Push-to-deploy. One-time repo connection in the CF dashboard is Camron's step.

## 4 · Design language (unchanged from prototype)

Graphite pencil-sketch aesthetic on off-white paper with a 30px graph-paper grid; Camron Blue `#1093C9` accents; Space Grotesk display, Mulish body, JetBrains Mono technical, Caveat hand-lettering (countdown, annotations, tips). Rocket design is locked: two-stage stack, flared-skirt engine bells, engine-bay flutes, twin shock-diamond plumes (nozzle-width at the bell, bulge below, thin separate tails — never merging). Astronaut is the traced vector from Camron's reference. Globe is the North-America sketch globe with lat/long grid.

## 5 · The Mission — animation spec (desktop)

### Global motion principles

- Every phase timeline is scrubbed to scroll with **catch-up smoothing** (`scrub: ~1s`) — the vehicle eases toward its scroll target instead of snapping. This is the single biggest "smooth and beautiful" upgrade over the prototype.
- Pins use ScrollTrigger pinning, not hand-toggled `position:fixed`. Pin distances stay snapped to whole 30px grid squares so the frozen grid hands back to the page without a jump.
- **Grid-freeze trick carries over:** a fixed full-viewport graph-paper layer (`#pinGrid`) fades in during any pin, `background-position` phase-aligned to the page grid (offset = pin start mod 30px).
- The flight overlay is one fixed, `aria-hidden`, `pointer-events:none` layer. Each phase shows only its own cast; nothing from another phase is ever visible.
- `ScrollTrigger.normalizeScroll(true)` for touch/address-bar stability; `gsap.ticker.lagSmoothing` defaults retained.

### Scroll geography (top → bottom)

| Phase | Scroll region | Pinned? |
|---|---|---|
| 1 · Launch | Hero (pinned) → top of Work | Hero pinned for countdown |
| transit | Work section | — |
| 2 · Approach + Separation | last ~0.55·vh before Work→About gap → About pin end | About pinned (≈1.2·vh, grid-snapped) |
| coast | About pin end → Skills pin start | — |
| 3 · Spacewalk | Skills pin (≈1.7·vh) | Skills pinned |
| 4a · Orbit | Skills pin end → Contact pin start (over Experience) | — |
| 4b · Burn + Landing | Contact pin (≈2.6·vh — the long cinematic beat) | Contact pinned |
| done / finale | below Contact pin end | scene stays pegged |

### Phase 1 · Launch

- **Idle:** rocket on pad with gantry; small ember flame flickers on a time-based loop (not scroll); subtle shake ramps with the countdown.
- **Countdown (hero pinned):** scroll steps hand-lettered **T‑3 → T‑2 → T‑1 → LIFTOFF** at quarter-points of the countdown distance (default ≈78vh, was the `launchLength` tweak ×60). LIFTOFF stacks as LIFT/OFF so it never smears the headline. Shake builds 0.3→1.9px, snapping to 2.6px at ignition; flame grows from ember through the count and flares at LIFTOFF.
- **Climb:** ease-in (slow off the pad — heavy-lift feel), rocket climbs out the top leaning progressively to **13°** right-to-left with ~150px leftward drift; pad fades in the first 8% of the climb; plume scaleY grows 1.0→1.2 with speed.
- **"keep scrolling" tip** (Caveat + sketched arrow) persists through the countdown, fades over the first half of the climb. First scroll never moves the pad (dead-zone preserved).

### Phase 2 · Approach + Stage separation

- Mated stack (identical part + scale as the launch rocket — width = launch SVG width × 140/600) flies in from off-left starting **0.55·vh before** the Work→About gap, nose right, booster burning, decelerating (easeOut) to the staging point at (0.44·W, max(0.13·H, 115px)) — in the clear band above the pinned About, below the nav.
- **About pins** (top at 0.26·H) for the full event, ≈1.2·vh grid-snapped.
- **Separation (first half of pin):** *gradual* — booster throttles down (flame fades over the first ~45%), slides back along the flight axis, then tumbles **down-left into the About section** (rotation easing in to +240°, drawing the eye to the copy — intentional, per design direction); second-stage ignition builds from 50% of the detach.
- **Burn-off (second half):** second stage accelerates off-right (easeIn) to 1.34·W; booster continues tumbling/fading below.
- Seam-aligned coordinate frames (mated stack and both split pieces share one viewBox frame centered on the separation seam) carry over verbatim — this is what makes a glitch-jump geometrically impossible.

### Phase 3 · Coast + Spacewalk

- **Coast:** capsule re-enters from off-right (it exited right in Phase 2 — continuity), drifts easeOut to its "mothership" hold at (0.84·W, band top), gentle sine bob and ±4° sway.
- **Skills pins** (top at 0.07·H) for ≈1.7·vh. Tour = first 66% of the pin:
  - Astronaut fades in at the capsule, swims the **big right-to-left crossing** to the far-left card (lead-in 18% of tour), then tours the cards **left → right**, ending back near the capsule.
  - The card under the astronaut gets `.sk-active` (lift + blue accent); astronaut dips ~12px toward an active card; sine swim bob (~7px) and gentle ±5° roll throughout.
  - **Tether** from capsule to astronaut at all times: a sagging quadratic curve, redrawn per frame; drawn on with DrawSVG when the astronaut first emerges.
- **Handoff (66% → 100%):** astronaut returns toward the capsule and fades; the dashed **orbit line sketches itself in** (DrawSVG, ahead of the ship); ship rotates from its hold attitude to face down-lane, positioned exactly on the lane at the capsule-hold height — zero jump into Phase 4.
- **Fix as part of rebuild:** the prototype's "astronaut not rendering" bug. Acceptance: visible-pixel verification at mid-tour, not code inspection.

### Phase 4 · Orbit, burn, landing

- **Orbit (unpinned, over Experience):** ship rides the fly-by lane prograde — nose leading, **engines cold** — drifting with a slight sine wander, from capsule-hold height to 0.22·H as the section scrolls. Lane opacity 0.55.
- **Geometry (carry-over):** ONE orbit line. Pre-burn it is a realistic fly-by: down the lane (offset 0.095·W left of the landing longitude), bending **around the globe's left limb** (concave toward the planet — gravity), exiting the bottom of the page. Built in viewport px from the globe's live rect.
- **Contact pins** (top 0, ≈2.6·vh). Within the pin:
  - **0 → 0.16:** coast down the lane to the branch point (0.27·H), prograde.
  - **0.16 → 0.28 (the burn):** ship **holds at the branch, flips retrograde** (easeInOut through ~180°), fires **one short punchy half-scale flame** (sine pulse). Simultaneously the line's forward knot + control points lerp from wrap-around-miss to coastal-descent — the orbit **reshapes**; no second line ever appears. Old path dims toward ghost.
  - **0.28 → 0.56:** engine-first descent riding the new line (MotionPath); at **72%** of the descent the ship rotates nose-down for the final dive.
  - **0.56 → 1.0:** arrived over the landing point — long, slow shrink (scale → 0.05), then the ship pops out and the **orange landing dot** (r≈7px) lights just off the northern-California coast and **stays**.
  - **Globe** rotates **+16°** (easeInOut across the pin) swinging the Pacific coast up under the descending ship.
- **Done state:** scene stays pegged — globe rotated, dot lit, flight path lingering at 20% opacity as a ghost trace.

### Finale · "back to the top" (P1 — new; from chat 4, never built)

Once the dot lands, a hand-lettered **"back to the top"** (Caveat, countdown-sized) rises from the bottom of the viewport with a sketched up-arrow. Clicking it smooth-scrolls to the top and re-arms the mission. Keyboard focusable.

### Tunables (starting values = prototype's approved feel)

`GRID_PX 30 · APPROACH_LEAD_VH 0.55 · PIN_DUR_VH 1.2 · PIN_TOP_FRAC 0.26 · ROCKET_X_FRAC 0.44 · ROCKET_Y_FRAC 0.13 / min 115px · SKILLS_PIN_DUR_VH 1.7 · SKILLS_PIN_TOP_FRAC 0.07 · ASTRO_ABOVE_CARDS 64 · TOUR_END 0.66 · CAPSULE_X_FRAC 0.84 · CAP_HOLD_FRAC 0.12 · ORBIT_EXIT_FRAC 0.22 · LANE_OFF_FRAC 0.095 · BURN_Y_FRAC 0.27 · LAND_FLIP_AT 0.16 / LEN 0.12 · LAND_SHRINK_START 0.56 · NOSE_DOWN_AT 0.72 · FOOT_PIN_DUR_VH 2.6 · EARTH_LAND_DEG 256 · EARTH_LAND_R 0.42 · EARTH_SPIN_DEG 16 · launch countdown ≈78vh`

## 6 · Mobile choreography (≤ 768px; 769–1024px keeps desktop choreography at scaled sizes)

Full mission, re-staged — never hidden:

- **Launch:** rocket ≈40vw wide, countdown lettering scaled to sit beside it without covering the headline; same pin + beats.
- **Separation:** stays **horizontal L→R** (core idea). Staged in a clear band higher in the viewport; About pins lower (PIN_TOP_FRAC ↑); travel distances already in vw/vh fractions; booster tumble arc shortened so it stays on-screen.
- **Spacewalk:** skill cards stack one column, so the astronaut tours **top-to-bottom** down the column (same card-lighting beat, same dip toward the active card), tether reaching **up** to the capsule holding top-right. Pin distance scales with card-column height.
- **Orbit/Landing:** globe restored on mobile (smaller, anchored bottom-right, partially off-canvas right like desktop); lane runs down the right edge; identical burn/morph/landing — geometry is already viewport-fraction + globe-rect based.
- Hand annotations that would collide with copy are hidden per-annotation (not globally).
- Touch behavior: ScrollTrigger pinning + `normalizeScroll`; no scroll hijacking beyond the pins themselves; momentum flicks land mid-phase gracefully thanks to scrub smoothing.

## 7 · Reduced motion & no-JS

- `prefers-reduced-motion: reduce`: flight layer hidden entirely, pins disabled (sections flow normally), reveals instant, paper airplane skipped (download fires directly). Carry-over, kept.
- **No-JS:** all content readable. Reveal-hiding styles only apply under a JS-added `js` class on `<html>`; flight layer markup is decorative and `aria-hidden`.

## 8 · Pencil-look pass (P1)

Three independent, individually removable layers:

1. **Paper grain:** faint procedural noise overlay on the page background (multiply, ~3–4% opacity), static — no animation cost.
2. **Stroke wobble:** `.cw-sketch` paths pre-roughened once at load with a seeded perturbation (`pencil.js`), so animated elements pay **zero** filter cost. No live `feTurbulence` on anything that moves. Static decorations may use an SVG displacement filter where cheaper.
3. **Draw-on:** annotations, sketched arrows, underlines, the orbit line, and the tether draw themselves in (DrawSVG) on reveal.

Acceptance is taste-based: if a layer reads as noise rather than pencil, it ships off.

## 9 · Projects detail overlay (new)

- Click a project card → detail view. Desktop: centered paper-card modal (max-width ~880px), sketch border, GSAP scale/unfold from the card. Mobile: full-screen sheet sliding up.
- Contents per project (from `src/data/projects.js`): name, role chip, eyebrow (sector · type), stats row (size / dates / location / value), narrative paragraphs, photo gallery slots, external links. Nauvoo keeps its press-coverage link inside the modal.
- Launch content = existing card copy + "photos coming soon" hand-written placeholder; Camron fills in fuller copy/photos in the data file later (this is the explicit content-edit path).
- Behavior: Esc / backdrop / X close; focus trap; scroll lock; card is a `<button>`-semantics element; optional `#project=slug` deep link.
- The `image-slot` drag-drop element (design-tool artifact) is replaced by plain `<img>` with a sketch-styled placeholder frame.

## 10 · Content & cleanup

- **Resume:** convert `Camron-Walker-Resume.docx` → **PDF**; PDF is the public download (filename `Camron-Walker-Resume.pdf`). Paper-airplane flight (wave → loop-the-loop → climb to top-right "downloads corner") + "downloaded" badge carry over; download fires mid-flight.
- **Contact:** email/phone stay JS-assembled from char codes (scraper-safe), click-to-reveal as designed.
- **Launch hygiene:** OG/social meta + description, favicon from the CW mark, sketch-styled 404 page, `robots.txt`. Footer year stays dynamic.
- **Removed:** tweaks panel + React/Babel CDN scripts, `_preview.html`, screenshots/uploads (stay in `design-handoff/` only).

## 11 · Performance budget

- JS (incl. GSAP + plugins) ≤ ~150KB gzipped; no React in prod.
- Portrait PNG compressed (currently 1.8MB → target ≤ 250KB, responsive sizes).
- Animations transform/opacity-only on the flight layer; no layout thrash in scrub callbacks (rects cached per refresh, not per frame, except the live tether/astronaut card-hit which reads cached card rects).
- Lighthouse mobile: 90+ performance on the deployed production site.

## 12 · Verification

- **Playwright** scripted pass at 1440×900 and 390×844: scroll the full mission, screenshot each beat — pad idle, T-1, liftoff climb, mated approach, separation moment, astronaut mid-tour (visible-pixel assertion — the prototype's bug), burn flip, nose-down descent, landed dot + rotated globe, finale lettering. Plus reduced-motion pass and no-JS readability pass.
- **Live observation:** Vite dev server registered in `.claude/launch.json` and started during implementation so Camron can watch progress.
- Standard checks: build passes, no console errors through a full scroll, links/download verified.

## 13 · Priorities

- **P0 (today):** Vite scaffold · GSAP mission desktop · mobile choreography · projects modal · PDF resume · contact/nav/reveals · meta/favicon · deploy to Cloudflare Pages.
- **P1 (bolt-on, no rework if deferred):** pencil-look pass · "back to the top" finale · 404 page · deep-link for project modals.

## 14 · Out of scope

three.js / WebGL (decided against — fights the pencil aesthetic); CMS or build-time content pipeline; blog; analytics; multi-page routes; Rocket Studio / Hero Directions pages (design references only).

## 15 · Needs Camron

1. Connect the GitHub repo to Cloudflare Pages (one-time, ~5 min, dashboard) — or a `wrangler` login for first deploy.
2. Fuller project narratives + photos for the modals (post-launch fine; data file is the edit point).
3. LinkedIn article URLs for project cards (chat-4 leftover).
