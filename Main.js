'use strict';

/* ─────────────────────────────────────────────
   PORTFOLIO — main.js
   Architecture: ES Module, strict mode
   Security: No eval(), no innerHTML w/ user input,
             textContent for all dynamic text,
             no external requests from JS
───────────────────────────────────────────── */

// ── UTILITY: safe text setter ──────────────────
const setText = (el, str) => { if (el) el.textContent = str; };

// ── FOOTER YEAR ───────────────────────────────
const footerYear = document.getElementById('footer-year');
setText(footerYear, new Date().getFullYear().toString());

// ── NAVBAR SCROLL STATE ───────────────────────
const navbar = document.querySelector('.navbar');
const onScroll = () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 40);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ── MOBILE MENU ───────────────────────────────
const toggle     = document.querySelector('.navbar__toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = mobileMenu?.querySelectorAll('a') ?? [];

const openMenu = () => {
  mobileMenu.hidden = false;
  toggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  mobileLinks[0]?.focus();
};

const closeMenu = () => {
  mobileMenu.hidden = true;
  toggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  toggle.focus();
};

toggle?.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  isOpen ? closeMenu() : openMenu();
});

mobileLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Close on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
  }
});

// ── INTERSECTION OBSERVER — REVEAL ───────────
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

revealEls.forEach(el => revealObserver.observe(el));

// ── ACTIVE NAV LINK (scroll spy) ─────────────
const sections   = document.querySelectorAll('section[id]');
const navLinks   = document.querySelectorAll('.navbar__links a');

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach(a => {
        const match = a.getAttribute('href') === `#${id}`;
        a.style.color = match ? 'var(--accent)' : '';
      });
    });
  },
  { threshold: 0.4 }
);

sections.forEach(s => spyObserver.observe(s));

// ── CONTACT FORM VALIDATION ───────────────────
const form        = document.getElementById('contact-form');
const successMsg  = document.getElementById('form-success');

const validators = {
  name: (v) => v.trim().length >= 2 ? '' : 'Please enter your name (min 2 characters).',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.',
  message: (v) => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.',
};

const getField = (name) => ({
  input: form?.querySelector(`[name="${name}"]`),
  error: document.getElementById(`${name}-error`),
});

const validateField = (name, value) => {
  const error = validators[name]?.(value) ?? '';
  const { input, error: errorEl } = getField(name);

  setText(errorEl, error);
  if (input) {
    input.setAttribute('aria-invalid', error ? 'true' : 'false');
  }
  return error === '';
};

// Live validation on blur
['name', 'email', 'message'].forEach(name => {
  const { input } = getField(name);
  input?.addEventListener('blur', () => validateField(name, input.value));
  input?.addEventListener('input', () => {
    // Clear error on re-type if previously invalid
    if (input.getAttribute('aria-invalid') === 'true') {
      validateField(name, input.value);
    }
  });
});

form?.addEventListener('submit', (e) => {
  e.preventDefault();

  const nameVal    = form.querySelector('[name="name"]')?.value    ?? '';
  const emailVal   = form.querySelector('[name="email"]')?.value   ?? '';
  const messageVal = form.querySelector('[name="message"]')?.value ?? '';

  const nameOk    = validateField('name',    nameVal);
  const emailOk   = validateField('email',   emailVal);
  const messageOk = validateField('message', messageVal);

  if (!nameOk || !emailOk || !messageOk) {
    // Focus first invalid field
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }

  // Simulate send (no actual network call — CSP blocks connect-src)
  const submitBtn = form.querySelector('[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  setTimeout(() => {
    form.reset();
    ['name', 'email', 'message'].forEach(n => {
      const { input, error } = getField(n);
      input?.removeAttribute('aria-invalid');
      setText(error, '');
    });
    if (successMsg) successMsg.hidden = false;
    if (submitBtn) submitBtn.disabled = false;

    // Hide after 6s
    setTimeout(() => { if (successMsg) successMsg.hidden = true; }, 6000);
  }, 600);
});