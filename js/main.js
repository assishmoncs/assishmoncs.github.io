/**
 * ASSISHMON C S — PORTFOLIO
 * Main JavaScript Module
 */

(function () {
  'use strict';

  /* ============================================================
     SCROLL PROGRESS BAR
     ============================================================ */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  function updateProgress() {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct = maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  let cursorX = 0, cursorY = 0;
  let ringX = 0, ringY = 0;
  const ringLag = 0.12;

  if (cursorDot && cursorRing) {
    document.addEventListener('mousemove', e => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursorDot.style.left = cursorX + 'px';
      cursorDot.style.top = cursorY + 'px';
    });

    function animateRing() {
      ringX += (cursorX - ringX) * ringLag;
      ringY += (cursorY - ringY) * ringLag;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const interactables = document.querySelectorAll('a, button, [data-tilt], input, textarea');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ============================================================
     NAV SCROLL & ACTIVE LINK
     ============================================================ */
  const nav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateNav() {
    const scrollY = window.scrollY;

    // Scrolled class
    if (nav) nav.classList.toggle('scrolled', scrollY > 60);

    // Active section highlight
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (scrollY >= top) current = sec.id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  /* ============================================================
     MOBILE NAVIGATION
     ============================================================ */
  const navBurger = document.getElementById('navBurger');
  const mobileNav = document.getElementById('mobileNav');
  const mobLinks = document.querySelectorAll('.mob-link');

  if (navBurger && mobileNav) {
    navBurger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      navBurger.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        navBurger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ============================================================
     DARK / LIGHT MODE TOGGLE
     ============================================================ */
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Check saved preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  /* ============================================================
     HERO SEQUENCE — Profile reveal → Typing animation
     ============================================================ */
  function runHeroSequence() {
    const profileReveal = document.getElementById('profileReveal');
    const heroText = document.getElementById('heroText');

    // Step 1: Profile reveal
    setTimeout(() => {
      if (profileReveal) profileReveal.classList.add('animate-in');
    }, 300);

    // Step 2: Hero text slide in
    setTimeout(() => {
      if (heroText) heroText.classList.add('animate-in');
    }, 600);

    // Step 3: Typing name
    setTimeout(() => {
      typeText('typingName', "Hi, I'm Assishmon C S", 65, () => {
        // Step 4: Typing title
        setTimeout(() => {
          typeText('typingTitle', 'CSE Student | Tech Enthusiast', 55);
        }, 300);
      });
    }, 1400);
  }

  function typeText(elementId, text, speed, callback) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let i = 0;
    el.textContent = '';

    function type() {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(type, speed + Math.random() * 20);
      } else if (callback) {
        callback();
      }
    }
    type();
  }

  /* ============================================================
     TILT EFFECT
     ============================================================ */
  function initTilt() {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        const rotateX = y * -6;
        const rotateY = x * 8;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        card.style.boxShadow = `${-rotateY}px ${rotateX}px 30px rgba(168,85,247,0.15)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        card.style.boxShadow = '';
      });
    });
  }

  /* ============================================================
     INTERSECTION OBSERVER — Scroll Animations
     ============================================================ */
  function initScrollAnimations() {
    // Section reveals
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.section-reveal').forEach(el => sectionObserver.observe(el));

    // Staggered cards
    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentElement.children);
          const idx = siblings.indexOf(entry.target);
          setTimeout(() => {
            entry.target.classList.add('in-view');
          }, idx * 90);
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(
      '.skill-card, .project-card, .about-card, .timeline-item, .contact-item, .contact-form'
    ).forEach(el => cardObserver.observe(el));
  }

  /* ============================================================
     SKILLS TAB SWITCHER
     ============================================================ */
  function initSkillsTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.skills-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');

        const panel = document.getElementById('tab-' + target);
        if (panel) {
          panel.classList.add('active');
          // Re-trigger skill bar animations
          panel.querySelectorAll('.skill-card').forEach((card, i) => {
            card.classList.remove('in-view');
            setTimeout(() => card.classList.add('in-view'), i * 80 + 50);
          });
        }
      });
    });
  }

  /* ============================================================
     BUTTON RIPPLE
     ============================================================ */
  function initRipple() {
    document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
      btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });
  }

  /* ============================================================
     CONTACT FORM
     ============================================================ */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit');
      btn.disabled = true;
      btn.querySelector('span').textContent = 'Sending...';

      setTimeout(() => {
        form.reset();
        btn.disabled = false;
        btn.querySelector('span').textContent = 'Send Message';
        if (success) success.classList.add('show');
        setTimeout(() => success && success.classList.remove('show'), 5000);
      }, 1200);
    });
  }

  /* ============================================================
     SMOOTH SCROLL
     ============================================================ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ============================================================
     SCROLL EVENT
     ============================================================ */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateNav();
        ticking = false;
      });
      ticking = true;
    }
  });

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    runHeroSequence();
    initScrollAnimations();
    initTilt();
    initSkillsTabs();
    initRipple();
    initContactForm();
    initSmoothScroll();
    updateNav();
    updateProgress();

    // Trigger initial skill cards for the default visible tab
    setTimeout(() => {
      document.querySelectorAll('#tab-web .skill-card').forEach((card, i) => {
        setTimeout(() => card.classList.add('in-view'), i * 100 + 200);
      });
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
