(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = matchMedia('(pointer: coarse)');

  function smoothScrollTo(el) {
    el?.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
  }

  document.documentElement.classList.add('js');
  $('#year').textContent = new Date().getFullYear();

  // --- HEADER BRAND TYPEWRITER ANIMATION (ASSISH + blinking _) ---
  const brandTyped = $('#brand-typed');
  if (brandTyped && !reducedMotion.matches) {
    const fullText = 'ASSISH';
    let typedStarted = false;
    const startTyping = () => {
      if (typedStarted) return;
      typedStarted = true;
      brandTyped.textContent = '';
      let i = 0;
      const step = () => {
        i++;
        brandTyped.textContent = fullText.slice(0, i);
        if (i < fullText.length) setTimeout(step, 115);
      };
      setTimeout(step, 140);
    };
    document.addEventListener('preloaderDone', startTyping, { once: true });
    const pre = $('#preloader-3d');
    if (!pre || pre.hidden || pre.dataset.done) startTyping();
  }

  // --- 0. PROCEDURAL WEB AUDIO MICRO-SOUND SYNTHESIZER (Muted by Default) ---
  let soundEnabled = false;
  let audioCtx = null;
  const soundBtn = $('.sound-toggle');

  function playMicroSound(type = 'tick') {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'morph') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.17);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.04);
        gain.gain.setValueAtTime(0.024, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch { /* ignore */ }
  }
  window.playMicroSound = playMicroSound;

  soundBtn?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.setAttribute('aria-pressed', String(soundEnabled));
    soundBtn.classList.toggle('is-on', soundEnabled);
    soundBtn.setAttribute('aria-label', soundEnabled ? 'Mute interface audio' : 'Enable subtle interface audio');
    if (soundEnabled) playMicroSound('morph');
    notify(soundEnabled ? 'Architectural micro-audio enabled' : 'Interface audio muted');
  });

  // --- 1. THEME TOGGLE (ALABASTER LIGHT <-> MIDNIGHT BLUEPRINT DARK) ---
  const themeBtn = $('.theme-toggle');
  function syncThemeUI() {
    const isDark = document.documentElement.dataset.theme === 'dark';
    themeBtn.setAttribute('aria-label', `Switch to ${isDark ? 'light alabaster' : 'dark blueprint'} theme`);
    $('meta[name="theme-color"]').content = isDark ? '#101216' : '#f5f1e8';
  }
  themeBtn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* ignore */ }
    syncThemeUI();
    document.dispatchEvent(new Event('themechange'));
    playMicroSound('tick');
    notify(`Switched to ${next === 'dark' ? 'Midnight Blueprint' : 'Alabaster Gallery'} theme`);
  });
  syncThemeUI();

  // --- 2. MOBILE NAVIGATION & MAGNETIC BUTTONS ---
  const nav = $('#navigation');
  const menu = $('.menu-toggle');
  const mobile = matchMedia('(max-width: 560px)');
  function setMenu(open, restore = false) {
    nav.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', String(open));
    if (open) nav.querySelector('a')?.focus();
    else if (restore) menu.focus();
  }
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false, true); });
  document.addEventListener('click', e => { if (!e.target.closest('.site-header') && nav.classList.contains('open')) setMenu(false); });
  $$('.nav-links a, .chapter-rail a').forEach(a => a.addEventListener('click', () => {
    if (mobile.matches) setMenu(false);
    playMicroSound('tick');
  }));

  if (!coarsePointer.matches && !reducedMotion.matches) {
    $$('.btn-solid, .btn-outline').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const mx = (e.clientX - (r.left + r.width / 2)) * 0.16;
        const my = (e.clientY - (r.top + r.height / 2)) * 0.2;
        el.style.transform = `translate3d(${mx.toFixed(1)}px, ${my.toFixed(1)}px, 0)`;
      }, { passive: true });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  // --- 3. 3D PERSPECTIVE TILT ON CARDS & PORTRAIT ---
  if (!coarsePointer.matches && !reducedMotion.matches) {
    $$('.project-card').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 8;
        el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
        el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
      }, { passive: true });
      el.addEventListener('pointerleave', () => {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
    const portraitCard = $('#portrait-card');
    if (portraitCard) {
      portraitCard.addEventListener('pointermove', e => {
        const r = portraitCard.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        portraitCard.style.setProperty('--prx', `${((py - 0.5) * -10).toFixed(2)}deg`);
        portraitCard.style.setProperty('--pry', `${((px - 0.5) * 10).toFixed(2)}deg`);
        portraitCard.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
        portraitCard.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      }, { passive: true });
      portraitCard.addEventListener('pointerleave', () => {
        portraitCard.style.setProperty('--prx', '0deg');
        portraitCard.style.setProperty('--pry', '0deg');
      });
    }
  }

  // --- 4. LIVE ARCHITECTURE SIMULATORS FOR ALL 9 PROJECTS ---
  const SIMULATORS = {
    'PairPad': {
      render: c => {
        c.innerHTML = `<div class="sim-header"><span>CRDT SHARED STATE SIMULATOR</span><b>2 PEERS · 11ms</b></div>
          <div class="sim-grid-two"><div class="sim-pane"><label for="pp-a">Peer A</label><input id="pp-a" value="const state = mergeCRDT(ops);"></div>
          <div class="sim-pane"><label for="pp-b">Peer B</label><input id="pp-b" value="socket.emit('cursor', pos);"></div></div>
          <div class="sim-Controls"><button type="button" class="sim-btn" id="pp-run">Simulate Concurrent Edit ⚡</button></div>
          <pre class="sim-console" id="pp-out"></pre>`;
        const a = c.querySelector('#pp-a'), b = c.querySelector('#pp-b'), out = c.querySelector('#pp-out');
        let clk = 40;
        const sync = msg => { clk++; out.textContent = `[Clock #${clk}] ${msg}\n01 | ${a.value}\n02 | ${b.value}`; };
        a.addEventListener('input', () => sync('Peer A delta merged'));
        b.addEventListener('input', () => sync('Peer B delta merged'));
        c.querySelector('#pp-run').addEventListener('click', () => { b.value = `crdt.converge({ lamport: ${clk} });`; sync('Conflict-free merge verified!'); playMicroSound('tick'); });
        sync('Workspace synchronized');
      }
    },
    'ShadowCast': {
      render: c => {
        c.innerHTML = `<div class="sim-header"><span>WEBRTC P2P CHUNK VERIFIER</span><b id="sc-bw">OFFLOAD: 79%</b></div>
          <div class="sim-controls-inline"><button type="button" class="sim-btn" id="sc-get">Fetch 4MB Bundle ⚡</button><button type="button" class="sim-btn" id="sc-bad">Test Tampered Chunk</button></div>
          <pre class="sim-console" id="sc-out">[Go Signaling] 4 WebRTC DataChannels active. IndexedDB warm.</pre>`;
        const out = c.querySelector('#sc-out'), bw = c.querySelector('#sc-bw');
        c.querySelector('#sc-get').addEventListener('click', () => {
          const p = 75 + Math.floor(Math.random() * 20);
          bw.textContent = `OFFLOAD: ${p}%`;
          out.textContent = `├─ Chunk #01 ← Peer_104 [9ms] SHA-256 [VALID]\n└─ Service Worker served bundle with ${p}% origin bandwidth saved.`;
          playMicroSound('tick');
        });
        c.querySelector('#sc-bad').addEventListener('click', () => { out.textContent = `[REJECTED] Hash mismatch on Chunk #03! Re-fetched verified chunk from Peer_104.`; playMicroSound('tick'); });
      }
    },
    'RuralShield AI': {
      render: c => {
        c.innerHTML = `<div class="sim-header"><span>EXPLAINABLE PHISHING DETECTOR</span><b id="rs-sc">RISK: LOW</b></div>
          <div class="sim-controls-inline"><button type="button" class="sim-btn" data-s="bad">Test Scam SMS 🚨</button><button type="button" class="sim-btn" data-s="ok">Test Bank Alert ✓</button></div>
          <pre class="sim-console" id="rs-out">Select a sample message to run ML + Amazon Bedrock explanation.</pre>`;
        const out = c.querySelector('#rs-out'), sc = c.querySelector('#rs-sc');
        c.querySelectorAll('[data-s]').forEach(btn => btn.addEventListener('click', () => {
          if (btn.dataset.s === 'bad') { sc.textContent = 'RISK: CRITICAL (0.96)'; out.textContent = `Untrusted TLD (.xyz) + urgent KYC credential request detected. Do not click.`; }
          else { sc.textContent = 'RISK: SAFE (0.04)'; out.textContent = `Informational UPI transaction notice with zero phishing links.`; }
          playMicroSound('tick');
        }));
      }
    },
    'VibeBridge': {
      render: c => {
        c.innerHTML = `<div class="sim-header"><span>TAURI + MCP BRIDGE</span><b>SANDBOXED</b></div>
          <div class="sim-controls-inline"><button type="button" class="sim-btn" data-m="s">mcp.search_code</button><button type="button" class="sim-btn" data-m="b">Test Path Guard</button></div>
          <pre class="sim-console" id="vb-out">[MCP] Gemini Spark connected to local workspace.</pre>`;
        const out = c.querySelector('#vb-out');
        c.querySelectorAll('[data-m]').forEach(btn => btn.addEventListener('click', () => {
          out.textContent = btn.dataset.m === 's' ? `[AUDIT] 4 matches in src/crdt.ts (READ_WORKSPACE allowed)` : `[BLOCKED] "../../etc/passwd" denied outside workspace boundary.`;
          playMicroSound('tick');
        }));
      }
    },
    'Zentra': {
      render: c => {
        c.innerHTML = `<div class="sim-header"><span>ANDROID ROOM + MVVM FOCUS ENGINE</span><b id="zn-s">SCORE: 91 / 100</b></div>
          <label class="sim-slider">Focus Mins: <input type="range" id="zn-f" min="15" max="240" value="135"></label>
          <label class="sim-slider">Pickups: <input type="range" id="zn-p" min="0" max="60" value="8"></label>
          <pre class="sim-console" id="zn-o">Weighted Focus Score persisted locally via Room.</pre>`;
        const f = c.querySelector('#zn-f'), p = c.querySelector('#zn-p');
        const upd = () => {
          const s = Math.max(12, Math.min(100, Math.round(55 + Number(f.value) * 0.24 - Number(p.value) * 0.85)));
          c.querySelector('#zn-s').textContent = `SCORE: ${s} / 100`;
          c.querySelector('#zn-o').textContent = `Deep Focus ${f.value}m, Pickups ${p.value} → Focus Score ${s}.`;
        };
        f.addEventListener('input', upd); p.addEventListener('input', upd);
      }
    },
    'Argus': {
      render: c => {
        c.innerHTML = `<div class="sim-header"><span>TELEGRAM MODERATION SHIELD</span><b>SQLITE CACHE: 94%</b></div>
          <div class="sim-controls-inline"><button type="button" class="sim-btn" id="ar-r">Simulate Raid ⚡</button><button type="button" class="sim-btn" id="ar-s">Test Scam Msg</button></div>
          <pre class="sim-console" id="ar-o">[Argus] Anti-raid &amp; Gemini content filters armed.</pre>`;
        const out = c.querySelector('#ar-o');
        c.querySelector('#ar-r').addEventListener('click', () => { out.textContent = `[ANTI-RAID] CAPTCHA gate enabled; 48 bot joins quarantined in 85ms.`; playMicroSound('tick'); });
        c.querySelector('#ar-s').addEventListener('click', () => { out.textContent = `[GEMINI] Scam probability 0.98 — message removed &amp; hash cached.`; playMicroSound('tick'); });
      }
    },
    'VeloSphere': {
      render: c => {
        c.innerHTML = `<div class="sim-header"><span>C++17 + OPENGL ES 3.0 LOOP</span><b>60 FPS</b></div>
          <label class="sim-slider">GLSL Speed: <input type="range" id="vs-v" min="1" max="10" value="5"></label>
          <pre class="sim-console" id="vs-o">[NDK] Procedural GLSL terrain shader active.</pre>`;
        c.querySelector('#vs-v').addEventListener('input', e => {
          c.querySelector('#vs-o').textContent = `[GLSL Uniform] u_scrollSpeed = ${(Number(e.target.value) * 2.4).toFixed(1)}`;
        });
      }
    },
    'HazardLens': {
      render: c => {
        c.innerHTML = `<div class="sim-header"><span>3D INDUSTRIAL DIGITAL TWIN</span><b id="hl-r">RADIUS: 185m</b></div>
          <label class="sim-slider">Pressure (bar): <input type="range" id="hl-p" min="10" max="90" value="38"></label>
          <label class="sim-slider">Wind (m/s): <input type="range" id="hl-w" min="1" max="25" value="7"></label>
          <pre class="sim-console" id="hl-o">Thermal flux contours computed across storage vessels.</pre>`;
        const p = c.querySelector('#hl-p'), w = c.querySelector('#hl-w');
        const upd = () => {
          const r = Math.round(65 + Number(p.value) * 2.8 + Number(w.value) * 4.1);
          c.querySelector('#hl-r').textContent = `RADIUS: ${r}m`;
          c.querySelector('#hl-o').textContent = `Downwind vapor dispersion extends ${r}m.`;
        };
        p.addEventListener('input', upd); w.addEventListener('input', upd);
      }
    },
    'Recon Suite': {
      render: c => {
        c.innerHTML = `<div class="sim-header"><span>CONCURRENT OSINT &amp; DNS RECON</span><b>16 WORKERS</b></div>
          <div class="sim-controls-inline"><button type="button" class="sim-btn" id="rc-run">Run Authorized Scan ⚡</button></div>
          <pre class="sim-console" id="rc-o">[Recon Suite] Sublist3r &amp; ThreadPoolExecutor ready.</pre>`;
        c.querySelector('#rc-run').addEventListener('click', () => {
          c.querySelector('#rc-o').textContent = `[+] Discovered 14 subdomains · Generated HTML/PDF report in 0.84s.`;
          playMicroSound('tick');
        });
      }
    }
  };

  // --- 5. INTERACTIVE 3D STAGE VIEWER WITH 3D FLIP TRANSITION ---
  const cards = $$('.project-card');
  const stageCard = $('#spatial-stage-card');
  const dialog = $('#project-dialog');
  const dialogSim = $('#dialog-sim');
  let activeCard = cards[0];
  let dialogTrigger = null;

  function loadStageFromCard(card, animateFlip = true) {
    if (!card || !stageCard) return;
    activeCard = card;
    cards.forEach(c => c.classList.toggle('is-active', c === card));

    const apply = () => {
      const artClone = card.querySelector('.project-art')?.cloneNode(true);
      if (artClone) $('#stage-visual').replaceChildren(artClone);
      $('#stage-kicker').textContent = card.querySelector('.project-meta span')?.textContent || '';
      $('#stage-title').textContent = card.querySelector('h3')?.textContent || '';
      const details = card.querySelector('.project-details');
      const paras = details ? [...details.querySelectorAll('p')] : [];
      $('#stage-desc').textContent = paras[1]?.textContent || card.querySelector('.project-body > p')?.textContent || '';
      const list = $('#stage-highlights');
      list.innerHTML = '';
      if (details) {
        details.querySelectorAll('li').forEach(li => {
          const item = document.createElement('li');
          item.textContent = li.textContent;
          list.appendChild(item);
        });
      }
      const techBox = $('#stage-tech');
      techBox.innerHTML = '';
      card.dataset.tech.split('|').forEach(t => {
        const sp = document.createElement('span');
        sp.textContent = t;
        techBox.appendChild(sp);
      });
      $('#stage-repo').href = card.querySelector('.repo-link')?.href || '#';
      stageCard.classList.remove('is-flipping');
    };

    if (animateFlip && !reducedMotion.matches) {
      stageCard.classList.add('is-flipping');
      playMicroSound('tick');
      setTimeout(apply, 180);
    } else {
      apply();
    }
  }

  function openProjectLab(card, triggerEl) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    dialogTrigger = triggerEl;
    const title = card.querySelector('h3').textContent.trim();
    $('#dialog-title').textContent = title;
    $('#dialog-content').replaceChildren(card.querySelector('.project-details').cloneNode(true));
    $('#dialog-repo').href = card.querySelector('.repo-link').href;
    if (dialogSim && SIMULATORS[title]) SIMULATORS[title].render(dialogSim);
    dialog.showModal();
    playMicroSound('morph');
    $('.dialog-close')?.focus();
  }

  if (cards.length) loadStageFromCard(cards[0], false);

  cards.forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a, summary')) return;
      loadStageFromCard(card, true);
    });
    const summary = card.querySelector('summary');
    if (summary && dialog && typeof dialog.showModal === 'function') {
      summary.setAttribute('aria-haspopup', 'dialog');
      summary.setAttribute('aria-controls', 'project-dialog');
      summary.addEventListener('click', e => {
        e.preventDefault();
        loadStageFromCard(card, true);
        openProjectLab(card, summary);
      });
    }
  });

  $('#stage-open-lab')?.addEventListener('click', () => {
    if (activeCard) openProjectLab(activeCard, $('#stage-open-lab'));
  });
  $('.dialog-close')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', e => {
    const r = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
  });
  dialog?.addEventListener('close', () => dialogTrigger?.focus({ preventScroll: true }));

  // --- 6. CATEGORY & TECHNOLOGY FILTERS + SKILL HOVER PREVIEW ---
  let category = 'all', technology = '';
  const skillPreview = $('#skill-preview-bar');

  function filterProjects() {
    let count = 0;
    let firstVisible = null;
    cards.forEach(card => {
      const visible = (category === 'all' || card.dataset.category.split(' ').includes(category)) &&
        (!technology || card.dataset.tech.split('|').includes(technology));
      card.hidden = !visible;
      if (visible) {
        count++;
        if (!firstVisible) firstVisible = card;
      }
    });
    if (firstVisible && activeCard?.hidden) loadStageFromCard(firstVisible, true);
    $$('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === category)));
    $$('[data-skill]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.skill === technology)));
    $('#project-count').textContent = `${count} ${count === 1 ? 'project' : 'projects'}${technology ? ` using ${technology}` : ''}`;
    $('.skill-selection').hidden = !technology;
    $('#skill-filter-label').textContent = `Built with ${technology}`;
    $('.no-results').hidden = count > 0;
    document.dispatchEvent(new Event('projectfilterchange'));
  }

  $$('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
    category = btn.dataset.filter;
    filterProjects();
    playMicroSound('tick');
  }));

  $$('[data-skill]').forEach(btn => {
    btn.type = 'button';
    btn.disabled = false;
    btn.setAttribute('aria-pressed', 'false');
    const matchingNames = cards
      .filter(c => c.dataset.tech.split('|').includes(btn.dataset.skill))
      .map(c => c.querySelector('h3')?.textContent.trim());
    const badge = document.createElement('small');
    badge.className = 'skill-count';
    badge.textContent = String(matchingNames.length);
    btn.appendChild(badge);

    const showPreview = () => {
      if (skillPreview) skillPreview.textContent = `${btn.dataset.skill} → Used in: ${matchingNames.join(' · ')}`;
    };
    btn.addEventListener('pointerenter', showPreview);
    btn.addEventListener('focus', showPreview);
    btn.addEventListener('click', () => {
      technology = btn.dataset.skill;
      category = 'all';
      filterProjects();
      playMicroSound('morph');
      smoothScrollTo($('#projects'));
    });
  });

  $('#clear-skill')?.addEventListener('click', () => { technology = ''; filterProjects(); playMicroSound('tick'); });
  $('#reset-filters')?.addEventListener('click', () => { category = 'all'; technology = ''; filterProjects(); playMicroSound('tick'); });

  // --- 7. INTERACTIVE ACCORDION JOURNEY TIMELINE ---
  const steps = $$('.timeline-step');
  const timelineFill = $('#timeline-fill');
  steps.forEach((step, idx) => {
    const trigger = step.querySelector('.step-trigger');
    trigger?.addEventListener('click', () => {
      steps.forEach((s, i) => {
        const open = i === idx;
        s.classList.toggle('is-open', open);
        const btn = s.querySelector('.step-trigger');
        btn?.setAttribute('aria-expanded', String(open));
        const icon = btn?.querySelector('i');
        if (icon) icon.textContent = open ? '—' : '+';
      });
      if (timelineFill) timelineFill.style.transform = `scaleY(${((idx + 1) / steps.length).toFixed(3)})`;
      playMicroSound('tick');
    });
  });

  // --- 8. CONTACT FORM, COPY EMAIL & ZERO-REFLOW SCROLL PROGRESS ---
  let toastTimer;
  function notify(msg) {
    clearTimeout(toastTimer);
    $('.toast').textContent = msg;
    $('.toast').classList.add('visible');
    toastTimer = setTimeout(() => $('.toast').classList.remove('visible'), 3600);
  }
  $('.copy-email')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('assishmoncs@gmail.com');
      playMicroSound('tick');
      notify('Email address copied!');
    } catch { notify('Copy unavailable. Select assishmoncs@gmail.com directly.'); }
  });

  const TEMPLATES = {
    internship: "Hi Assishmon, we'd love to discuss an upcoming Software Engineering Internship role with our team.",
    freelance: "Hi Assishmon, I have a full-stack / interactive product build in mind and would love to discuss scope and availability.",
    collab: "Hi Assishmon, really enjoyed exploring your WebRTC, CRDT, and OpenGL ES work — let's collaborate!"
  };
  $$('[data-template]').forEach(btn => btn.addEventListener('click', () => {
    const msg = $('#message');
    if (msg && TEMPLATES[btn.dataset.template]) {
      msg.value = TEMPLATES[btn.dataset.template];
      msg.focus();
      playMicroSound('tick');
    }
  }));

  const form = $('#contact-form'), status = $('#form-status');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity() || form.getAttribute('aria-busy') === 'true') return;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true; form.setAttribute('aria-busy', 'true'); button.textContent = 'Sending…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!res.ok) throw new Error();
      form.reset();
      status.classList.remove('error');
      status.textContent = 'Message sent. Thank you — I’ll reply by email.';
      playMicroSound('morph');
    } catch {
      status.classList.add('error');
      status.textContent = 'Could not confirm delivery. Your message is still here. Try again or email assishmoncs@gmail.com directly.';
    } finally {
      clearTimeout(timeout);
      button.disabled = false; button.textContent = 'Send message ↗'; form.removeAttribute('aria-busy');
    }
  });

  // GPU-composited scroll progress (scaleX) & throttled active section highlight
  const sections = $$('main > section[id]');
  const progressBar = $('.scroll-progress');
  const backTop = $('.back-top');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      if (progressBar) progressBar.style.transform = `scaleX(${p.toFixed(4)})`;
      if (backTop) backTop.hidden = scrollY < 600;
      let current = 'home';
      sections.forEach(s => { if (s.getBoundingClientRect().top <= 180) current = s.id; });
      $$('.nav-links a, .chapter-rail a').forEach(a => {
        if (a.hash === `#${current}`) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
      ticking = false;
    });
  }, { passive: true });
})();
