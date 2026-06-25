/* ============================================================
   DEMO.JS — Dream Builder AI
   Interactive brand-building simulator
   ============================================================ */

const PIPELINE_STEPS = [
  { id: 'brand',    icon: '🧠', label: 'Brand Brain'   },
  { id: 'logo',     icon: '🎨', label: 'Logo'          },
  { id: 'store',    icon: '🛒', label: 'Store'         },
  { id: 'products', icon: '👕', label: 'Products'      },
  { id: 'ads',      icon: '📣', label: 'Ads'           },
  { id: 'content',  icon: '📸', label: 'IG Content'    },
];

const STEP_DURATIONS = [1200, 1500, 1400, 1200, 1100, 1300];

let demoRunning = false;
let demoComplete = false;

/* ── Main runner ─────────────────────────────────────────── */
async function runDemo() {
  if (demoRunning) return;
  demoRunning = true;
  demoComplete = false;

  const btn = document.getElementById('demo-run-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="btn-spinner"></span> Building your brand…';
    btn.style.opacity = '0.7';
  }

  // Show pipeline
  const pipeline = document.getElementById('demo-pipeline');
  if (pipeline) {
    pipeline.classList.add('visible');
    pipeline.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Reset all steps
  const steps = document.querySelectorAll('.pipeline-step');
  steps.forEach(s => { s.classList.remove('active', 'done'); });
  const progressLines = document.querySelectorAll('.pipeline-line .pipeline-progress');
  progressLines.forEach(l => { l.style.width = '0%'; });

  // Hide results
  const results = document.getElementById('demo-results');
  if (results) results.classList.remove('visible');

  // Animate each step
  for (let i = 0; i < PIPELINE_STEPS.length; i++) {
    const step = steps[i];
    if (!step) continue;

    // Mark current as active
    step.classList.add('active');

    // Animate progress line to next step
    if (i < progressLines.length) {
      await sleep(100);
      progressLines[i].style.width = '100%';
    }

    await sleep(STEP_DURATIONS[i]);

    // Mark done
    step.classList.remove('active');
    step.classList.add('done');
  }

  // Show results
  if (results) {
    results.classList.add('visible');
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Reset button
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = '🔄 Rebuild';
    btn.style.opacity = '1';
  }

  demoRunning = false;
  demoComplete = true;
}

/* ── Tab switching ───────────────────────────────────────── */
function initDemoTabs() {
  const tabs   = document.querySelectorAll('.demo-tab');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(`tab-${target}`);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ── Typing animation for demo input ─────────────────────── */
function initTypingEffect() {
  const input = document.getElementById('demo-input-field');
  if (!input) return;

  const text = '"VOID CULT — dark streetwear, Gen Z, oversized fits, dark aesthetic"';
  let i = 0;
  input.value = '';

  const type = () => {
    if (i < text.length) {
      input.value += text[i++];
      setTimeout(type, 28 + Math.random() * 20);
    }
  };

  // Start typing when demo section is visible
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(type, 600);
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  const demoSection = document.getElementById('demo');
  if (demoSection) observer.observe(demoSection);
}

/* ── Hero prompt typing effect ───────────────────────────── */
function initHeroTyping() {
  const input = document.getElementById('hero-prompt-input');
  if (!input) return;

  const prompts = [
    '"VOID CULT — dark streetwear, Gen Z, oversized fits"',
    '"LUMINARY — minimal skincare, clean beauty, millennial"',
    '"APEX LABS — premium supplements, athletic performance"',
    '"NEON DUSK — synthwave music merch, retro-futurist"',
  ];

  let promptIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let paused    = false;

  const TYPING_SPEED  = 35;
  const DELETE_SPEED  = 18;
  const PAUSE_BEFORE_DELETE = 2200;
  const PAUSE_BEFORE_TYPE   = 400;

  function tick() {
    const current = prompts[promptIdx];

    if (paused) return;

    if (!deleting) {
      if (charIdx < current.length) {
        input.value = current.slice(0, ++charIdx);
        setTimeout(tick, TYPING_SPEED + Math.random() * 15);
      } else {
        paused = true;
        setTimeout(() => {
          paused = false;
          deleting = true;
          tick();
        }, PAUSE_BEFORE_DELETE);
      }
    } else {
      if (charIdx > 0) {
        input.value = current.slice(0, --charIdx);
        setTimeout(tick, DELETE_SPEED);
      } else {
        deleting = false;
        promptIdx = (promptIdx + 1) % prompts.length;
        paused = true;
        setTimeout(() => {
          paused = false;
          tick();
        }, PAUSE_BEFORE_TYPE);
      }
    }
  }

  setTimeout(tick, 1200);
}

/* ── Counter animations ───────────────────────────────────── */
function animateCounter(el, target, duration = 1800, suffix = '') {
  const start    = 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current  = Math.round(start + (target - start) * eased);
    el.textContent = current.toLocaleString('en-IN') + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        animateCounter(el, target, 2000, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ── Utilities ───────────────────────────────────────────── */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* ── Init ────────────────────────────────────────────────── */
function initDemo() {
  const runBtn = document.getElementById('demo-run-btn');
  if (runBtn) runBtn.addEventListener('click', runDemo);

  initDemoTabs();
  initTypingEffect();
  initHeroTyping();
  initCounters();
}

export { initDemo };
