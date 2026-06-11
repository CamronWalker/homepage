import ScrollTrigger from "gsap/ScrollTrigger";
import { GRID_PX } from "./tunables.js";
import { snapToGrid } from "./geometry.js";

export function pinEnd(durVH, viewportH) { return snapToGrid(durVH * viewportH); }

/* Pin a section and sync the frozen graph-paper layer (#pinGrid) while pinned.
   ScrollTrigger holds the pinned element in place, but the page's own grid
   background would keep scrolling behind it — so a fixed grid layer fades in,
   phase-aligned to the page grid (offset = trigger start % GRID_PX). Pin
   durations are snapped to whole grid squares, so the layer hands back to the
   page grid with no visible jump (the prototype's proven trick). */
export function createPin({ trigger, topFrac, durVH, pinGridEl, onToggle, anticipatePin = 1 }) {
  return ScrollTrigger.create({
    trigger,
    start: () => `top ${(topFrac * 100).toFixed(1)}%`,
    end: () => `+=${pinEnd(durVH, window.innerHeight)}`,
    pin: true,
    pinSpacing: true,
    anticipatePin,
    invalidateOnRefresh: true,
    onToggle(self) {
      if (pinGridEl) {
        pinGridEl.style.opacity = self.isActive ? "1" : "0";
        if (self.isActive) pinGridEl.style.backgroundPositionY = `${-(self.start % GRID_PX)}px`;
      }
      if (onToggle) onToggle(self);
    },
  });
}
