# camronwalker.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved rocket-mission portfolio (spec: `docs/superpowers/specs/2026-06-11-homepage-animation-design.md`) as a Vite + GSAP production site on Cloudflare Pages, with full mobile choreography.

**Architecture:** Each mission phase is a pure `*Frame(progress, ctx)` function returning stage directions (positions/rotations/opacities) — a faithful port of the proven math in `design-handoff/project/site.js` — applied by a thin DOM applier and driven by a scrub-smoothed GSAP proxy tween per phase. ScrollTrigger owns all pinning (hero/About/Skills/Contact) and the frozen-grid sync. Pure functions make phase-boundary continuity ("no jump") unit-testable.

**Tech Stack:** Vite (vanilla JS), GSAP 3.13+ (ScrollTrigger, MotionPathPlugin, DrawSVGPlugin — all free), Vitest (+jsdom), Playwright.

**Source of truth for ported math:** `design-handoff/project/site.js` (phase blocks: launch 419–462, approach 469–478, separate 480–504, coast 506–513, mission/spacewalk 515–559, orbit 561–574, landing 576–619, done 621–634, buildPhase4 246–290, ptAt/ptAtY 293–306, paper plane 723–848). When a step says "port lines N–M", the engineer copies that logic, converting DOM mutation → returned stage-direction objects. Tunable starting values are in the spec §5 and must not be re-invented.

---

### Task 1: Vite scaffold, dependencies, dev server for live observation

**Files:**
- Create: `package.json`, `vite.config.js`, `src/main.js` (stub)
- Modify: `.claude/launch.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "camronwalker-homepage",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "gsap": "^3.13.0"
  },
  "devDependencies": {
    "vite": "^6.3.0",
    "vitest": "^3.1.0",
    "jsdom": "^26.0.0",
    "@playwright/test": "^1.52.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```js
import { defineConfig } from "vite";

export default defineConfig({
  build: { outDir: "dist", assetsInlineLimit: 0 },
  server: { port: 5173, strictPort: true },
});
```

- [ ] **Step 3: Install**

Run: `npm install`
Expected: lockfile created, no errors. Then `npx playwright install chromium` (one-time browser download).

- [ ] **Step 4: Stub src/main.js** (so dev server serves something)

```js
console.log("camronwalker.com boot");
```

- [ ] **Step 5: Add dev config to .claude/launch.json**

Add a second configuration (keep `design-prototype`):

```json
{
  "name": "dev",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev"],
  "port": 5173
}
```

- [ ] **Step 6: Start the `dev` preview server** (Camron observes here from now on). Verify `http://localhost:5173` responds.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vite.config.js src/main.js .claude/launch.json
git commit -m "chore: scaffold Vite project with GSAP, Vitest, Playwright"
```

---

### Task 2: Static port — markup, styles, assets, SVG parts module, flight layer

**Files:**
- Create: `index.html` (repo root), `src/styles/camron.css`, `src/styles/site.css`, `src/rockets.js`, `src/flight-layer.js`, `public/assets/camron-portrait.png`, `public/assets/Camron-Walker-Resume.docx` (PDF replaces it in Task 11)
- Modify: `src/main.js`

- [ ] **Step 1: Copy assets**

```powershell
New-Item -ItemType Directory -Force public/assets | Out-Null
Copy-Item design-handoff/project/assets/camron-portrait.png public/assets/
Copy-Item design-handoff/project/assets/Camron-Walker-Resume.docx public/assets/
Copy-Item design-handoff/project/camron.css src/styles/camron.css
Copy-Item design-handoff/project/site.css src/styles/site.css
```

- [ ] **Step 2: Create root index.html from the prototype**

Start from `design-handoff/project/index.html` and apply exactly these changes:
1. Delete everything from `<!-- Tweaks panel … -->` (line 395) through the closing `</script>` of the Babel block (line 421) — no React/Babel/tweaks in production.
2. Delete the four `<script src="…">` tags for `astro_path.js`, `land_path.js`, `rockets.js`, `image-slot.js`, `site.js` (lines 388–393) and add `<script type="module" src="/src/main.js"></script>` before `</body>`.
3. Replace the two stylesheet links with `/src/styles/camron.css` and `/src/styles/site.css`.
4. Replace each `<image-slot id="p-…" placeholder="Drop a project photo"></image-slot>` with:
   ```html
   <div class="proj-photo proj-photo--empty"><span class="proj-photo-note">photo coming soon</span></div>
   ```
   (6 occurrences; keep ids as `data-photo="p-nauvoo-vc"` etc. for later real images.)
5. Add `data-project="<slug>"` to each `.proj-card` (slugs: `nauvoo-vc`, `toronto`, `mountain-ridge`, `st-george`, `young-home`, `brooklyn-bowl`) — used by the projects modal.
6. Keep the flight-layer markup (`#flight`, `#flCount`, `#flTip`, `.fl-obj` divs, `#flOrbit`, `#pinGrid`) verbatim.

- [ ] **Step 3: Add CSS for the new photo placeholder + JS-gated reveals**

Append to `src/styles/site.css`:

```css
/* photo placeholder (replaces design-tool image-slot) */
.proj-photo { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background:
    linear-gradient(var(--cw-line-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--cw-line-soft) 1px, transparent 1px);
  background-size: 30px 30px; }
.proj-photo-note { font-family: var(--cw-hand); color: var(--cw-graphite-2); font-size: 19px; transform: rotate(-4deg); }
.proj-photo img { width: 100%; height: 100%; object-fit: cover; }
```

And change the reveal rule so content is visible without JS — replace `.reveal { opacity: 0; …`  with:

```css
html.js .reveal { opacity: 0; transform: translateY(22px); transition: opacity .7s var(--cw-ease), transform .7s var(--cw-ease); }
html.js .reveal.in { opacity: 1; transform: none; }
```

(Keep the `.d1/.d2/.d3` delay rules; scope them with `html.js` too.)

- [ ] **Step 4: Create src/rockets.js**

Copy `design-handoff/project/rockets.js` and convert the trailing `window.ROCKET_PARTS = {…}` assignment to `export const ROCKET_PARTS = {…}`. It depends on `window.CW_ASTRO_PATH` / land-path globals from `astro_path.js` / `land_path.js` — copy those two files to `src/astro_path.js` / `src/land_path.js`, convert each `window.X = …` to `export const X = …`, and import them in `rockets.js`. No other edits.

