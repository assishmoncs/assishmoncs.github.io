/* Scroll journey: the landing fades, while each section arrives in normal document flow. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let queued = false;
  function updateHero() {
    queued = false;
    if (reduced.matches) { hero.style.removeProperty('--hero-opacity'); return; }
    const bounds = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, Math.min(bounds.height * .7, innerHeight * .65))));
    hero.style.setProperty('--hero-opacity', String(1 - progress * .8));
  }
  function queueHero() { if (!queued) { queued = true; requestAnimationFrame(updateHero); } }
  window.addEventListener('scroll', queueHero, { passive:true });
  window.addEventListener('resize', queueHero);
  reduced.addEventListener('change', queueHero);
  updateHero();

  // The page remains fully readable if the CDN or ScrollTrigger is unavailable.
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const motion = gsap.matchMedia();
  motion.add('(prefers-reduced-motion: no-preference)', () => {
    ['#about', '#skills', '#contact'].forEach(selector => {
      const section = document.querySelector(selector);
      gsap.fromTo(section, { y:28, opacity:.72 }, {
        y:0, opacity:1, ease:'none',
        scrollTrigger: { trigger:section, start:'top 95%', end:'top 65%', scrub:true }
      });
    });
    const gallery = document.querySelector('#project-gallery');
    gsap.fromTo(gallery, { y:42, opacity:.68 }, {
      y:0, opacity:1, ease:'none',
      scrollTrigger: { trigger:'#projects', start:'top 85%', end:'top 30%', scrub:.5, invalidateOnRefresh:true }
    });
    const refresh = () => requestAnimationFrame(() => ScrollTrigger.refresh());
    document.addEventListener('projectfilterchange', refresh);
    return () => document.removeEventListener('projectfilterchange', refresh);
  });
})();
