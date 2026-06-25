/* ============================================================
   DREAM BUILDER AI — app.js (All-in-one bundle)
   Particles · Demo · Pricing · Main
   ============================================================ */

/* ══ PARTICLE FIELD ══════════════════════════════════════════ */
class ParticleField {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.colors = ['rgba(124,58,237,','rgba(236,72,153,','rgba(6,182,212,'];
    this.init();
    this.bindEvents();
    this.animate();
  }
  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  init() {
    this.resize();
    this.particles = Array.from({length: 55}, () => this.mkParticle());
  }
  mkParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      r: 0.4 + Math.random() * 1.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: 0.2 + Math.random() * 0.4,
      color: this.colors[Math.floor(Math.random() * this.colors.length)]
    };
  }
  drawConnections() {
    const {particles: p, ctx} = this;
    for (let i = 0; i < p.length; i++) {
      for (let j = i + 1; j < p.length; j++) {
        const dx = p[i].x - p[j].x, dy = p[i].y - p[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < 130) {
          ctx.beginPath();
          ctx.moveTo(p[i].x, p[i].y);
          ctx.lineTo(p[j].x, p[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${0.07 * (1 - d/130)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }
  update() {
    this.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
    });
  }
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawConnections();
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      this.ctx.fillStyle = `${p.color}${p.opacity})`;
      this.ctx.fill();
    });
  }
  animate() { this.update(); this.render(); requestAnimationFrame(() => this.animate()); }
  bindEvents() { window.addEventListener('resize', () => this.init()); }
}

/* ══ DEMO SIMULATOR ══════════════════════════════════════════ */
let demoRunning = false;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runDemo() {
  if (demoRunning) return;
  demoRunning = true;

  const btn = document.getElementById('demo-run-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span style="display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:6px;"></span> Building your brand…';
    btn.style.opacity = '0.75';
  }

  const pipeline = document.getElementById('demo-pipeline');
  if (pipeline) { pipeline.classList.add('visible'); setTimeout(() => pipeline.scrollIntoView({behavior:'smooth',block:'nearest'}), 100); }

  const steps    = document.querySelectorAll('.pipeline-step');
  const progBars = document.querySelectorAll('.pipeline-line .pipeline-progress');
  steps.forEach(s => s.classList.remove('active','done'));
  progBars.forEach(b => { b.style.transition = 'none'; b.style.width = '0%'; });

  const results = document.getElementById('demo-results');
  if (results) results.classList.remove('visible');

  const durations = [1100, 1400, 1300, 1100, 1000, 1200];

  for (let i = 0; i < steps.length; i++) {
    steps[i].classList.add('active');
    if (progBars[i]) {
      await sleep(80);
      progBars[i].style.transition = 'width 0.9s cubic-bezier(0,0,0.2,1)';
      progBars[i].style.width = '100%';
    }
    await sleep(durations[i]);
    steps[i].classList.remove('active');
    steps[i].classList.add('done');
  }

  if (results) {
    results.classList.add('visible');
    setTimeout(() => results.scrollIntoView({behavior:'smooth',block:'start'}), 100);
  }

  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '🔄 Rebuild';
    btn.style.opacity = '1';
  }
  demoRunning = false;
}

function initDemoTabs() {
  const tabs   = document.querySelectorAll('.demo-tab');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      const panel = document.getElementById('tab-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
}

function initTypingEffect() {
  const input = document.getElementById('demo-input-field');
  if (!input) return;
  const text = '"VOID CULT — dark streetwear, Gen Z, oversized fits, dark aesthetic"';
  let i = 0;
  input.value = '';
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      const type = () => { if (i < text.length) { input.value += text[i++]; setTimeout(type, 28 + Math.random()*18); } };
      setTimeout(type, 500);
      observer.disconnect();
    }
  }, {threshold: 0.3});
  const demo = document.getElementById('demo');
  if (demo) observer.observe(demo);
}

function initHeroTyping() {
  const input = document.getElementById('hero-prompt-input');
  if (!input) return;
  const prompts = [
    '"VOID CULT — dark streetwear, Gen Z, oversized fits"',
    '"LUMINARY — minimal skincare, clean beauty, millennial"',
    '"APEX LABS — premium supplements, athletic performance"',
    '"NEON DUSK — synthwave music merch, retro-futurist"',
  ];
  let pi = 0, ci = 0, deleting = false, paused = false;
  function tick() {
    if (paused) return;
    const cur = prompts[pi];
    if (!deleting) {
      if (ci < cur.length) { input.value = cur.slice(0, ++ci); setTimeout(tick, 38 + Math.random()*18); }
      else { paused = true; setTimeout(() => { paused=false; deleting=true; tick(); }, 2400); }
    } else {
      if (ci > 0) { input.value = cur.slice(0, --ci); setTimeout(tick, 20); }
      else { deleting=false; pi=(pi+1)%prompts.length; paused=true; setTimeout(() => { paused=false; tick(); }, 450); }
    }
  }
  setTimeout(tick, 1200);
}

/* ══ COUNTER ANIMATIONS ══════════════════════════════════════ */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const start  = performance.now();
      const dur    = 1800;
      const run = now => {
        const t = Math.min((now - start) / dur, 1);
        const e = 1 - Math.pow(1-t, 3);
        el.textContent = Math.round(target * e).toLocaleString('en-IN') + suffix;
        if (t < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
      observer.unobserve(el);
    });
  }, {threshold: 0.5});
  counters.forEach(c => observer.observe(c));
}

/* ══ PRICING TOGGLE ══════════════════════════════════════════ */
const PRICES = {
  inr: { seed:'0', grind:'999', empire:'2,999', sym:'₹' },
  usd: { seed:'0', grind:'12',  empire:'36',    sym:'$' },
};
let currency = 'inr';

