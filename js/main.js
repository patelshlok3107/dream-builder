/* ============================================================
   MAIN.JS — Dream Builder AI
   Nav, scroll effects, reveal animations, waitlist, mobile menu
   ============================================================ */

import ParticleField from './particles.js';
import { initDemo }    from './demo.js';
import { initPricing } from './pricing.js';

/* ── Scroll-aware navbar ──────────────────────────────────── */
function initNav() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Smooth nav links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile menu if open
      closeMobileMenu();
    });
  });
}

/* ── Mobile menu ──────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

function closeMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  hamburger?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Scroll reveal ────────────────────────────────────────── */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ── Roadmap progress animation ───────────────────────────── */
function initRoadmap() {
  const progressBar = document.querySelector('.roadmap-progress');
  if (!progressBar) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      progressBar.style.width = '40%';
      observer.disconnect();
    }
  }, { threshold: 0.3 });

  const roadmap = document.getElementById('roadmap');
  if (roadmap) observer.observe(roadmap);
}

/* ── Comparison table row highlight ───────────────────────── */
function initComparison() {
  const rows = document.querySelectorAll('.comparison-table tbody tr');
  rows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      rows.forEach(r => r.style.opacity = '0.5');
      row.style.opacity = '1';
    });
    row.addEventListener('mouseleave', () => {
      rows.forEach(r => r.style.opacity = '');
    });
  });
}

/* ── Waitlist form ────────────────────────────────────────── */
function initWaitlist() {
  const form    = document.getElementById('waitlist-form');
  const success = document.getElementById('waitlist-success');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('.waitlist-input');
    const email = input?.value.trim();
    if (!email || !email.includes('@')) {
      input?.classList.add('error-shake');
      setTimeout(() => input?.classList.remove('error-shake'), 600);
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Joining…';
    }

    await new Promise(r => setTimeout(r, 900));

    form.style.display = 'none';
    if (success) success.classList.add('show');

    triggerConfetti();
  });
}

/* ── Mini confetti burst ──────────────────────────────────── */
function triggerConfetti() {
  const colors = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f472b6', '#a855f7'];
  const container = document.body;

  for (let i = 0; i < 60; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      width: ${4 + Math.random() * 6}px;
      height: ${4 + Math.random() * 6}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      left: ${20 + Math.random() * 60}%;
      top: 60%;
      z-index: 9999;
      pointer-events: none;
      animation: confetti-fall ${1.5 + Math.random() * 1.5}s ease-out forwards;
      animation-delay: ${Math.random() * 0.4}s;
    `;
    container.appendChild(dot);
    setTimeout(() => dot.remove(), 3000);
  }

  // Inject confetti keyframes once
  if (!document.getElementById('confetti-style')) {
    const style = document.createElement('style');
    style.id = 'confetti-style';
    style.textContent = `
      @keyframes confetti-fall {
        0%   { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
        100% { transform: translateY(-300px) translateX(${Math.random() > 0.5 ? '' : '-'}${50 + Math.random()*100}px) rotate(${360 + Math.random()*360}deg) scale(0); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ── Floating card parallax in hero ──────────────────────── */
function initParallax() {
  const cards = document.querySelectorAll('.hero-float-card');
  if (!cards.length) return;

  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    cards.forEach((card, i) => {
      const depth = (i + 1) * 6;
      card.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
    });
  });
}

/* ── Gradient border reveal on scroll ────────────────────── */
function initGradientBorders() {
  const cards = document.querySelectorAll('.feature-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = entry.target.dataset.delay || '0s';
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.2 });
  cards.forEach(c => observer.observe(c));
}

/* ── Error shake ──────────────────────────────────────────── */
(function injectErrorShake() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes error-shake {
      0%, 100% { transform: translateX(0); }
      20%       { transform: translateX(-6px); }
      40%       { transform: translateX(6px); }
      60%       { transform: translateX(-4px); }
      80%       { transform: translateX(4px); }
    }
    .error-shake { animation: error-shake 0.4s ease; border-color: rgba(239,68,68,0.6) !important; }
    .btn-spinner {
      display: inline-block;
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
})();

/* ── Boot ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Particle canvas
  new ParticleField('particle-canvas');

  // Core UI
  initNav();
  initMobileMenu();
  initReveal();
  initRoadmap();
  initComparison();
  initWaitlist();
  initParallax();
  initGradientBorders();

  // Features
  initDemo();
  initPricing();

  console.log('%c🚀 Dream Builder AI', 'font-size:18px;font-weight:bold;color:#a855f7;');
  console.log('%cBuilt with ❤️ — One Prompt. Entire Startup.', 'color:#64748b;');
});
