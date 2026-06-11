/* Three hero directions for camronwalker.com — injected as raw HTML into the
   design canvas. Self-contained: each includes a scoped <style> block.
   Shared tokens come from camron.css. */

const NAV = `
<header class="hx-nav">
  <a class="hx-brand" href="#">
    <span class="hx-mark">CW</span>
    <span class="hx-brandname">Camron Walker</span>
  </a>
  <nav class="hx-links">
    <a href="#">Work</a>
    <a href="#">About</a>
    <a href="#">Skills</a>
    <a href="#" class="hx-navcta">Contact</a>
  </nav>
</header>`;

/* tiny graphite rocket doodle — pointing up, origin top-left of its box */
const ROCKET = (cls) => `
<svg class="${cls}" width="120" height="180" viewBox="0 0 120 180" fill="none">
  <path class="cw-sketch" d="M60 12 C40 38 34 78 34 112 L86 112 C86 78 80 38 60 12 Z"/>
  <circle class="cw-sketch cw-sketch--blue" cx="60" cy="70" r="13"/>
  <path class="cw-sketch" d="M34 104 C20 112 14 132 16 150 C30 140 34 126 36 116"/>
  <path class="cw-sketch" d="M86 104 C100 112 106 132 104 150 C90 140 86 126 84 116"/>
  <path class="cw-sketch" d="M44 112 L76 112 L70 134 L50 134 Z"/>
  <path class="cw-sketch cw-sketch--blue cw-sketch--thin" d="M52 140 C50 152 50 160 56 172 M60 140 C60 154 60 162 60 176 M68 140 C70 152 70 160 64 172"/>
</svg>`;

/* paper airplane group, points to the right, drawn around (0,0) */
const PLANE_G = `
<g>
  <path d="M18 0 L-15 -11 L-5 0 L-15 11 Z" fill="#fff" stroke="#44484E" stroke-width="2" stroke-linejoin="round"/>
  <path d="M18 0 L-5 0 M-5 0 L-15 11" stroke="#44484E" stroke-width="2" fill="none" stroke-linecap="round"/>
</g>`;

/* ===================== DIRECTION A — FLIGHT PATH ===================== */
const HERO_A = `
<style>
  .hxA{position:relative;width:1280px;height:800px;background:var(--cw-paper);overflow:hidden;font-family:var(--cw-body);}
  .hxA .hx-nav{position:relative;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:30px 64px;}
  .hxA .hx-brand{display:flex;align-items:center;gap:12px;text-decoration:none;}
  .hxA .hx-mark{display:grid;place-items:center;width:38px;height:38px;border:2px solid var(--cw-ink);border-radius:5px;font-family:var(--cw-display);font-weight:700;color:var(--cw-ink);font-size:15px;letter-spacing:.02em;}
  .hxA .hx-brandname{font-family:var(--cw-display);font-weight:600;color:var(--cw-ink);font-size:17px;}
  .hxA .hx-links{display:flex;align-items:center;gap:30px;}
  .hxA .hx-links a{font-family:var(--cw-display);font-weight:500;font-size:15px;color:var(--cw-graphite);text-decoration:none;}
  .hxA .hx-navcta{color:var(--cw-blue-ink)!important;border-bottom:2px solid var(--cw-blue);}
  .hxA .body{position:relative;z-index:2;max-width:640px;padding:70px 64px 0;}
  .hxA .eb{display:flex;align-items:center;gap:10px;margin-bottom:22px;}
  .hxA h1{font-family:var(--cw-display);font-weight:700;color:var(--cw-ink);font-size:88px;line-height:.95;letter-spacing:-.025em;margin:0;}
  .hxA .lead{font-size:21px;line-height:1.5;color:var(--cw-graphite);max-width:520px;margin:26px 0 0;}
  .hxA .actions{display:flex;gap:14px;margin-top:38px;}
  .hxA .note{position:absolute;font-family:var(--cw-hand);color:var(--cw-blue);font-size:27px;transform:rotate(-7deg);}
  .hxA .flightsvg{position:absolute;inset:0;width:1280px;height:800px;z-index:1;pointer-events:none;}
  .hxA .plane{animation:none;}
  .hxA .rk{position:absolute;right:70px;bottom:30px;z-index:1;opacity:.5;transform:rotate(14deg);}
</style>
<div class="hxA cw">
  ${NAV}
  <svg class="flightsvg" viewBox="0 0 1280 800" fill="none">
    <path class="cw-flight" d="M150,690 C 420,600 540,330 770,320 S 1010,250 1160,150">
      <animate attributeName="stroke-dashoffset" from="160" to="0" dur="6s" repeatCount="indefinite"/>
    </path>
    <g class="plane">
      ${PLANE_G}
      <animateMotion dur="5s" repeatCount="indefinite" rotate="auto" keyPoints="0;1;1" keyTimes="0;0.7;1" calcMode="spline" keySplines="0.4 0 0.2 1;0 0 1 1" path="M150,690 C 420,600 540,330 770,320 S 1010,250 1160,150"/>
    </g>
  </svg>
  <div class="body">
    <div class="eb"><span class="cw-eyebrow">Construction Professional</span></div>
    <h1>Camron<br>Walker</h1>
    <p class="lead">A construction project manager who runs the schedule, the budget, and the build — from $76M schools to historic temple renovations across North America.</p>
    <div class="actions">
      <a class="cw-btn" href="#">View selected work</a>
      <a class="cw-btn cw-btn--ghost" href="#">Download résumé</a>
    </div>
  </div>
  <div class="note" style="left:560px;top:300px;">13 years, on schedule ✈</div>
  ${ROCKET('rk')}
</div>`;