- [ ] **Step 5: Create src/flight-layer.js** — the injection code, ported verbatim from `site.js:37–128` (pad+stack into `#flLaunch`, seam-centered viewBoxes for `#flStage2`/`#flDebris`/`#flMated`, astronaut, satellite, `earthNA()` globe into `#landGlobe`, and `sizeRocketParts()` keeping parts at launch scale × 140/600). Export:

```js
export function injectFlightLayer() { /* ported injection */ }
export function sizeRocketParts() { /* ported */ }
export const els = {}; // populated with all getElementById handles the phases need
```

- [ ] **Step 6: Wire src/main.js**

```js
import { injectFlightLayer, sizeRocketParts } from "./flight-layer.js";
document.documentElement.classList.add("js");
injectFlightLayer();
sizeRocketParts();
document.getElementById("yr").textContent = new Date().getFullYear();
```

- [ ] **Step 7: Verify in dev server** — page renders identically to prototype at rest: rocket on pad in hero, all sections readable, no console errors. Check 390px width: static mobile layout intact. Check `view-source` has no React/Babel/tweaks.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: static port of prototype markup, styles, assets, and SVG parts"
```

---

### Task 3: Geometry module (TDD)

**Files:**
- Create: `src/mission/geometry.js`
- Test: `tests/geometry.test.js`

- [ ] **Step 1: Write failing tests**

```js
import { describe, it, expect } from "vitest";
import { clamp01, lerp, easeIn, easeOut, easeInOut, snapToGrid, buildOrbitPaths } from "../src/mission/geometry.js";

describe("primitives", () => {
  it("clamps", () => { expect(clamp01(-1)).toBe(0); expect(clamp01(2)).toBe(1); expect(clamp01(0.4)).toBe(0.4); });
  it("lerps", () => expect(lerp(10, 20, 0.5)).toBe(15));
  it("eases hit endpoints", () => {
    for (const e of [easeIn, easeOut, easeInOut]) { expect(e(0)).toBe(0); expect(e(1)).toBe(1); }
  });
  it("snaps to 30px grid", () => { expect(snapToGrid(31)).toBe(30); expect(snapToGrid(46)).toBe(60); expect(snapToGrid(900)).toBe(900); });
});

describe("buildOrbitPaths", () => {
  const globe = { left: 800, top: 400, width: 600, offsetWidth: 600 };
  it("fly-by (burn=0) and descent share the burn point B", () => {
    const a = buildOrbitPaths(1440, 900, 0, globe);
    const b = buildOrbitPaths(1440, 900, 1, globe);
    expect(a.B).toEqual(b.B);
  });
  it("burn=1 visible line ends at landing point L", () => {
    const r = buildOrbitPaths(1440, 900, 1, globe);
    const dEnd = r.flyD.trim().split(" ").slice(-2).map(Number);
    expect(dEnd[0]).toBeCloseTo(r.L.x, 0);
    expect(dEnd[1]).toBeCloseTo(r.L.y, 0);
  });
  it("landing point sits on the globe at EARTH_LAND_DEG/R", () => {
    const r = buildOrbitPaths(1440, 900, 0, globe);
    const dist = Math.hypot(r.L.x - r.GCx, r.L.y - r.GCy);
    expect(dist).toBeCloseTo(r.GR * 0.42, 1);
  });
});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx vitest run tests/geometry.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement src/mission/geometry.js**

Pure functions only, no DOM. `clamp01/lerp/easeIn/easeOut/easeInOut` are one-liners from `site.js:308–312`. `snapToGrid(px) = Math.round(px / GRID_PX) * GRID_PX` (GRID_PX imported from tunables, Task 4 — define `const GRID_PX = 30` locally for now and re-export). `buildOrbitPaths(W, H, burnP, globeRect)` is the port of `buildPhase4` (`site.js:246–290`): same knots A/B/P/E/M2, same control points, same `mix()` lerp by `burnP`; instead of setting attributes it **returns** `{ flyD, descD, A, B, L, GCx, GCy, GR }`. Globe constants come from `site.js:217` (`GLOBE_VBX 342, GLOBE_VBY −138, GLOBE_VB 936, GLOBE_CX 810, GLOBE_CY 330, GLOBE_R 440`).

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/geometry.test.js`
Expected: PASS (all).

- [ ] **Step 5: Commit**

```bash
git add src/mission/geometry.js tests/geometry.test.js
git commit -m "feat: pure geometry module with orbit path builder (TDD)"
```

---

### Task 4: Tunables + pin system + GSAP boot

**Files:**
- Create: `src/mission/tunables.js`, `src/mission/pins.js`, `src/mission/context.js`
- Modify: `src/main.js`, `src/styles/site.css`
- Test: `tests/pins.test.js`

- [ ] **Step 1: Create src/mission/tunables.js** — every constant from spec §5 with the prototype's doc comments (port the comment block from `site.js:146–217` wholesale):

```js
export const GRID_PX = 30;
export const APPROACH_LEAD_VH = 0.55;
export const PIN_DUR_VH = 1.2;
export const PIN_TOP_FRAC = 0.26;
export const ROCKET_Y_FRAC = 0.13, ROCKET_Y_MIN = 115;
export const ROCKET_X_FRAC = 0.44;
export const SKILLS_PIN_DUR_VH = 1.7;
export const SKILLS_PIN_TOP_FRAC = 0.07;
export const ASTRO_ABOVE_CARDS = 64;
export const ASTRO_SCALE = 1;
export const CAPSULE_X_FRAC = 0.84;
export const TOUR_END = 0.66;
export const CAP_HOLD_FRAC = 0.12;
export const ORBIT_EXIT_FRAC = 0.22;
export const LANE_OFF_FRAC = 0.095;
export const BURN_Y_FRAC = 0.27;
export const NOSE_DOWN_AT = 0.72;
export const FOOT_PIN_DUR_VH = 2.6;
export const FOOT_PIN_TOP_FRAC = 0.0;
export const LAND_FLIP_AT = 0.16, LAND_FLIP_LEN = 0.12;
export const LAND_SHRINK_START = 0.56;
export const DESC_SHRINK_END = 0.05;
export const EARTH_LAND_DEG = 256, EARTH_LAND_R = 0.42, EARTH_SPIN_DEG = 16;
export const LAUNCH_CD_VH = 0.78;        // countdown pin distance (was launchLength 1.3 × 60vh)
export const LAUNCH_TILT = 13;
// mobile overrides (Task 9) — single source so both variants stay in one file
export const MOBILE = {
  PIN_TOP_FRAC: 0.34,
  ROCKET_Y_FRAC: 0.10,
  SKILLS_PIN_TOP_FRAC: 0.04,
  ASTRO_ABOVE_CARDS: 24,
};
```

- [ ] **Step 2: Write failing pin math test** (`tests/pins.test.js`)

```js
import { describe, it, expect } from "vitest";
import { pinEnd } from "../src/mission/pins.js";
it("pin length is vh-scaled and grid-snapped", () => {
  expect(pinEnd(1.2, 900) % 30).toBe(0);
  expect(Math.abs(pinEnd(1.2, 900) - 1080)).toBeLessThanOrEqual(15);
});
```

Run: `npx vitest run tests/pins.test.js` → FAIL.

- [ ] **Step 3: Create src/mission/pins.js**

```js
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { GRID_PX } from "./tunables.js";
import { snapToGrid } from "./geometry.js";

