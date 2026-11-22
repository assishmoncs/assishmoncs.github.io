/* Zero-Lag Native Scroll + GPU-Composited 3D Scroll Transitions
   Syncs Hero entrance with 3D Preloader reveal */
(() => {
  'use strict';

  function prepareSplitWords() {
    const lead = document.getElementById('dossier-lead');
    if (!lead || lead.dataset.splitDone) return;
    const text = lead.textContent.trim();
    const accentWords = new Set(['working', 'software', 'distributed', 'systems,', 'shaders,', 'AI', 'pipelines']);
    lead.innerHTML = text.split(/\s+/).map(word => {
      const cls = accentWords.has(word) ? 'scrub-word is-accent' : 'scrub-word';
      return `<span class="${cls}">${word}</span>`;
    }).join(' ');
    lead.dataset.splitDone = 'true';
  }

  let heroAnimated = false;
  function playHeroEntrance() {
    if (heroAnimated || !window.gsap) return;
    heroAnimated = true;
    gsap.from('.reveal-line > span', {
      yPercent: 112,
      rotateX: -48,
      opacity: 0,
      transformOrigin: '50% 50% -26px',
      transformPerspective: 1000,
      duration: 0.85,
      stagger: 0.09,
      ease: 'power4.out'
    });
    gsap.from('.status-strip, .hero-lead, .hero-cta-row, .hero-meta-strip', {
      y: 18,
      opacity: 0,
      duration: 0.65,
      stagger: 0.06,
      delay: 0.12,
      ease: 'power3.out'
    });
  }

  document.addEventListener('preloaderDone', playHeroEntrance, { once: true });

  window.addEventListener('load', () => {
    prepareSplitWords();
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // Fallback in case preloader already finished before load
    const pre = document.getElementById('preloader-3d');
    if (!pre || pre.hidden || pre.dataset.done) playHeroEntrance();

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // 1. Hero 3D Architectural Departure on Scroll
      gsap.to('.hero-editorial', {
        y: -60,
        rotateX: -14,
        scale: 0.93,
        opacity: 0.35,
        transformOrigin: 'center top',
        transformPerspective: 1200,
        ease: 'none',
        scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true }
      });

      // 2. 3D Venetian Architectural Louver Shutter Transitions
      gsap.utils.toArray('.shutter-divider').forEach(shutter => {
        const blades = shutter.querySelectorAll('.shutter-blade');
        if (!blades.length) return;
        gsap.fromTo(blades,
          { rotateX: -82, opacity: 0.3, transformPerspective: 900 },
          {
            rotateX: 82,
            opacity: 0.95,
            stagger: 0.06,
            ease: 'none',
            scrollTrigger: { trigger: shutter, start: 'top 95%', end: 'bottom 10%', scrub: true }
          }
        );
      });

      // 3. Dual-Track Opposing Kinetic Marquee
      const trackA = document.getElementById('marquee-track-a');
      const trackB = document.getElementById('marquee-track-b');
      if (trackA) {
        gsap.fromTo(trackA, { xPercent: 0 }, {
          xPercent: -18,
          ease: 'none',
          scrollTrigger: { trigger: '.kinetic-marquee', start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }
      if (trackB) {
        gsap.fromTo(trackB, { xPercent: -18 }, {
          xPercent: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.kinetic-marquee', start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }

      // 4. 3D Cylindrical Drum-Roll Headlines
      gsap.utils.toArray('.section h2').forEach(h2 => {
        gsap.fromTo(h2,
          { rotateX: -72, y: 28, opacity: 0.15, transformOrigin: '50% 50% -32px', transformPerspective: 1000 },
          {
            rotateX: 0, y: 0, opacity: 1,
            ease: 'none',
            scrollTrigger: { trigger: h2, start: 'top 94%', end: 'top 64%', scrub: true }
          }
        );
      });

      // 5. Hinged Blueprint 3D Unfold on Stage Viewer
      const stageCard = document.getElementById('spatial-stage-card');
      if (stageCard) {
        gsap.fromTo(stageCard,
          { opacity: 0.25, y: 60, rotateX: 24, scale: 0.92, transformOrigin: '50% 100%', transformPerspective: 1300 },
          {
            opacity: 1, y: 0, rotateX: 0, scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: stageCard, start: 'top 95%', end: 'top 48%', scrub: true }
          }
        );
      }

      // 6. Deep-Space Z-Axis Card Emergence + Scroll-Velocity Jelly Tilt
      const gallery = document.getElementById('project-gallery');
      gsap.utils.toArray('.project-card').forEach((card, i) => {
        const col = i % 3;
        const startRotY = col === 0 ? -18 : col === 2 ? 18 : 0;
        const startX = col === 0 ? -24 : col === 2 ? 24 : 0;
        gsap.fromTo(card,
          { opacity: 0.15, x: startX, y: 60, rotateX: 20, rotateY: startRotY, scale: 0.9, transformPerspective: 1100 },
          {
            opacity: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, scale: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: card, start: 'top 95%', end: 'top 60%', scrub: true }
          }
        );
      });

      if (gallery) {
        const setSkew = gsap.quickTo(gallery, 'skewY', { duration: 0.35, ease: 'power3.out' });
        ScrollTrigger.create({
          trigger: gallery,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: self => {
            const v = Math.max(-3.0, Math.min(3.0, self.getVelocity() / -650));
            setSkew(v);
          },
          onLeave: () => setSkew(0),
          onLeaveBack: () => setSkew(0)
        });
      }

      // 7. Scroll-Scrubbed Split-Word Illumination in Dossier
      const words = gsap.utils.toArray('#dossier-lead .scrub-word');
      if (words.length) {
        gsap.to(words, {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: { trigger: '#dossier-lead', start: 'top 86%', end: 'bottom 48%', scrub: true }
        });
      }

      // 8. Portrait Architectural Clip-Path Unveil + Internal Scale-Out + 3D Depth Float
      const portraitStage = document.querySelector('.portrait-stage');
      const portrait = document.getElementById('portrait-card');
      const portraitImg = portrait?.querySelector('img');
      if (portrait && portraitStage) {
        gsap.fromTo(portrait,
          { clipPath: 'inset(16% 10% 16% 10%)', opacity: 0.25 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: portraitStage, start: 'top 92%', end: 'top 42%', scrub: true }
          }
        );
        gsap.fromTo(portraitStage,
          { y: 38, rotateY: -12, rotateX: 6, transformPerspective: 1200 },
          {
            y: -18, rotateY: 5, rotateX: -3,
            ease: 'none',
            scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true }
          }
        );
        if (portraitImg) {
          gsap.fromTo(portraitImg,
            { scale: 1.2 },
            {
              scale: 1.0,
              ease: 'none',
              scrollTrigger: { trigger: portraitStage, start: 'top 92%', end: 'top 36%', scrub: true }
            }
          );
        }
      }

      // 9. GPU-Only Vertical Timeline Rail (scaleY)
      const timelineFill = document.getElementById('timeline-fill');
      const timeline = document.getElementById('journey-timeline');
      if (timelineFill && timeline) {
        gsap.fromTo(timelineFill,
          { scaleY: 0.2 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: timeline, start: 'top 80%', end: 'bottom 55%', scrub: true }
          }
        );
      }

      // 10. 3D Depth-Deck Flip-Open Cascade for Technology Matrix Rows
      gsap.utils.toArray('.skill-row').forEach((row, idx) => {
        gsap.fromTo(row,
          { opacity: 0.2, y: 38, rotateX: 24, rotateY: idx % 2 === 0 ? -5 : 5, transformOrigin: 'center top', transformPerspective: 1000 },
          {
            opacity: 1, y: 0, rotateX: 0, rotateY: 0,
            ease: 'none',
            scrollTrigger: { trigger: row, start: 'top 95%', end: 'top 65%', scrub: true }
          }
        );
      });

      // 11. 3D Hinged Architectural Contact Spread
      const contactSpread = document.querySelector('.contact-spread');
      if (contactSpread) {
        gsap.fromTo(contactSpread,
          { opacity: 0.3, y: 60, rotateX: 18, scale: 0.94, transformPerspective: 1200 },
          {
            opacity: 1, y: 0, rotateX: 0, scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: contactSpread, start: 'top 95%', end: 'top 52%', scrub: true }
          }
        );
      }

      document.addEventListener('projectfilterchange', () => {
        requestAnimationFrame(() => ScrollTrigger.refresh());
      });
    });
  });
})();
