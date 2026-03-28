(function () {
  'use strict';

  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  function updateProgress() {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0) + '%';
  }

  function initContextCursor() {
    const isTouchDevice = window.matchMedia('(hover: none)').matches;
    if (isTouchDevice) return;

    const label = document.createElement('div');
    label.className = 'ctx-cursor-label';
    document.body.appendChild(label);

    const glowEl = document.createElement('div');
    glowEl.className = 'ctx-cursor-glow';
    document.body.appendChild(glowEl);

    let glowX = -200, glowY = -200;
    let targetX = -200, targetY = -200;
    let labelText = '';
    let labelVisible = false;

    function animateGlow() {
      glowX += (targetX - glowX) * 0.1;
      glowY += (targetY - glowY) * 0.1;
      glowEl.style.transform = `translate(${glowX - 30}px, ${glowY - 30}px)`;
      requestAnimationFrame(animateGlow);
    }
    animateGlow();

    document.addEventListener('mousemove', e => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (labelVisible) {
        label.style.transform = `translate(${e.clientX + 18}px, ${e.clientY - 12}px)`;
      }
    });

    document.addEventListener('mouseleave', () => {
      targetX = -200;
      targetY = -200;
      glowEl.classList.remove('active');
    });

    const btnTargets = document.querySelectorAll('.btn-primary, .btn-ghost, .tab-btn, .theme-toggle, .nav-burger, .project-link');
    const cardTargets = document.querySelectorAll('.project-card, .skill-card, .about-card');

    btnTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        glowEl.classList.add('active', 'btn-mode');
        glowEl.classList.remove('card-mode');
        labelText = el.dataset.cursorLabel || '';
        if (labelText) {
          label.textContent = labelText;
          label.classList.add('visible');
          labelVisible = true;
        }
      });
      el.addEventListener('mouseleave', () => {
        glowEl.classList.remove('active', 'btn-mode');
        label.classList.remove('visible');
        labelVisible = false;
      });
    });

    cardTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        glowEl.classList.add('active', 'card-mode');
        glowEl.classList.remove('btn-mode');
      });
      el.addEventListener('mouseleave', () => {
        glowEl.classList.remove('active', 'card-mode');
      });
    });
  }

  const nav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateNav() {
    const scrollY = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', scrollY > 60);
    let current = '';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

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

  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  function runHeroSequence() {
    const profileReveal = document.getElementById('profileReveal');
    const heroText = document.getElementById('heroText');

    setTimeout(() => {
      if (profileReveal) profileReveal.classList.add('animate-in');
    }, 300);

    setTimeout(() => {
      if (heroText) heroText.classList.add('animate-in');
    }, 600);

    setTimeout(() => {
      typeText('typingName', "Hi, I'm Assishmon C S", 65, () => {
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

  function initTilt() {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        card.style.transform = `perspective(800px) rotateX(${y * -6}deg) rotateY(${x * 8}deg) scale(1.02)`;
        card.style.boxShadow = `${-x * 8}px ${y * 6}px 30px rgba(168,85,247,0.15)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        card.style.boxShadow = '';
      });
    });
  }

  function initScrollAnimations() {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.section-reveal').forEach(el => sectionObserver.observe(el));

    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const siblings = Array.from(entry.target.parentElement.children);
          const idx = siblings.indexOf(entry.target);
          setTimeout(() => entry.target.classList.add('in-view'), idx * 90);
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(
      '.skill-card, .project-card, .about-card, .timeline-item, .contact-item, .contact-form'
    ).forEach(el => cardObserver.observe(el));
  }

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
          panel.querySelectorAll('.skill-card').forEach((card, i) => {
            card.classList.remove('in-view');
            setTimeout(() => card.classList.add('in-view'), i * 80 + 50);
          });
        }
      });
    });
  }

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

  function initContactForm() {
    const form = document.getElementById('contactForm');
    const success = document.getElementById('formSuccess');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit');
      const endpoint = form.getAttribute('action');
      if (!btn || !endpoint || endpoint.includes('YOUR_FORM_ID')) {
        if (success) {
          success.textContent = 'Form setup pending: replace YOUR_FORM_ID with your Formspree form ID.';
          success.classList.add('show', 'error');
        }
        return;
      }

      btn.disabled = true;
      btn.querySelector('span').textContent = 'Sending...';

      try {
        const formData = new FormData(form);
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
          headers: {
            Accept: 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }

        form.reset();
        if (success) {
          success.textContent = "Message sent! I'll get back to you soon.";
          success.classList.remove('error');
          success.classList.add('show');
          setTimeout(() => success && success.classList.remove('show'), 5000);
        }
      } catch (err) {
        if (success) {
          success.textContent = 'Could not send message right now. Please try again or email me directly.';
          success.classList.add('show', 'error');
        }
      } finally {
        btn.disabled = false;
        btn.querySelector('span').textContent = 'Send Message';
      }
    });
  }

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

  function init() {
    runHeroSequence();
    initScrollAnimations();
    initTilt();
    initSkillsTabs();
    initRipple();
    initContactForm();
    initSmoothScroll();
    initContextCursor();
    updateNav();
    updateProgress();

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