export function pinEnd(durVH, viewportH) { return snapToGrid(durVH * viewportH); }

/* Pin a section and sync the frozen graph-paper layer (#pinGrid) while pinned.
   ScrollTrigger moves the pinned element; the page grid behind would keep
   scrolling, so we fade in a fixed grid layer phase-aligned to the page grid
   (offset = trigger.start % GRID_PX) — the prototype's proven trick. */
export function createPin({ trigger, topFrac, durVH, pinGridEl, anticipatePin = 1 }) {
  return ScrollTrigger.create({
    trigger,
    start: () => `top ${(topFrac * 100).toFixed(1)}%`,
    end: () => `+=${pinEnd(durVH, window.innerHeight)}`,
    pin: true,
    pinSpacing: true,
    anticipatePin,
    invalidateOnRefresh: true,
    onToggle(self) {
      if (!pinGridEl) return;
      pinGridEl.style.opacity = self.isActive ? "1" : "0";
      if (self.isActive) pinGridEl.style.backgroundPositionY = `${-(self.start % GRID_PX)}px`;
    },
  });
}
```

- [ ] **Step 4: Run pin test** → PASS.

- [ ] **Step 5: Create src/mission/context.js** — the shared measured-geometry cache (refreshed on `ScrollTrigger.refresh`), replacing per-frame `getBoundingClientRect` storms:

```js
export const ctx = { W: 0, H: 0, cards: [], cardsTop: 0, globe: null };
export function refreshCtx() {
  ctx.W = window.innerWidth; ctx.H = window.innerHeight;
  const cards = [...document.querySelectorAll(".skill-cat")];
  ctx.cards = cards.map((el) => { const r = el.getBoundingClientRect(); return { el, left: r.left, right: r.right, cx: r.left + r.width / 2, top: r.top }; });
  ctx.cardsTop = Math.min(...ctx.cards.map((c) => c.top), 1e9);
  const g = document.getElementById("landGlobe");
  if (g) { const r = g.getBoundingClientRect(); ctx.globe = { left: r.left, top: r.top, width: r.width, offsetWidth: g.offsetWidth || r.width }; }
}
```

(Card/globe rects are read while their sections are pinned — i.e., frozen in the viewport — which is when the phases use them; `refreshCtx` is also called from each pin's `onToggle` enter so values are exact. Mark this in a comment.)

- [ ] **Step 6: GSAP boot in src/main.js**

```js
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import MotionPathPlugin from "gsap/MotionPathPlugin";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin);
ScrollTrigger.normalizeScroll(true);
```

Remove the prototype CSS that fights ScrollTrigger pinning: in `site.css` delete the `.about-pin/.about-fix`, `.skills-pin/.skills-fix`, `.contact-pin/.contact-fix` height/position rules and their ≤920px overrides (ScrollTrigger now owns spacing) — keep the wrapper divs in the markup (they are the pin triggers). Keep `body.cw { overflow-x: clip }`.

- [ ] **Step 7: Verify in dev server** — create the three pins (About/Skills/Contact) temporarily in `main.js` with the tunable values; scroll: each section freezes for its duration, grid layer freezes with it, releases without a jump at either edge.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: tunables, ScrollTrigger pin system with frozen-grid sync, GSAP boot"
```

---

### Task 5: Phase 1 — Launch (TDD on frames, browser-verified feel)

**Files:**
- Create: `src/mission/launch.js`
- Test: `tests/launch.test.js`
- Modify: `src/main.js`

- [ ] **Step 1: Failing frame tests**

```js
import { describe, it, expect } from "vitest";
import { countdownFrame, climbFrame } from "../src/mission/launch.js";

describe("countdown", () => {
  it("steps T-3/T-2/T-1/LIFTOFF at quarters", () => {
    expect(countdownFrame(0.1).label).toBe("T–3");
    expect(countdownFrame(0.3).label).toBe("T–2");
    expect(countdownFrame(0.6).label).toBe("T–1");
    expect(countdownFrame(0.8).ignite).toBe(true);
  });
  it("pad never moves during countdown (dead-zone)", () => {
    expect(countdownFrame(0.9).stack).toEqual({ x: 0, y: 0, rot: 0 });
  });
});

describe("climb", () => {
  it("starts where the countdown ends (continuity)", () => {
    const f = climbFrame(0, { H: 900, svgH: 500 });
    expect(f.stack.x).toBe(0); expect(f.stack.y).toBe(0); expect(f.stack.rot).toBe(0);
  });
  it("clears the top by the end and leans to -13", () => {
    const f = climbFrame(1, { H: 900, svgH: 500 });
    expect(f.stack.y).toBeLessThan(-(900 * 660 / 500)); // svg-units climb clears viewport
    expect(f.stack.rot).toBeCloseTo(-13, 5);
    expect(f.padOpacity).toBe(0);
  });
});
```

Run: `npx vitest run tests/launch.test.js` → FAIL.

- [ ] **Step 2: Implement frame functions** — port `site.js:419–462`. `countdownFrame(ct)` returns `{ label, ignite, shakePx, emberScaleY, flameOpacity, tipOpacity: 1, stack: {x:0,y:0,rot:0} }` (shake `0.3 + ct*1.6` → `2.6` at ignite; ember `0.06 + ct*0.32` → flare `lerp(0.5,0.78,…)`). `climbFrame(u, {H, svgH})` returns `{ stack: { x: -lerp(0,150,easeIn(u)), y: -(H + svgH*1.2)*(660/svgH)*easeIn(u), rot: -13*easeIn(u) }, flameScaleY: 1 + u*0.2, padOpacity: clamp01(1 - u/0.08), tipOpacity: clamp01(1 - u/0.5), flameOpacity: 1 }`.

