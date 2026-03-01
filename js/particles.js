/**
 * PARTICLE SYSTEM — AI Network Aesthetic
 * Draws interconnected nodes that respond to mouse
 */

(function () {
  'use strict';

  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: -9999, y: -9999 };
  const PARTICLE_COUNT = Math.min(window.innerWidth < 600 ? 40 : 80, 100);
  const CONNECTION_DIST = 140;
  const MOUSE_REPEL_DIST = 100;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function getAccentColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'light'
      ? { r: 124, g: 58, b: 237 }
      : { r: 168, g: 85, b: 247 };
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(createParticle());
    }
  }

  function update() {
    const c = getAccentColor();

    particles.forEach(p => {
      p.pulse += 0.012;
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges softly
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      // Mouse repel
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_REPEL_DIST && dist > 0) {
        const force = (MOUSE_REPEL_DIST - dist) / MOUSE_REPEL_DIST;
        p.x += (dx / dist) * force * 1.5;
        p.y += (dy / dist) * force * 1.5;
      }
    });

    ctx.clearRect(0, 0, W, H);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.2;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      const pulseR = p.r + Math.sin(p.pulse) * 0.4;
      const alpha = p.opacity + Math.sin(p.pulse) * 0.1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(update);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  resize();
  initParticles();
  update();
})();
