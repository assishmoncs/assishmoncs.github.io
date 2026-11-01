(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const scrollTo = el => el.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });

  // Upgrade controls only when this script has actually loaded.
  document.documentElement.classList.add('js');
  $('#year').textContent = new Date().getFullYear();
  const themeButton = $('.theme-toggle');
  function updateThemeButton() {
    const light = document.documentElement.dataset.theme === 'light';
    themeButton.setAttribute('aria-label', `Switch to ${light ? 'dark' : 'light'} theme`);
    themeButton.firstElementChild.textContent = light ? '☾' : '☼';
    $('meta[name="theme-color"]').content = light ? '#f5f3ef' : '#101016';
  }
  themeButton.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* Theme still works without persistence. */ }
    updateThemeButton();
    document.dispatchEvent(new Event('themechange'));
  });
  updateThemeButton();

  // Small-screen navigation: disclosure, Escape, outside dismissal, focus return.
  const nav = $('#navigation');
  const menu = $('.menu-toggle');
  const mobile = matchMedia('(max-width: 520px)');
  function setMenu(open, restoreFocus = false) {
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (open) nav.querySelector('a').focus();
    else if (restoreFocus) menu.focus();
  }
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false, true);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav') && nav.classList.contains('open')) setMenu(false);
  });
  $('.nav').addEventListener('focusout', e => {
    if (e.relatedTarget && !$('.nav').contains(e.relatedTarget)) setMenu(false);
  });
  mobile.addEventListener('change', () => {
    const hiddenFocus = mobile.matches && nav.contains(document.activeElement);
    setMenu(false, hiddenFocus);
  });
  $$('.nav-links a').forEach(link => link.addEventListener('click', () => {
    if (mobile.matches) {
      setMenu(false);
      const section = $(link.getAttribute('href'));
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
    }
  }));

  // Native details stay available as a no-JS / older-browser fallback.
  const dialog = $('#project-dialog');
  let dialogTrigger;
  let previousOverflow = '';
  if (typeof dialog.showModal === 'function') {
    $$('.project-card summary').forEach(summary => {
      summary.setAttribute('aria-haspopup', 'dialog');
      summary.setAttribute('aria-controls', 'project-dialog');
      summary.addEventListener('click', e => {
      e.preventDefault();
      dialogTrigger = summary;
      const card = summary.closest('.project-card');
      $('#dialog-title').textContent = card.querySelector('h3').textContent;
      $('#dialog-content').replaceChildren(card.querySelector('.project-details').cloneNode(true));
      $('#dialog-repo').href = card.querySelector('.repo-link').href;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
      $('.dialog-close').focus();
      });
    });
    $('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => {
      const rect = dialog.getBoundingClientRect();
      if (e.target === dialog && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.style.overflow = previousOverflow;
      dialogTrigger?.focus({ preventScroll: true });
    });
  }

  // Category and technology filters intersect. Selecting a skill starts from All.
  const cards = $$('.project-card');
  let category = 'all';
  let technology = '';
  function filterProjects() {
    let count = 0;
    cards.forEach(card => {
      const visible = (category === 'all' || card.dataset.category.split(' ').includes(category)) &&
        (!technology || card.dataset.tech.split('|').includes(technology));
      card.hidden = !visible;
      card.classList.remove('filter-enter');
      if (visible) {
        count++;
        requestAnimationFrame(() => card.classList.add('filter-enter'));
      }
    });
    $$('.project-grid').forEach(grid => {
      const empty = ![...grid.children].some(card => !card.hidden);
      grid.hidden = empty;
      $(`#${grid.getAttribute('aria-labelledby')}`).hidden = empty;
    });
    $$('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    $$('[data-skill]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.skill === technology)));
    $('#project-count').textContent = `${count} ${count === 1 ? 'project' : 'projects'}${technology ? ` using ${technology}` : ''}`;
    $('.skill-selection').hidden = !technology;
    $('#skill-filter-label').textContent = `Built with ${technology}`;
    $('.no-results').hidden = count > 0;
  }
  $$('[data-filter]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    filterProjects();
  }));
  $$('[data-skill]').forEach(button => {
    button.type = 'button';
    button.disabled = false;
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      technology = button.dataset.skill;
      category = 'all';
      filterProjects();
      $('#clear-skill').focus({ preventScroll: true });
      scrollTo($('#projects'));
    });
  });
  $('#clear-skill').addEventListener('click', () => {
    technology = '';
    filterProjects();
    $('[data-filter][aria-pressed="true"]').focus({ preventScroll: true });
  });
  $('#reset-filters').addEventListener('click', () => {
    category = 'all'; technology = ''; filterProjects();
    $('[data-filter="all"]').focus({ preventScroll: true });
  });

  let toastTimer;
  function notify(message) {
    clearTimeout(toastTimer);
    $('.toast').textContent = message;
    $('.toast').classList.add('visible');
    toastTimer = setTimeout(() => $('.toast').classList.remove('visible'), 4000);
  }
  $('.copy-email').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('assishmoncs@gmail.com');
      notify('Email address copied. Say hello!');
    } catch {
      notify('Copy unavailable. Use the email link or select the address.');
    }
  });

  const form = $('#contact-form');
  const status = $('#form-status');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity() || form.getAttribute('aria-busy') === 'true') return;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    button.textContent = 'Sending…';
    status.classList.remove('error');
    status.textContent = 'Sending your message…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error('Message rejected');
      form.reset();
      status.textContent = 'Message sent. Thank you — I’ll reply by email.';
    } catch {
      status.classList.add('error');
      status.textContent = 'Could not confirm delivery. Your message is still here. Try again or email assishmoncs@gmail.com directly.';
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
      button.textContent = 'Send message ↗';
      form.removeAttribute('aria-busy');
    }
  });

  const sections = $$('main > section[id]');
  let scrollQueued = false;
  function updateScroll() {
    scrollQueued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    $('.scroll-progress').style.width = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`;
    $('.back-top').hidden = scrollY < 650;
    let current = 'home';
    sections.forEach(section => { if (section.getBoundingClientRect().top <= 150) current = section.id; });
    $$('.nav-links a').forEach(link => {
      if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  const queueScroll = () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); } };
  window.addEventListener('scroll', queueScroll, { passive: true });
  window.addEventListener('resize', queueScroll);
  updateScroll();
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!reducedMotion.matches) entry.target.classList.add('section-arrive');
        reveal.unobserve(entry.target);
      }
    }), { threshold: .1 });
    $$('.section-heading, .about-copy').forEach(el => reveal.observe(el));
  }
})();