- [ ] **Step 3: Run tests** → PASS.

- [ ] **Step 4: Wire the phase** in `launch.js`:

```js
export function buildLaunch(els) {
  const cdProxy = { p: 0 }, climbProxy = { p: 0 };
  // hero pinned for the countdown
  ScrollTrigger.create({ trigger: "#top", start: "top top", end: () => `+=${Math.round(LAUNCH_CD_VH * innerHeight)}`, pin: true, anticipatePin: 1 });
  gsap.timeline({ scrollTrigger: { trigger: "#top", start: "top top", end: () => `+=${Math.round(LAUNCH_CD_VH * innerHeight)}`, scrub: 0.6 } })
    .to(cdProxy, { p: 1, ease: "none", onUpdate: () => applyCountdown(countdownFrame(cdProxy.p), els) });
  gsap.timeline({ scrollTrigger: { trigger: "#work", start: () => `top+=${-innerHeight} top`, end: "top top", scrub: 0.9 } })
    .to(climbProxy, { p: 1, ease: "none", onUpdate: () => applyClimb(climbFrame(climbProxy.p, measure(els)), els) });
}
```

`applyCountdown`/`applyClimb` set the same attributes/styles the prototype set (`stackG` transform, `--rk-shake`, `flScale` scaleY, `#flCount` innerHTML + `.liftoff` class, tip/pad opacity). The idle ember flicker stays the existing CSS animation.

- [ ] **Step 5: Browser-verify** at 1440px: first scroll never moves the pad; countdown steps with hand-lettered labels; LIFTOFF flares; climb is slow off the pad, leans to 13°, plume grows; tip fades mid-climb; smooth (no snap) when flick-scrolling. Fix feel only via tunables.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: phase 1 launch on scrub-smoothed GSAP timelines (TDD frames)"`

---

### Task 6: Phase 2 — Approach + stage separation

**Files:**
- Create: `src/mission/separation.js`
- Test: `tests/separation.test.js`
- Modify: `src/main.js`

- [ ] **Step 1: Failing continuity tests**

```js
import { describe, it, expect } from "vitest";
import { approachFrame, separationFrame, stagePoint } from "../src/mission/separation.js";
const ctx = { W: 1440, H: 900 };

it("approach decelerates into the staging point", () => {
  const end = approachFrame(1, ctx);
  expect(end.mated).toMatchObject({ x: stagePoint(ctx).x, y: stagePoint(ctx).y, rot: 90, opacity: 1 });
});
it("separation t=0 keeps both pieces exactly at the seam pose (no glitch-jump)", () => {
  const f = separationFrame(0, ctx);
  expect(f.s2).toMatchObject({ x: stagePoint(ctx).x, y: stagePoint(ctx).y, rot: 90 });
  expect(f.debris.x).toBeCloseTo(stagePoint(ctx).x, 5);
  expect(f.debris.y).toBeCloseTo(stagePoint(ctx).y, 5);
});
it("booster flame dies before second-stage ignition completes", () => {
  expect(separationFrame(0.25, ctx).boostFlame).toBeLessThan(0.5);
  expect(separationFrame(0.5, ctx).s2Flame).toBeGreaterThan(0);
});
it("second stage exits right; booster tumbles down-left and fades", () => {
  const f = separationFrame(1, ctx);
  expect(f.s2.x).toBeGreaterThan(1.3 * ctx.W);
  expect(f.debris.x).toBeLessThan(stagePoint(ctx).x);
  expect(f.debris.y).toBeGreaterThan(stagePoint(ctx).y);
  expect(f.debris.opacity).toBe(0);
});
```

Run → FAIL.

- [ ] **Step 2: Implement** — port `site.js:469–504`. `stagePoint(ctx) = { x: ROCKET_X_FRAC*W, y: Math.max(ROCKET_Y_FRAC*H, ROCKET_Y_MIN) }`. `approachFrame(t, ctx)`: easeOut lerp from off-left `(-0.34W, stageY + 0.07H)` to the stage point, rot 90, matedFlame 1. `separationFrame(t, ctx)`: `partEnd 0.50`; first half — s2 holds, debris slides back/down (`x − easeIn(dt)*0.10W`, `y + easeIn(dt)*0.16H`, `rot 90 + ed²*240`), boostFlame `clamp01(1 − dt*2.2)`, s2Flame `clamp01((dt−0.5)/0.4)`; second half — s2 exits to `1.34W` (easeIn), debris continues `(−0.06W, +0.40H, +200°)` fading `clamp01(1 − sv*1.1)`.

- [ ] **Step 3: Run tests** → PASS.

- [ ] **Step 4: Wire** — approach proxy timeline runs from `APPROACH_LEAD_VH` before the `#gapStage` gap to the About pin start; separation proxy timeline spans the About pin (`containerAnimation`-free; trigger `.about-pin`, start = pin start, end = pin end, scrub 0.9). Visibility contract from `site.js:397–417` (each phase shows only its cast) becomes an `onToggle` reset per phase.

- [ ] **Step 5: Browser-verify**: mated stack glides in over the tail of Work, About freezes (text + grid) for the whole event, separation is gradual, booster tumbles into About drawing the eye, s2 burns off right, About releases cleanly. Verify identical scale vs launch rocket (10–12 grid squares).

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: phase 2 approach and gradual stage separation with About pin"`

---

### Task 7: Phase 3 — Coast + spacewalk (and the astronaut-visibility fix)

**Files:**
- Create: `src/mission/spacewalk.js`
- Test: `tests/spacewalk.test.js`
- Modify: `src/main.js`, `src/styles/site.css`

- [ ] **Step 1: Failing tests**

