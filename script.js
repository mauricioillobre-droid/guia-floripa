/* ================================================
   Floripa por Mauri — script-new.js
   Vanilla JS: IntersectionObserver, lang toggle,
   parallax (RAF), ripple, counters, tabs, copy
   ================================================ */

'use strict';

/* ── Language toggle ────────────────────────────── */
const htmlEl        = document.documentElement;
const langToggleBtn = document.getElementById('langToggle');
let   currentLang   = 'es';

function setLanguage(lang) {
  currentLang = lang;
  htmlEl.lang = lang;
  htmlEl.dataset.lang = lang;

  document.querySelectorAll('[data-es],[data-pt]').forEach(el => {
    const val = el.dataset[lang];
    if (val !== undefined) el.textContent = val;
  });

  if (lang === 'pt') {
    langToggleBtn.classList.add('is-pt');
  } else {
    langToggleBtn.classList.remove('is-pt');
  }
}

langToggleBtn.addEventListener('click', () => {
  setLanguage(currentLang === 'es' ? 'pt' : 'es');
});

/* ── Nav: frosted glass on scroll ───────────────── */
const navEl = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    navEl.classList.add('nav--scrolled');
  } else {
    navEl.classList.remove('nav--scrolled');
  }
}, { passive: true });

/* ── Hero parallax (RAF-batched) ────────────────── */
const heroBg = document.getElementById('heroBg');
let   rafPending = false;

function applyParallax() {
  if (heroBg) {
    heroBg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
  }
  rafPending = false;
}

window.addEventListener('scroll', () => {
  if (!rafPending) {
    requestAnimationFrame(applyParallax);
    rafPending = true;
  }
}, { passive: true });

/* ── IntersectionObserver: reveal ───────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');

    /* Kick the section-line child if present */
    const line = entry.target.querySelector('.section-line');
    if (line) line.classList.add('is-visible');

    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* Standalone section-lines (outside .reveal) */
const lineObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    lineObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.section-line').forEach(el => lineObserver.observe(el));

/* ── Tabs ───────────────────────────────────────── */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;

    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.tab-content').forEach(c => {
      c.classList.remove('active');
    });

    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const pane = document.getElementById(tabId);
    if (pane) pane.classList.add('active');
  });
});

/* ── Ripple effect ───────────────────────────────── */
function createRipple(e) {
  const host = e.currentTarget;
  const wave = document.createElement('span');
  wave.classList.add('ripple-wave');

  const rect = host.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  wave.style.cssText = `
    width:  ${size}px;
    height: ${size}px;
    left:   ${e.clientX - rect.left  - size / 2}px;
    top:    ${e.clientY - rect.top   - size / 2}px;
  `;
  host.appendChild(wave);
  wave.addEventListener('animationend', () => wave.remove(), { once: true });
}

document.querySelectorAll('.ripple-host').forEach(el => {
  el.addEventListener('click', createRipple);
});

/* ── Copy to clipboard ───────────────────────────── */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.dataset.copy;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      const label  = btn.textContent;
      const copied = currentLang === 'es'
        ? (btn.dataset.copiedEs || '¡Copiado!')
        : (btn.dataset.copiedPt || 'Copiado!');

      btn.textContent = copied;
      btn.classList.add('is-copied');

      setTimeout(() => {
        btn.textContent = label;
        btn.classList.remove('is-copied');
      }, 2200);
    }).catch(() => {
      /* Fallback for browsers without clipboard API */
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity  = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    });
  });
});

/* ── Bar number counter animation ───────────────── */
function animateCounter(el, target, duration) {
  const start = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    /* Cubic ease-out */
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target;
    }
  }

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.target, 10);
    if (!isNaN(target)) animateCounter(el, target, 1200);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 });

document.querySelectorAll('.bar-number[data-target]').forEach(el => {
  counterObserver.observe(el);
});

/* ── Smooth scroll for hero CTA ─────────────────── */
const heroCta = document.querySelector('.hero-cta');
if (heroCta) {
  heroCta.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

/* ── Beach carousel ─────────────────────────────── */
(function () {
  const track    = document.getElementById('beachTrack');
  const btnPrev  = document.getElementById('beachPrev');
  const btnNext  = document.getElementById('beachNext');
  if (!track || !btnPrev || !btnNext) return;

  const CARD_W = () => {
    const card = track.querySelector('.beach-card');
    if (!card) return 340;
    return card.offsetWidth + 20; /* card + gap */
  };

  btnNext.addEventListener('click', () => {
    track.scrollBy({ left: CARD_W(), behavior: 'smooth' });
  });

  btnPrev.addEventListener('click', () => {
    track.scrollBy({ left: -CARD_W(), behavior: 'smooth' });
  });

  /* Update btn disabled state */
  function updateBtns() {
    btnPrev.disabled = track.scrollLeft <= 4;
    btnNext.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }
  track.addEventListener('scroll', updateBtns, { passive: true });
  updateBtns();

  /* Drag to scroll */
  let isDown = false, startX, scrollLeft;
  track.addEventListener('mousedown', e => {
    isDown = true;
    track.classList.add('is-dragging');
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
  });
  document.addEventListener('mouseup',   () => { isDown = false; track.classList.remove('is-dragging'); });
  track.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollLeft - walk;
  });
})();

/* ── Active section highlight in nav (optional UX) ─ */
const sections = document.querySelectorAll('section[id], footer');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      /* Could highlight nav items — left minimal for clean design */
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => sectionObserver.observe(s));