function setPricing(cur) {
  currency = cur;
  const p   = PRICES[cur];
  const amounts = document.querySelectorAll('.plan-amount');
  const syms    = document.querySelectorAll('.plan-currency');
  const keys    = ['seed','grind','empire'];
  amounts.forEach((el, i) => {
    el.style.cssText = 'opacity:0;transform:translateY(8px);transition:opacity 0.25s,transform 0.25s;';
    setTimeout(() => {
      el.textContent = p[keys[i]];
      el.style.cssText = 'opacity:1;transform:translateY(0);transition:opacity 0.25s,transform 0.25s;';
    }, 160);
  });
  syms.forEach(el => el.textContent = p.sym);
  document.getElementById('toggle-inr')?.classList.toggle('active', cur==='inr');
  document.getElementById('toggle-usd')?.classList.toggle('active', cur==='usd');
  const sw = document.getElementById('currency-toggle');
  if (sw) { sw.classList.toggle('usd', cur==='usd'); sw.setAttribute('aria-checked', cur==='usd'); }
}

function initPricing() {
  const sw = document.getElementById('currency-toggle');
  sw?.addEventListener('click', () => setPricing(currency==='inr'?'usd':'inr'));
  document.getElementById('toggle-inr')?.addEventListener('click', () => setPricing('inr'));
  document.getElementById('toggle-usd')?.addEventListener('click', () => setPricing('usd'));
}

/* ══ CONFETTI ═════════════════════════════════════════════════ */
function confetti() {
  const colors = ['#7c3aed','#ec4899','#06b6d4','#10b981','#f472b6','#a855f7','#fbbf24'];
  for (let i=0; i<70; i++) {
    const d = document.createElement('div');
    const x = 10 + Math.random()*80;
    const tx = (Math.random()-0.5)*200;
    const rot = 300 + Math.random()*400;
    d.style.cssText = `position:fixed;z-index:9999;pointer-events:none;border-radius:${Math.random()>.5?'50%':'3px'};width:${4+Math.random()*7}px;height:${4+Math.random()*7}px;background:${colors[~~(Math.random()*colors.length)]};left:${x}%;top:65%;animation:cfetti ${1.4+Math.random()*1.4}s ease-out ${Math.random()*.5}s forwards;--tx:${tx}px;--rot:${rot}deg;`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 3200);
  }
  if (!document.getElementById('cfetti-css')) {
    const s = document.createElement('style');
    s.id = 'cfetti-css';
    s.textContent = '@keyframes cfetti{0%{transform:translateY(0) translateX(0) rotate(0) scale(1);opacity:1}100%{transform:translateY(-280px) translateX(var(--tx)) rotate(var(--rot)) scale(0);opacity:0}}';
    document.head.appendChild(s);
  }
}

/* ══ WAITLIST ═════════════════════════════════════════════════ */
function initWaitlist() {
  const form = document.getElementById('waitlist-form');
  const succ = document.getElementById('waitlist-success');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const inp = form.querySelector('.waitlist-input');
    const val = inp?.value.trim() || '';
    if (!val || !val.includes('@')) {
      inp?.animate([{transform:'translateX(0)'},{transform:'translateX(-7px)'},{transform:'translateX(7px)'},{transform:'translateX(-5px)'},{transform:'translateX(0)'}],{duration:380,easing:'ease'});
      if (inp) { inp.style.borderColor='rgba(239,68,68,0.6)'; setTimeout(()=>inp.style.borderColor='',1000); }
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled=true; btn.innerHTML='<span style="display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle;margin-right:6px;"></span>Joining…'; }
    await sleep(900);
    form.style.display = 'none';
    if (succ) succ.classList.add('show');
    confetti();
  });
}

/* ══ NAV ══════════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('navbar');
  const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({behavior:'smooth',block:'start'});
      closeMobile();
    });
  });
}

function closeMobile() {
  document.getElementById('mobile-menu')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
  document.body.style.overflow = '';
}

function initMobileMenu() {
  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!ham || !menu) return;
  ham.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    ham.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
}

/* ══ SCROLL REVEAL ════════════════════════════════════════════ */
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, {threshold: 0.1, rootMargin: '0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ══ ROADMAP PROGRESS ═════════════════════════════════════════ */
function initRoadmap() {
  const bar = document.querySelector('.roadmap-progress');
  if (!bar) return;
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { bar.style.width = '40%'; obs.disconnect(); }
  }, {threshold: 0.3});
  const rm = document.getElementById('roadmap');
  if (rm) obs.observe(rm);
}

/* ══ COMPARISON HIGHLIGHT ════════════════════════════════════ */
function initComparison() {
  const rows = [...document.querySelectorAll('.comparison-table tbody tr')];
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => rows.forEach(r => r.style.opacity = r===row ? '1' : '0.45'));
    row.addEventListener('mouseleave', () => rows.forEach(r => r.style.opacity = ''));
  });
}

/* ══ INJECT GLOBAL KEYFRAMES ═════════════════════════════════ */
(function() {
  const s = document.createElement('style');
  s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
  document.head.appendChild(s);
})();

/* ══ BOOT ════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  new ParticleField('particle-canvas');
  initNav();
  initMobileMenu();
  initReveal();
  initRoadmap();
  initComparison();
  initWaitlist();
  initPricing();

  // Demo
  const runBtn = document.getElementById('demo-run-btn');
  if (runBtn) runBtn.addEventListener('click', runDemo);
  initDemoTabs();
  initTypingEffect();
  initHeroTyping();
  initCounters();

  console.log('%c🚀 Dream Builder AI', 'font-size:18px;font-weight:bold;color:#a855f7;');
  console.log('%cOne Prompt. Entire Startup.', 'color:#64748b;font-size:13px;');
});