```js
import { describe, it, expect } from "vitest";
import { coastFrame, missionFrame, capsuleHold } from "../src/mission/spacewalk.js";
const cards = [{ cx: 200, left: 150, right: 250 }, { cx: 500, left: 450, right: 550 }, { cx: 800, left: 750, right: 850 }, { cx: 1100, left: 1050, right: 1150 }];
const ctx = { W: 1440, H: 900, cards, cardsTop: 400 };

it("coast ends at the capsule hold (continuity into the tour)", () => {
  const f = coastFrame(1, ctx);
  expect(f.s2.x).toBeCloseTo(capsuleHold(ctx).x, 0);
});
it("astronaut is VISIBLE during the tour (the prototype bug)", () => {
  const f = missionFrame(0.3, ctx);
  expect(f.astro.opacity).toBe(1);
  expect(f.astro.scale).toBeGreaterThan(0);
});
it("tour enters from the capsule, reaches far-left card, then sweeps L to R", () => {
  expect(missionFrame(0.02, ctx).astro.x).toBeGreaterThan(cards[0].cx);
  const mid = missionFrame(0.33, ctx), late = missionFrame(0.6, ctx);
  expect(mid.astro.x).toBeLessThan(late.astro.x);
});
it("exactly the card under the astronaut is active", () => {
  const f = missionFrame(0.3, ctx);
  expect(f.activeCard).toBeGreaterThanOrEqual(0);
});
it("handoff ends ON the orbit lane hold (no jump into phase 4)", () => {
  const f = missionFrame(1, ctx);
  expect(f.astro.opacity).toBe(0);
  expect(f.s2.y).toBeCloseTo(0.12 * ctx.H, 0); // CAP_HOLD_FRAC
});
```

Run → FAIL.

- [ ] **Step 2: Implement** — port `site.js:506–559`. `capsuleHold(ctx) = { x: CAPSULE_X_FRAC*W, y: CAP_HOLD_FRAC*H }`. `coastFrame`: easeOut from off-right `1.35W` to the hold, rot `198 + sin(t·2π)·4`. `missionFrame(t, ctx)`: tour (t < TOUR_END) — lead-in 18% capsule→cards[0], then easeInOut sweep cards[0]→cards[n−1]; bob `sin(t·7π)·7`, roll `sin(t·6π)·5 − 4`, dip +12px over active card (hit-test `cx within [left−8, right+8]`); tether endpoints + sag mid-point as in `site.js:540–541`; handoff (t ≥ TOUR_END) — astronaut returns toward capsule and fades (`1 − ht·1.6`), ship eases onto the lane at hold height, orbit-line opacity ramps `ht·0.55`. Return `{ astro, s2, tetherD, activeCard, orbitOpacity }`.

- [ ] **Step 3: Run tests** → PASS.

- [ ] **Step 4: Wire + fix visibility for real.** Skills pin via `createPin` (1.7vh, top 0.07); mission proxy timeline spans the pin; applier toggles `.sk-active`, sets tether `d` and draws it on first appearance with DrawSVG (`gsap.fromTo(tether, {drawSVG:"0%"}, {drawSVG:"100%", duration:0.6})` once per pin entry). The prototype bug ("not showing the space walk guy at all"): the applier must both `fade()` AND ensure the `.fl-obj` has nonzero placed size — `sizeRocketParts()` never sized `#flAstro`; size it explicitly (width = launch width × 660/600 × ASTRO_SCALE) in `sizeRocketParts` and assert in dev: `getComputedStyle(astro).width !== "0px"`.

- [ ] **Step 5: Browser-verify**: capsule re-enters from the right after separation; Skills freezes; astronaut visibly crosses R→L then tours L→R, cards lighting in order; tether sags and tracks; handoff leaves the ship sitting on the drawn-in lane. **Astronaut visibly rendered is the acceptance bar.**

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: phase 3 spacewalk with tethered card tour; fix astronaut sizing/visibility"`

---

### Task 8: Phase 4 — Orbit, burn, landing, done state

**Files:**
- Create: `src/mission/landing.js`
- Test: `tests/landing.test.js`
- Modify: `src/main.js`

- [ ] **Step 1: Failing tests** (geometry continuity; path-riding itself is browser-verified)

```js
import { describe, it, expect } from "vitest";
import { landingBeats } from "../src/mission/landing.js";

it("beat boundaries are ordered and within the pin", () => {
  const b = landingBeats();
  expect(b.flipStart).toBeCloseTo(0.16, 5);
  expect(b.flipEnd).toBeCloseTo(0.28, 5);
  expect(b.flipEnd).toBeLessThan(b.shrinkStart);
  expect(b.shrinkStart).toBeCloseTo(0.56, 5);
});
it("burn progress maps 0→1 across the flip window only", () => {
  const b = landingBeats();
  expect(b.burnP(0.15)).toBe(0);
  expect(b.burnP(0.22)).toBeGreaterThan(0); expect(b.burnP(0.22)).toBeLessThan(1);
  expect(b.burnP(0.3)).toBe(1);
});
it("flame pulses only during the burn", () => {
  const b = landingBeats();
  expect(b.flame(0.10)).toBe(0);
  expect(b.flame(0.22)).toBeGreaterThan(0);
  expect(b.flame(0.4)).toBe(0);
});
```

Run → FAIL.

- [ ] **Step 2: Implement** — `landingBeats()` exposes the beat math from `site.js:576–619` as pure helpers (`burnP(t)`, `flame(t) = sin(burnP·π)` inside the window, `noseRot(dte)` blending +180° → 0 from `NOSE_DOWN_AT`, `shrink(t)` lerp 1→0.05 from `LAND_SHRINK_START`, ship opacity pop-out `clamp01((0.985−t)/0.05)`, globe rotation `EARTH_SPIN_DEG·easeInOut(t)`, glow opacity `clamp01((shrink−0.5)/0.35)`). The orbit/descent **position** sampling stays in the phase module using live `<path>` elements: port `ptAt`/`ptAtY` (`site.js:293–306`) verbatim — they operate on `getTotalLength/getPointAtLength` and need a real path; in the applier, set `#flOrbitFly`/`#flOrbitDesc` `d` from `buildOrbitPaths(W, H, burnP, ctx.globe)` each frame of the landing pin (cheap — one string build), then sample.

- [ ] **Step 3: Run tests** → PASS.

- [ ] **Step 4: Wire**: orbit proxy timeline (unpinned, Skills-pin-end → Contact-pin-start; ship rides `ptAtY` from CAP_HOLD to ORBIT_EXIT heights, prograde, engines cold, sine wander ±5px, lane opacity 0.55). Contact pin via `createPin` (2.6vh, top 0); landing proxy timeline across it implementing the four beats (coast→branch / hold+flip retrograde+flame pulse+line reshape / engine-first descent with nose-down blend / arrive+shrink+orange dot r7 + globe +16°). Done state: `onLeave` of the landing trigger pegs the final pose (line ghost at 0.2, globe rotated, dot lit) — and the Contact pin's `end` extends `+=1px` so "done" simply holds the last frame (the section stays pinned at page bottom; footer sits below).

