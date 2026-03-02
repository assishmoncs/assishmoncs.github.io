(function () {
  'use strict';

  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];
  const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, prevX: -9999, prevY: -9999 };

  const PARTICLE_COUNT = window.innerWidth < 600 ? 45 : 85;
  const CONNECTION_DIST = 140;
  const REPEL_DIST = 110;
  const REPEL_STRENGTH = 2.8;
  const VELOCITY_INFLUENCE = 0.18;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function getAccentColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'light' ? { r: 124, g: 58, b: 237 } : { r: 168, g: 85, b: 247 };
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      ox: 0,
      oy: 0,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r: Math.random() * 1.8 + 0.8,
      opacity: Math.random() * 0.45 + 0.18,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(createParticle());
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function update() {
    const c = getAccentColor();

    mouse.vx = mouse.x - mouse.prevX;
    mouse.vy = mouse.y - mouse.prevY;
    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;

    particles.forEach(p => {
      p.pulse += 0.011;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_DIST && dist > 0) {
        const norm = dist / REPEL_DIST;
        const falloff = (1 - norm) * (1 - norm);
        const pushX = (dx / dist) * falloff * REPEL_STRENGTH;
        const pushY = (dy / dist) * falloff * REPEL_STRENGTH;
        const velInfluence = falloff * VELOCITY_INFLUENCE;
        p.ox = lerp(p.ox, pushX + mouse.vx * velInfluence, 0.22);
        p.oy = lerp(p.oy, pushY + mouse.vy * velInfluence, 0.22);
      } else {
        p.ox = lerp(p.ox, 0, 0.06);
        p.oy = lerp(p.oy, 0, 0.06);
      }
    });

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const rx = (a.x + a.ox) - (b.x + b.ox);
        const ry = (a.y + a.oy) - (b.y + b.oy);
        const dist = Math.sqrt(rx * rx + ry * ry);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${c.r},${c.g},${c.b},${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.moveTo(a.x + a.ox, a.y + a.oy);
          ctx.lineTo(b.x + b.ox, b.y + b.oy);
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      const px = p.x + p.ox;
      const py = p.y + p.oy;
      const pulseR = p.r + Math.sin(p.pulse) * 0.35;
      const alpha = p.opacity + Math.sin(p.pulse) * 0.08;
      ctx.beginPath();
      ctx.arc(px, py, pulseR, 0, Math.PI * 2);
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
