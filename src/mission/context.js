/* Shared measured geometry for the phase frame functions. Refreshed on
   ScrollTrigger.refresh and on pin entry — card and globe rects are read while
   their sections are pinned (frozen in the viewport), which is exactly when the
   phases use them, so the cached values are viewport-exact. */
export const ctx = { W: 0, H: 0, cards: [], cardsTop: 0, globe: null, vertical: false };

export function refreshCtx() {
  ctx.W = window.innerWidth;
  ctx.H = window.innerHeight;
  const cards = [...document.querySelectorAll(".skill-cat")];
  ctx.cards = cards.map((el) => {
    const r = el.getBoundingClientRect();
    return { el, left: r.left, right: r.right, top: r.top, bottom: r.bottom,
             cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  });
  ctx.cardsTop = ctx.cards.length ? Math.min(...ctx.cards.map((c) => c.top)) : 0.4 * ctx.H;
  const g = document.getElementById("landGlobe");
  if (g) {
    const r = g.getBoundingClientRect();
    ctx.globe = { left: r.left, top: r.top, width: r.width, offsetWidth: g.offsetWidth || r.width };
  }
}