- [ ] **Step 5: Browser-verify** the user's locked requirements: ONE line that visibly reshapes at the burn (never a second line appearing), realistic concave-toward-planet fly-by before the burn, retro flip with one short punchy flame, engine-first then nose-down, globe rotating the Pacific coast under the ship, dot persisting off northern California, ghost trace lingering.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: phase 4 orbit, retro-burn line reshape, landing, pegged done state"`

---

### Task 9: Mobile choreography (≤768px)

**Files:**
- Modify: `src/main.js`, `src/mission/spacewalk.js`, `src/styles/site.css`
- Test: `tests/spacewalk.test.js` (vertical-tour cases)

- [ ] **Step 1: Failing test for the vertical tour**

```js
it("mobile tour sweeps top→bottom down the stacked column", () => {
  const mctx = { W: 390, H: 844, vertical: true, cards: [
    { cx: 195, cy: 300, top: 260, bottom: 340, left: 20, right: 370 },
    { cx: 195, cy: 560, top: 520, bottom: 600, left: 20, right: 370 },
    { cx: 195, cy: 820, top: 780, bottom: 860, left: 20, right: 370 },
  ], cardsTop: 260 };
  const early = missionFrame(0.25, mctx), late = missionFrame(0.6, mctx);
  expect(late.astro.y).toBeGreaterThan(early.astro.y);     // descending
  expect(Math.abs(late.astro.x - early.astro.x)).toBeLessThan(80); // hugging the column
});
```

Run → FAIL.

- [ ] **Step 2: Implement variant** — in `missionFrame`, when `ctx.vertical`: tour path = capsule (top-right) → first card's right margin, then sweep down card centers `cy[0]→cy[n−1]` (x holds at column edge + bob), active card = `astro.y within [top−8, bottom+8]`, dip becomes a 12px x-nudge toward the card; tether still reaches to the capsule hold (top-right). Run tests → PASS (desktop cases must still pass).

- [ ] **Step 3: Build phases under `gsap.matchMedia()`**:

```js
const mm = gsap.matchMedia();
mm.add({ desktop: "(min-width: 769px)", mobile: "(max-width: 768px)", reduce: "(prefers-reduced-motion: reduce)" },
  ({ conditions: c }) => {
    if (c.reduce) { document.getElementById("flight").style.display = "none"; return; }
    const t = c.mobile ? { ...TUNABLES, ...MOBILE } : TUNABLES;
    buildLaunch(els, t); buildSeparation(els, t); buildSpacewalk(els, { ...t, vertical: c.mobile }); buildLanding(els, t);
    return () => ScrollTrigger.getAll().forEach((s) => s.kill());
  });
```

(Refactor the tunables import into a `TUNABLES` object export so overrides spread cleanly; keep named exports for tests.)

- [ ] **Step 4: Mobile CSS** — in `site.css` ≤920px block: delete `.flight { display: none; }` and `.land-globe { display: none; }`; add `.land-globe { width: clamp(300px, 78vw, 440px); right: -16%; bottom: -10%; }`, scale `.fl-count` lettering (`font-size: clamp(44px, 14vw, 72px)`), and hide colliding `.ann` annotations under 768px.

- [ ] **Step 5: Browser-verify at 390×844** (dev server, device emulation): full mission plays — launch (rocket ≈40vw), horizontal separation in the clear band, vertical spacewalk down the stacked cards, landing on the restored globe down the right edge. Flick-scroll momentum lands mid-phase gracefully; no horizontal overflow anywhere.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: full mission on mobile — matchMedia variants, vertical spacewalk, restored globe"`

---

### Task 10: Projects detail overlay

**Files:**
- Create: `src/data/projects.js`, `src/ui/projects-modal.js`
- Test: `tests/projects-modal.test.js` (jsdom)
- Modify: `src/main.js`, `src/styles/site.css`, `index.html`

- [ ] **Step 1: Create src/data/projects.js** — one entry per card, slugs matching `data-project`; copy = existing card copy expanded; THIS file is Camron's edit point:

```js
export const PROJECTS = {
  "nauvoo-vc": {
    name: "Nauvoo Temple Visitors' Center",
    role: "Superintendent · APM", eyebrow: "Religious · New Construction",
    stats: [["Size", "20,200 sf"], ["Years", "2024–26"], ["Where", "Nauvoo, IL"]],
    paragraphs: [
      "Ground-up visitors' center across from the Nauvoo Temple — led field execution under Westland founder Stan Houghton toward a public opening in mid-2026.",
      "Managed daily schedule, QC, and owner-inspection coordination through the finish phases.",
    ],
    links: [["Read coverage", "https://www.wgem.com/2025/07/21/nauvoo-temple-visitors-center-slated-mid-2026-completion/"]],
    photos: [],
  },
  // …same shape for: toronto, mountain-ridge, st-george, young-home, brooklyn-bowl
  // (paragraphs = card desc + the matching experience-timeline note; links [] when none)
};
```

- [ ] **Step 2: Failing jsdom tests**

```js
// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { openProject, closeProject } from "../src/ui/projects-modal.js";

beforeEach(() => { document.body.innerHTML = '<div id="modalRoot"></div>'; });

it("opens with project content and locks scroll", () => {
  openProject("nauvoo-vc");
  expect(document.querySelector(".pmodal")).toBeTruthy();
  expect(document.querySelector(".pmodal h3").textContent).toMatch(/Nauvoo/);
  expect(document.body.style.overflow).toBe("hidden");
});
it("closes on Escape and restores scroll", () => {
  openProject("toronto");
  document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  closeProject.flushForTests?.();
  expect(document.querySelector(".pmodal")).toBeFalsy();
  expect(document.body.style.overflow).toBe("");
});
it("unknown slug is a no-op", () => {
  openProject("nope");
  expect(document.querySelector(".pmodal")).toBeFalsy();
});
```

Run → FAIL.

- [ ] **Step 3: Implement src/ui/projects-modal.js** — builds the modal DOM from `PROJECTS[slug]` into `#modalRoot` (add `<div id="modalRoot"></div>` before `</body>`); paper-card styling, sketch border, role chip, stats row, paragraphs, links, `photos coming soon` hand-note when `photos` empty; backdrop click + X + Escape close; focus trap (loop Tab within modal, return focus to the opener); `body{overflow:hidden}` lock; GSAP open (scale 0.92→1 + fade, 0.35s `power2.out`) and close (reverse, then remove — expose `flushForTests` to skip the tween in jsdom). Mobile ≤768px: modal becomes a full-screen sheet (`inset:0`, slide-up from `y:24`). Wire card clicks in `main.js`: cards with `data-project` get `role="button"`, `tabindex="0"`, Enter/Space handling, `cursor:pointer`; the Nauvoo card's outer `<a>` wrapper is replaced by a `<div class="proj-card" data-project="nauvoo-vc">` (its press link lives in the modal now).

