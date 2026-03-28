(function () {
  'use strict';

  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.prepend(progressBar);

  const nav = document.getElementById('mainNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const navBurger = document.getElementById('navBurger');
  const mobileNav = document.getElementById('mobileNav');
  const mobLinks = document.querySelectorAll('.mob-link');
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  function updateProgress() {
    const scrolled = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (maxScroll > 0 ? (scrolled / maxScroll) * 100 : 0) + '%';
  }

  function updateNav() {
    const scrollY = window.scrollY;

    if (nav) {
      nav.classList.toggle('scrolled', scrollY > 40);
    }

    let current = '';
    sections.forEach(section => {
      if (scrollY >= section.offsetTop - 140) {
        current = section.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  function initMobileNav() {
    if (!navBurger || !mobileNav) return;

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

  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);

    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  function typeText(elementId, text, speed, callback) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let index = 0;
    el.textContent = '';

    function type() {
      if (index < text.length) {
        el.textContent += text[index++];
        setTimeout(type, speed + Math.random() * 18);
      } else if (callback) {
        callback();
      }
    }

    type();
  }

  function runHeroSequence() {
    const profileReveal = document.getElementById('profileReveal');
    const heroText = document.getElementById('heroText');

    setTimeout(() => {
      if (profileReveal) profileReveal.classList.add('animate-in');
    }, 220);

    setTimeout(() => {
      if (heroText) heroText.classList.add('animate-in');
    }, 420);

    setTimeout(() => {
      typeText('typingName', "Hi, I'm Assishmon C S", 60, () => {
        setTimeout(() => {
          typeText('typingTitle', 'CSE Student | Frontend-Focused Builder', 45);
        }, 220);
      });
    }, 1100);
  }

  function initTilt() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', event => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * 6;
        const ry = (px - 0.5) * 8;
        card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  function initScrollAnimations() {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.section-reveal').forEach(el => sectionObserver.observe(el));

    const cardObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const siblings = entry.target.parentElement ? Array.from(entry.target.parentElement.children) : [];
        const index = siblings.indexOf(entry.target);

        setTimeout(() => {
          entry.target.classList.add('in-view');
        }, Math.max(index, 0) * 90);

        cardObserver.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.skill-card, .project-card, .about-card, .timeline-item, .contact-item, .contact-form').forEach(el => {
      cardObserver.observe(el);
    });
  }

  function initSkillsTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.skills-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;

        tabBtns.forEach(item => item.classList.remove('active'));
        panels.forEach(panel => panel.classList.remove('active'));

        btn.classList.add('active');

        const panel = document.getElementById(`tab-${target}`);
        if (!panel) return;

        panel.classList.add('active');
        panel.querySelectorAll('.skill-card').forEach((card, index) => {
          card.classList.remove('in-view');
          setTimeout(() => card.classList.add('in-view'), 60 + index * 70);
        });
      });
    });
  }

  function initRipple() {
    document.querySelectorAll('.btn-primary, .btn-ghost').forEach(btn => {
      btn.addEventListener('click', function (event) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');

        ripple.className = 'ripple-effect';
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;

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
    if (!form || !success) return;

    form.addEventListener('submit', async event => {
      event.preventDefault();

      const btn = form.querySelector('.btn-submit');
      const btnLabel = btn ? btn.querySelector('span') : null;
      const endpoint = form.getAttribute('action');

      if (!btn || !btnLabel || !endpoint || endpoint.includes('YOUR_FORM_ID')) {
        success.textContent = 'Form setup pending: replace YOUR_FORM_ID with your Formspree form ID.';
        success.classList.add('show', 'error');
        return;
      }

      btn.disabled = true;
      btnLabel.textContent = 'Sending...';

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
          throw new Error('Submission failed');
        }

        form.reset();
        success.textContent = "Message sent! I'll get back to you soon.";
        success.classList.remove('error');
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 5000);
      } catch (error) {
        success.textContent = 'Could not send message right now. Please try again or email me directly.';
        success.classList.add('show', 'error');
      } finally {
        btn.disabled = false;
        btnLabel.textContent = 'Send Message';
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', event => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;

    requestAnimationFrame(() => {
      updateProgress();
      updateNav();
      ticking = false;
    });

    ticking = true;
  });

  function init() {
    initTheme();
    initMobileNav();
    runHeroSequence();
    initScrollAnimations();
    initTilt();
    initSkillsTabs();
    initRipple();
    initContactForm();
    initSmoothScroll();
    updateNav();
    updateProgress();

    setTimeout(() => {
      document.querySelectorAll('#tab-web .skill-card').forEach((card, index) => {
        setTimeout(() => card.classList.add('in-view'), 180 + index * 80);
      });
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