/* ===================== DIRECTION B — BLUEPRINT MARGIN ===================== */
const HERO_B = `
<style>
  .hxB{position:relative;width:1280px;height:800px;overflow:hidden;font-family:var(--cw-body);
    background-color:var(--cw-paper);
    background-image:linear-gradient(var(--cw-line-soft) 1px,transparent 1px),linear-gradient(90deg,var(--cw-line-soft) 1px,transparent 1px);
    background-size:28px 28px;}
  .hxB .hx-nav{position:relative;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:30px 64px;}
  .hxB .hx-brand{display:flex;align-items:center;gap:12px;text-decoration:none;}
  .hxB .hx-mark{display:grid;place-items:center;width:38px;height:38px;background:var(--cw-blue);border-radius:5px;font-family:var(--cw-display);font-weight:700;color:#fff;font-size:15px;}
  .hxB .hx-brandname{font-family:var(--cw-display);font-weight:600;color:var(--cw-ink);font-size:17px;}
  .hxB .hx-links{display:flex;align-items:center;gap:30px;}
  .hxB .hx-links a{font-family:var(--cw-display);font-weight:500;font-size:15px;color:var(--cw-graphite);text-decoration:none;}
  .hxB .hx-navcta{color:var(--cw-blue-ink)!important;}
  .hxB .stage{position:relative;z-index:2;padding:64px 64px 0;max-width:780px;}
  .hxB h1{font-family:var(--cw-display);font-weight:700;color:var(--cw-ink);font-size:96px;line-height:.92;letter-spacing:-.03em;margin:0;}
  .hxB .lead{font-size:21px;line-height:1.5;color:var(--cw-graphite);max-width:500px;margin:28px 0 0;}
  .hxB .actions{display:flex;gap:14px;margin-top:36px;}
  .hxB .ann{position:absolute;z-index:4;font-family:var(--cw-hand);color:var(--cw-blue);font-size:30px;line-height:1.05;}
  .hxB .ann svg{position:absolute;overflow:visible;}
  .hxB .rocketwrap{position:absolute;right:96px;top:120px;z-index:2;}
</style>
<div class="hxB cw">
  ${NAV}
  <div class="stage">
    <h1>Camron<br>Walker</h1>
    <p class="lead">Project manager &amp; scheduler. I plan the work, then build it — public schools, civic landmarks, and historic preservation.</p>
    <div class="actions">
      <a class="cw-btn" href="#">View selected work</a>
      <a class="cw-btn cw-btn--ghost" href="#">Download résumé</a>
    </div>
  </div>

  <!-- handwritten margin annotations -->
  <div class="ann" style="left:470px;top:150px;transform:rotate(-5deg);">
    13 years building
    <svg width="90" height="60" style="left:-30px;top:30px;"><path class="cw-sketch cw-sketch--blue cw-sketch--thin" d="M70 6 C40 6 14 24 6 52" marker-end=""/><path class="cw-sketch cw-sketch--blue cw-sketch--thin" d="M6 52 L4 38 M6 52 L20 50"/></svg>
  </div>
  <div class="ann" style="left:520px;top:430px;transform:rotate(3deg);">
    $76M / 350k sf school
    <svg width="130" height="70" style="left:-110px;top:6px;"><path class="cw-sketch cw-sketch--blue cw-sketch--thin" d="M120 12 C70 14 30 30 8 56"/><path class="cw-sketch cw-sketch--blue cw-sketch--thin" d="M8 56 L8 40 M8 56 L24 52"/></svg>
  </div>
  <div class="ann" style="left:835px;top:560px;transform:rotate(-3deg);">
    Boulder City kid
    <svg width="110" height="80" style="left:-10px;top:-56px;"><path class="cw-sketch cw-sketch--blue cw-sketch--thin" d="M16 64 C8 36 30 14 70 8"/><path class="cw-sketch cw-sketch--blue cw-sketch--thin" d="M16 64 L10 50 M16 64 L30 60"/></svg>
  </div>

  <!-- rocket launching with dashed trajectory -->
  <div class="rocketwrap">
    <svg width="320" height="560" viewBox="0 0 320 560" fill="none">
      <path class="cw-flight" d="M120,540 C 150,430 250,360 210,250 S 250,120 250,40">
        <animate attributeName="stroke-dashoffset" from="0" to="-160" dur="5s" repeatCount="indefinite"/>
      </path>
      <g>
        <path class="cw-sketch" d="M236 36 C214 60 208 100 210 132 L262 132 C264 100 258 60 236 36 Z"/>
        <circle class="cw-sketch cw-sketch--blue" cx="236" cy="86" r="13"/>
        <path class="cw-sketch" d="M210 124 C194 132 188 154 192 172 C208 160 210 146 212 136"/>
        <path class="cw-sketch" d="M262 124 C278 132 284 154 280 172 C264 160 262 146 260 136"/>
        <path class="cw-sketch cw-sketch--blue cw-sketch--thin" d="M226 160 C224 174 224 182 230 196 M236 160 C236 176 236 184 236 200 M246 160 C248 174 248 182 242 196"/>
        <animateTransform attributeName="transform" type="translate" values="0,12; 0,-6; 0,12" dur="3.4s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1"/>
      </g>
    </svg>
  </div>
</div>`;