- [ ] **Step 4: Run tests** → PASS. Browser-verify both viewports + keyboard-only operation.

- [ ] **Step 5 (P1, skip if time-boxed): Deep links** — on open, `history.replaceState(null, "", "#project=" + slug)`; on close, restore `#work`; on page load, `location.hash.match(/^#project=(.+)/)` → `openProject(m[1])` after boot. Verify a shared link opens the modal directly.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: projects detail overlay with data-file content model"`

---

### Task 11: Resume PDF + paper-airplane download + contact reveal

**Files:**
- Create: `public/assets/Camron-Walker-Resume.pdf`, `src/fx/plane.js`, `src/ui/contact.js`
- Modify: `index.html`, `src/main.js`

- [ ] **Step 1: Convert docx → PDF via Word COM**

```powershell
$word = New-Object -ComObject Word.Application; $word.Visible = $false
$doc = $word.Documents.Open("C:\Users\camron\code\homepage\public\assets\Camron-Walker-Resume.docx")
$doc.SaveAs([ref] "C:\Users\camron\code\homepage\public\assets\Camron-Walker-Resume.pdf", [ref] 17)
$doc.Close(); $word.Quit()
```

Expected: PDF exists, opens, one–two pages. (Fallback if no Word: use the anthropic-skills:docx conversion path.) Update both `.js-dl` anchors in `index.html` to `href="assets/Camron-Walker-Resume.pdf" data-fname="Camron-Walker-Resume.pdf"`. Keep the .docx out of `dist` by deleting it from `public/` after conversion.

- [ ] **Step 2: Create src/fx/plane.js** — port `site.js:723–848` with one upgrade: replace the WAAPI `offset-path` ride with GSAP MotionPath (`gsap.to(plane, { motionPath: { path: d, autoRotate: true }, duration: 2.5, ease: "power2.inOut" })`), keep `buildFlightPath` (wave → loop-the-loop → climb to top-right) exactly, keep dashed path fade-in before flight + fade-out on arrival, badge show/hide, mid-flight download trigger at 1.5s, and the reduced-motion direct-download branch.

- [ ] **Step 3: Create src/ui/contact.js** — port `site.js:713–720` verbatim (char-code assembly for email/phone, mailto/tel wiring).

- [ ] **Step 4: Browser-verify**: click Download resume → dashed loop path draws, plane rides it into the top-right corner, PDF downloads mid-flight, badge shows; email/phone reveal correctly; reduced-motion downloads instantly.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: PDF resume with paper-airplane download; scraper-safe contact"`

---

### Task 12: Launch hygiene — meta, favicon, 404, robots

**Files:**
- Create: `public/favicon.svg`, `public/robots.txt`, `404.html`
- Modify: `index.html`, `vite.config.js`

- [ ] **Step 1: Favicon** — `public/favicon.svg`: the CW nav mark as standalone SVG (Space Grotesk "CW" in Camron Blue on off-white rounded square, 64×64 viewBox). Link it: `<link rel="icon" type="image/svg+xml" href="/favicon.svg">`.

- [ ] **Step 2: Meta block** in `<head>`:

```html
<link rel="canonical" href="https://camronwalker.com/">
<meta property="og:title" content="Camron Walker — Construction Project Manager & Scheduler">
<meta property="og:description" content="13 years building public schools, civic landmarks, and historic preservation projects. Scroll the mission.">
<meta property="og:url" content="https://camronwalker.com/">
<meta property="og:type" content="website">
<meta property="og:image" content="https://camronwalker.com/og.png">
<meta name="twitter:card" content="summary_large_image">
```

