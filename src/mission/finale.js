import ScrollTrigger from "gsap/ScrollTrigger";
import { pinEnd } from "./pins.js";

/* ── FINALE · "back to the top" ───────────────────────────────────────────
   Once the ship has shrunk into the landing dot, a hand-lettered note rises
   from the bottom in the countdown style (the chat-4 design beat that never
   made it into the prototype). Clicking it rewinds smoothly to the pad —
   every phase is scroll-derived, so the mission re-arms by itself.         */

export function buildFinale(t) {
  const btn = document.getElementById("flFinale");
  if (!btn) return;
  ScrollTrigger.create({
    trigger: ".contact-pin",
    start: () => `top+=${Math.round(pinEnd(t.FOOT_PIN_DUR_VH, window.innerHeight) * 0.96)} ${(t.FOOT_PIN_TOP_FRAC * 100).toFixed(1)}%`,
    end: "max",
    invalidateOnRefresh: true,
    onEnter: () => btn.classList.add("show"),
    onLeaveBack: () => btn.classList.remove("show"),
  });
  btn.addEventListener("click", () => {
    btn.classList.remove("show");
    window.scrollTo({ top: 0, behavior: "smooth" });   // the whole mission rewinds
  });
}