/* ===================== DIRECTION C — EDITORIAL SPLIT ===================== */
const HERO_C = `
<style>
  .hxC{position:relative;width:1280px;height:800px;overflow:hidden;font-family:var(--cw-body);background:var(--cw-paper);}
  .hxC .hx-nav{position:relative;z-index:3;display:flex;align-items:center;justify-content:space-between;padding:30px 64px;border-bottom:1px solid var(--cw-line);}
  .hxC .hx-brand{display:flex;align-items:center;gap:12px;text-decoration:none;}
  .hxC .hx-mark{display:grid;place-items:center;width:38px;height:38px;border:2px solid var(--cw-ink);border-radius:5px;font-family:var(--cw-display);font-weight:700;color:var(--cw-ink);font-size:15px;}
  .hxC .hx-brandname{font-family:var(--cw-display);font-weight:600;color:var(--cw-ink);font-size:17px;}
  .hxC .hx-links{display:flex;align-items:center;gap:30px;}
  .hxC .hx-links a{font-family:var(--cw-display);font-weight:500;font-size:15px;color:var(--cw-graphite);text-decoration:none;}
  .hxC .hx-navcta{color:var(--cw-blue-ink)!important;border-bottom:2px solid var(--cw-blue);}
  .hxC .grid{display:grid;grid-template-columns:1fr 1fr;height:calc(800px - 99px);}
  .hxC .left{padding:64px;display:flex;flex-direction:column;justify-content:center;}
  .hxC .eb{margin-bottom:20px;}
  .hxC h1{font-family:var(--cw-display);font-weight:700;color:var(--cw-ink);font-size:104px;line-height:.9;letter-spacing:-.035em;margin:0;}
  .hxC .role{font-family:var(--cw-mono);font-size:15px;letter-spacing:.04em;color:var(--cw-graphite-2);margin:24px 0 0;}
  .hxC .tags{display:flex;flex-wrap:wrap;gap:8px;margin:30px 0 0;}
  .hxC .tag{font-family:var(--cw-display);font-weight:500;font-size:13px;color:var(--cw-graphite);border:1px solid var(--cw-line);border-radius:3px;padding:6px 11px;}
  .hxC .actions{display:flex;gap:14px;margin-top:38px;}
  .hxC .right{position:relative;background:var(--cw-paper-2);border-left:1px solid var(--cw-line);overflow:hidden;}
  .hxC .drafting{position:absolute;inset:0;background-image:linear-gradient(var(--cw-line-soft) 1px,transparent 1px),linear-gradient(90deg,var(--cw-line-soft) 1px,transparent 1px);background-size:24px 24px;opacity:.8;}
  .hxC .stat{position:absolute;left:48px;bottom:44px;z-index:3;}
  .hxC .statnum{font-family:var(--cw-display);font-weight:700;font-size:54px;color:var(--cw-ink);line-height:1;}
  .hxC .statlbl{font-family:var(--cw-mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--cw-graphite-2);margin-top:8px;}
  .hxC .blueword{color:var(--cw-blue);}
</style>
<div class="hxC cw">
  ${NAV}
  <div class="grid">
    <div class="left">
      <div class="eb"><span class="cw-eyebrow">Construction Professional</span></div>
      <h1>Camron<br>Walker</h1>
      <p class="role">Project Manager · Scheduler · Builder of public places</p>
      <div class="tags">
        <span class="tag">K–12 Schools</span>
        <span class="tag">Historic Preservation</span>
        <span class="tag">Primavera P6</span>
        <span class="tag">Procore</span>
        <span class="tag">Power BI</span>
      </div>
      <div class="actions">
        <a class="cw-btn" href="#">View selected work</a>
        <a class="cw-btn cw-btn--ghost" href="#">Download résumé</a>
      </div>
    </div>
    <div class="right">
      <div class="drafting"></div>
      <svg width="100%" height="100%" viewBox="0 0 640 700" preserveAspectRatio="xMidYMid meet" fill="none" style="position:relative;z-index:2;">
        <!-- building elevation sketch (civic facade) -->
        <path class="cw-sketch" d="M120 470 L120 300 L320 180 L520 300 L520 470 Z"/>
        <path class="cw-sketch" d="M120 300 L320 180 L520 300"/>
        <line class="cw-sketch cw-sketch--thin" x1="120" y1="470" x2="520" y2="470"/>
        <rect class="cw-sketch cw-sketch--thin" x="160" y="340" width="44" height="60"/>
        <rect class="cw-sketch cw-sketch--thin" x="232" y="340" width="44" height="60"/>
        <rect class="cw-sketch cw-sketch--blue" x="298" y="320" width="44" height="80"/>
        <rect class="cw-sketch cw-sketch--thin" x="364" y="340" width="44" height="60"/>
        <rect class="cw-sketch cw-sketch--thin" x="436" y="340" width="44" height="60"/>
        <line class="cw-sketch cw-sketch--thin" x1="90" y1="470" x2="550" y2="470"/>
        <!-- dashed flight loop + paper airplane -->
        <path class="cw-flight" d="M70,150 C 240,60 430,90 540,170 C 600,215 520,270 440,235 C 380,210 420,150 470,170">
          <animate attributeName="stroke-dashoffset" from="200" to="0" dur="7s" repeatCount="indefinite"/>
        </path>
        <g>
          ${PLANE_G}
          <animateMotion dur="6s" repeatCount="indefinite" rotate="auto" path="M70,150 C 240,60 430,90 540,170 C 600,215 520,270 440,235 C 380,210 420,150 470,170"/>
        </g>
      </svg>
      <div class="stat">
        <div class="statnum">$215M<span class="blueword">+</span></div>
        <div class="statlbl">Built across schools, temples &amp; civic work</div>
      </div>
    </div>
  </div>
</div>`;

window.HEROES = { HERO_A, HERO_B, HERO_C };