`public/og.png`: Playwright screenshot of the hero at 1200×630 (taken in Task 13's harness; placeholder = hero screenshot from `design-handoff/project/screenshots/01-launch.png` resized if time-boxed).

- [ ] **Step 3: 404.html** — minimal sketch-styled page (graph-paper background, Caveat "looks like this one drifted off course", tumbling booster SVG from `ROCKET_PARTS.BOOSTER`, link home). Add `rollupOptions: { input: { main: "index.html", notfound: "404.html" } }` to `vite.config.js`. `public/robots.txt`: `User-agent: *\nAllow: /`.

- [ ] **Step 4: Verify** `npm run build` → dist contains both pages, favicon, robots; `npm run preview` renders correctly.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: meta/OG, favicon, sketch 404, robots"`

---

### Task 13: Playwright mission verification suite

**Files:**
- Create: `playwright.config.js`, `tests/e2e/mission.spec.js`

- [ ] **Step 1: playwright.config.js**

```js
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  webServer: { command: "npm run dev", port: 5173, reuseExistingServer: true },
  use: { baseURL: "http://localhost:5173" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
});
```

- [ ] **Step 2: tests/e2e/mission.spec.js** — helper `scrollToPhase(page, frac)` sets `window.scrollTo(0, frac * (document.body.scrollHeight - innerHeight))` then waits for ScrollTrigger settle (`page.waitForTimeout(600)` after `requestAnimationFrame` flush). Beats asserted + screenshotted to `tests/e2e/__screenshots__/`:

```js
test("mission beats render", async ({ page }) => {
  await page.goto("/");
  const beats = [
    [0.00, "pad-idle",       async () => expect(page.locator("#flPad")).toBeVisible()],
    [0.04, "countdown",      async () => expect(page.locator("#flCount")).toHaveText(/T|LIFT/)],
    [0.16, "climb",          async () => {}],
    [0.32, "separation",     async () => expect(page.locator("#flStage2")).toBeVisible()],
    [0.52, "astronaut-tour", async () => {
      const a = page.locator("#flAstro");
      await expect(a).toBeVisible();
      const box = await a.boundingBox();
      expect(box.width).toBeGreaterThan(20);            // the visible-pixel bar: real size,
      const op = await a.evaluate((el) => getComputedStyle(el).opacity);
      expect(Number(op)).toBeGreaterThan(0.5);          // real opacity, on screen
    }],
    [0.78, "burn",           async () => expect(page.locator("#flOrbit")).toBeVisible()],
    [0.97, "landed-dot",     async () => {
      const op = await page.locator("#flGlow").evaluate((el) => getComputedStyle(el).opacity);
      expect(Number(op)).toBeGreaterThan(0.5);
    }],
  ];
  for (const [frac, name, assert] of beats) {
    await page.evaluate((f) => window.scrollTo(0, f * (document.body.scrollHeight - innerHeight)), frac);
    await page.waitForTimeout(700);
    await assert();
    await page.screenshot({ path: `tests/e2e/__screenshots__/${test.info().project.name}-${name}.png` });
  }
});

test("reduced motion hides the mission, content readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("#flight")).toBeHidden();
  await expect(page.locator("#about")).toBeVisible();
});

test("no-JS page is readable", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("http://localhost:5173/");
  await expect(page.locator(".sec-title").first()).toBeVisible();   // reveals not stuck hidden
});
```

(Beat fractions are starting points — adjust to the real page proportions once measured; assertions, not fractions, are the contract.)

- [ ] **Step 3: Run** `npx playwright test` → all pass on both projects. Review the screenshot artifacts by eye against `design-handoff/project/screenshots/`. Send the beat screenshots to Camron.

- [ ] **Step 4: Commit** — `git add -A && git commit -m "test: Playwright mission beat suite, reduced-motion and no-JS checks"`

---

### Task 14: P1 polish — pencil pass + "back to the top" finale

**Files:**
- Create: `src/fx/pencil.js`, `src/mission/finale.js`
- Test: `tests/pencil.test.js`
- Modify: `src/main.js`, `src/styles/site.css`, `index.html`

- [ ] **Step 1: Failing roughen test**

```js
import { it, expect } from "vitest";
import { roughenPathD, mulberry32 } from "../src/fx/pencil.js";
it("is deterministic for a seed and preserves command count", () => {
  const d = "M0 0 L100 0 L100 100";
  expect(roughenPathD(d, 7)).toBe(roughenPathD(d, 7));
  expect(roughenPathD(d, 7)).not.toBe(d);
  expect((roughenPathD(d, 7).match(/[ML]/g) || []).length).toBe(3);
});
it("perturbation is bounded (±1.5px)", () => {
  const out = roughenPathD("M10 10 L20 10", 1);
  const nums = out.match(/-?\d+(\.\d+)?/g).map(Number);
  expect(Math.abs(nums[0] - 10)).toBeLessThanOrEqual(1.5);
});
```

Run → FAIL.

- [ ] **Step 2: Implement src/fx/pencil.js** — `mulberry32(seed)` PRNG; `roughenPathD(d, seed)` parses absolute `M/L/C/S/Q` coordinate pairs and jitters each by `(rng()−0.5)·2·1.5`px (skip `A`/relative commands — leave them untouched); `applyPencil(root)` walks `.cw-sketch` paths once at load, seeds by index, swaps `d`. Grain: inline `<svg>` filter-based noise tile rendered once to a data-URL `<div class="paper-grain">` overlay (`position:fixed; inset:0; pointer-events:none; opacity:.035; mix-blend-mode:multiply; z-index:1`). Draw-ons: DrawSVG `from 0%` on `.ann svg path`, hero underlines, and the timeline dashes when their `.reveal` enters.

- [ ] **Step 3: Run tests** → PASS. Browser-verify taste at both viewports; each layer toggleable by a single import — if it reads as noise, ship it off (spec acceptance).

- [ ] **Step 4: Finale (src/mission/finale.js)** — hidden `<button class="fl-finale" id="flFinale">back to the top<svg>…sketch up-arrow…</svg></button>` appended to the flight layer (but `pointer-events:auto`, keyboard-focusable). When the landing pin completes (`onLeave` / glow lit), GSAP slides it up from the bottom (Caveat, countdown-scale). Click → `gsap.to(window, { scrollTo: 0 })` (register ScrollToPlugin) — the mission re-arms naturally since all phases are scroll-derived. Verify; check it never overlaps the contact card on mobile.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: pencil-look pass and hand-lettered back-to-the-top finale"`

---

### Task 15: Deploy to Cloudflare Pages

**Files:**
- Create: GitHub remote; Cloudflare Pages project (Camron's dashboard step)

- [ ] **Step 1: Final pre-flight** — `npm run test && npx playwright test && npm run build`; check `dist/` bundle size (`Get-ChildItem dist -Recurse | Measure-Object Length -Sum`) against the ~150KB-gz JS budget (run `npx vite build --mode production` output table; gzip column).

- [ ] **Step 2: Push to GitHub**

```powershell
gh repo create homepage --private --source . --push
```

Expected: repo created under Camron's account, `main` pushed. (If `gh` is unauthenticated: `gh auth login` is a Camron step.)

- [ ] **Step 3: Connect Cloudflare Pages (NEEDS CAMRON, ~5 min)** — dashboard → Workers & Pages → Create → Pages → Connect to Git → select `homepage` repo → build command `npm run build`, output `dist` → deploy → add custom domain `camronwalker.com` (DNS already on Cloudflare; one click). Alternative if he prefers CLI: `npx wrangler pages deploy dist --project-name camronwalker` after `npx wrangler login`.

- [ ] **Step 4: Verify live** — open `https://camronwalker.com` (or the `*.pages.dev` URL while DNS propagates): full scroll-through on desktop + a real phone; resume downloads; modal opens; OG preview via a link-checker.

- [ ] **Step 5: Tag** — `git tag v1.0.0 && git push --tags`

---

## Self-review (run after writing, fixed inline)

1. **Spec coverage:** §3 architecture→T1/T4; §4 carried by static port T2; §5 phases→T5–T8 incl. finale T14; §6 mobile→T9; §7 reduced/no-JS→T2/T9/T13; §8 pencil→T14; §9 modal→T10; §10 content/cleanup→T2/T11/T12; §11 perf→T15 pre-flight; §12 verification→T13 + dev server T1; §13 P0=T1–T13,T15 / P1=T14 (T14 can be skipped for ship and done after — no other task depends on it); §15 Camron steps→T15.
2. **Placeholder scan:** "port lines N–M" references point at exact committed files/lines (allowed — code exists in-repo); no TBDs.
3. **Type consistency:** `*Frame(t, ctx)` signatures, `ctx` shape (`W,H,cards,cardsTop,globe,vertical`), `stagePoint/capsuleHold` helpers, and tunable names match across Tasks 3–9.
