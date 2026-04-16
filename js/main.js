/**
 * Portfolio Interactive System
 * Features: Particle Network, Text Scramble, Magnetic Buttons, Scroll Animations
 */

(function() {
  'use strict';

  // ==========================================
  // Configuration
  // ==========================================
  const CONFIG = {
    particles: {
      count: 60,
      connectionDistance: 150,
      mouseDistance: 200,
      speed: 0.5,
      color: 'rgba(99, 102, 241, 0.5)'
    },
    animations: {
      staggerDelay: 100,
      revealThreshold: 0.1
    }
  };

  // ==========================================
  // Utility Functions
  // ==========================================
  const utils = {
    throttle: (fn, wait) => {
      let lastTime = 0;
      return (...args) => {
        const now = Date.now();
        if (now - lastTime >= wait) {
          lastTime = now;
          fn.apply(this, args);
        }
      };
    },

    debounce: (fn, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), wait);
      };
    },

    lerp: (start, end, factor) => start + (end - start) * factor,

    random: (min, max) => Math.random() * (max - min) + min,

    clamp: (value, min, max) => Math.min(Math.max(value, min), max)
  };

  // ==========================================
  // Particle Network Background
  // ==========================================
  class ParticleNetwork {
    constructor() {
      this.canvas = document.getElementById('particle-canvas');
      if (!this.canvas) return;
      
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: null, y: null };
      this.animationId = null;
      this.isActive = true;
      
      this.init();
    }

    init() {
      this.resize();
      this.createParticles();
      this.bindEvents();
      this.animate();
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    createParticles() {
      this.particles = [];
      const count = window.matchMedia('(pointer: coarse)').matches 
        ? Math.floor(CONFIG.particles.count / 2) 
        : CONFIG.particles.count;
      
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * CONFIG.particles.speed,
          vy: (Math.random() - 0.5) * CONFIG.particles.speed,
          radius: Math.random() * 2 + 1
        });
      }
    }

    bindEvents() {
      window.addEventListener('resize', utils.debounce(() => {
        this.resize();
        this.createParticles();
      }, 250));

      window.addEventListener('mousemove', utils.throttle((e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      }, 16));

      window.addEventListener('mouseleave', () => {
        this.mouse.x = null;
        this.mouse.y = null;
      });

      // Pause when tab is hidden
      document.addEventListener('visibilitychange', () => {
        this.isActive = document.visibilityState === 'visible';
        if (this.isActive) this.animate();
      });
    }

    drawParticle(particle) {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = CONFIG.particles.color;
      this.ctx.fill();
    }

    drawConnections() {
      for (let i = 0; i < this.particles.length; i++) {
        let connections = 0;
        
        for (let j = i + 1; j < this.particles.length; j++) {
          const dx = this.particles[i].x - this.particles[j].x;
          const dy = this.particles[i].y - this.particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONFIG.particles.connectionDistance && connections < 3) {
            const opacity = (1 - distance / CONFIG.particles.connectionDistance) * 0.3;
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
            this.ctx.lineWidth = 0.5;
            this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
            this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
            this.ctx.stroke();
            connections++;
          }
        }
      }
    }

    updateParticles() {
      this.particles.forEach(particle => {
        // Mouse interaction
        if (this.mouse.x !== null && this.mouse.y !== null) {
          const dx = this.mouse.x - particle.x;
          const dy = this.mouse.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONFIG.particles.mouseDistance) {
            const force = (CONFIG.particles.mouseDistance - distance) / CONFIG.particles.mouseDistance;
            particle.vx += (dx / distance) * force * 0.02;
            particle.vy += (dy / distance) * force * 0.02;
          }
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary check
        if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

        // Damping
        particle.vx = utils.clamp(particle.vx, -2, 2);
        particle.vy = utils.clamp(particle.vy, -2, 2);
        particle.vx *= 0.99;
        particle.vy *= 0.99;
      });
    }

    animate() {
      if (!this.isActive) return;
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.updateParticles();
      this.drawConnections();
      this.particles.forEach(p => this.drawParticle(p));
      
      this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
    }
  }

  // ==========================================
  // Text Scramble Effect
  // ==========================================
  class TextScramble {
    constructor(element, options = {}) {
      this.element = element;
      this.chars = options.chars || '!<>-_\\/[]{}—=+*^?#________';
      this.updateInterval = options.interval || 50;
      this.frame = 0;
      this.queue = [];
      this.isAnimating = false;
    }

    setText(newText) {
      const length = Math.max(this.element.textContent.length, newText.length);
      const promise = new Promise(resolve => this.resolve = resolve);
      
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = this.element.textContent[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 20);
        const end = start + Math.floor(Math.random() * 20);
        this.queue.push({ from, to, start, end });
      }
      
      if (!this.isAnimating) {
        this.isAnimating = true;
        this.update();
      }
      
      return promise;
    }

    update() {
      let output = '';
      let complete = 0;

      for (let i = 0; i < this.queue.length; i++) {
        let { from, to, start, end } = this.queue[i];
        let char = this.queue[i].char;

        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.queue[i].char = char;
          }
          output += char;
        } else {
          output += from;
        }
      }

      this.element.textContent = output;

      if (complete === this.queue.length) {
        this.resolve();
        this.isAnimating = false;
      } else {
        this.frame++;
        requestAnimationFrame(() => this.update());
      }
    }
  }

  // ==========================================
  // Magnetic Button Effect
  // ==========================================
  class MagneticButton {
    constructor(element, options = {}) {
      this.element = element;
      this.strength = options.strength || 0.3;
      this.radius = options.radius || 100;
      
      this.init();
    }

    init() {
      if (window.matchMedia('(pointer: coarse)').matches) return;
      
      this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
      this.element.addEventListener('mouseleave', () => this.onMouseLeave());
    }

    onMouseMove(e) {
      const rect = this.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance < this.radius) {
        const factor = (this.radius - distance) / this.radius;
        const moveX = deltaX * this.strength * factor;
        const moveY = deltaY * this.strength * factor;
        
        this.element.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    }

    onMouseLeave() {
      this.element.style.transform = '';
    }
  }

  // ==========================================
  // Cursor Spotlight Effect
  // ==========================================
  class CursorSpotlight {
    constructor() {
      this.spotlight = document.querySelector('.cursor-spotlight');
      if (!this.spotlight) return;
      
      this.mouse = { x: 0, y: 0 };
      this.current = { x: 0, y: 0 };
      this.isActive = true;
      
      this.init();
    }

    init() {
      document.addEventListener('mousemove', utils.throttle((e) => {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
      }, 16));

      document.addEventListener('mouseleave', () => {
        this.spotlight.style.opacity = '0';
      });

      document.addEventListener('mouseenter', () => {
        this.spotlight.style.opacity = '1';
      });

      this.animate();
    }

    animate() {
      if (!this.isActive) return;
      
      // Smooth follow
      this.current.x = utils.lerp(this.current.x, this.mouse.x, 0.1);
      this.current.y = utils.lerp(this.current.y, this.mouse.y, 0.1);
      
      this.spotlight.style.left = `${this.current.x}px`;
      this.spotlight.style.top = `${this.current.y}px`;
      
      requestAnimationFrame(() => this.animate());
    }
  }

  // ==========================================
  // Scroll Animations
  // ==========================================
  class ScrollAnimations {
    constructor() {
      this.observers = [];
      this.init();
    }

    init() {
      this.initSectionReveal();
      this.initStaggerAnimations();
      this.initParallax();
    }

    initSectionReveal() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: CONFIG.animations.revealThreshold });

      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        observer.observe(el);
      });

      this.observers.push(observer);
    }

    initStaggerAnimations() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animate children with stagger
            const children = entry.target.children;
            Array.from(children).forEach((child, i) => {
              setTimeout(() => {
                child.style.transition = `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${i * 100}ms`;
                child.style.opacity = '1';
                child.style.transform = 'translateY(0)';
              }, 50);
            });
            
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.stagger-children').forEach(el => {
        observer.observe(el);
      });

      this.observers.push(observer);
    }

    initParallax() {
      const shapes = document.querySelectorAll('.shape');
      if (!shapes.length) return;

      let ticking = false;
      
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const scrollY = window.scrollY;
            shapes.forEach((shape, i) => {
              const speed = 0.05 + (i * 0.02);
              shape.style.transform = `translateY(${scrollY * speed}px)`;
            });
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    }
  }

  // ==========================================
  // Navigation System
  // ==========================================
  class Navigation {
    constructor() {
      this.nav = document.getElementById('mainNav');
      this.burger = document.getElementById('navBurger');
      this.mobileNav = document.getElementById('mobileNav');
      this.links = document.querySelectorAll('.nav-link');
      this.sections = document.querySelectorAll('section[id]');
      
      this.init();
    }

    init() {
      this.initScrollEffect();
      this.initMobileNav();
      this.initActiveLink();
      this.initSmoothScroll();
    }

    initScrollEffect() {
      let lastScroll = 0;
      
      window.addEventListener('scroll', utils.throttle(() => {
        const currentScroll = window.scrollY;
        
        // Add/remove scrolled class
        this.nav.classList.toggle('scrolled', currentScroll > 50);
        
        lastScroll = currentScroll;
      }, 100));
    }

    initMobileNav() {
      if (!this.burger || !this.mobileNav) return;

      this.burger.addEventListener('click', () => {
        const isOpen = this.mobileNav.classList.toggle('open');
        this.burger.classList.toggle('open', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      this.mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          this.mobileNav.classList.remove('open');
          this.burger.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }

    initActiveLink() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            this.links.forEach(link => {
              link.classList.toggle('active', link.dataset.section === id);
            });
          }
        });
      }, { threshold: 0.3 });

      this.sections.forEach(section => observer.observe(section));
    }

    initSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
          const target = document.querySelector(link.getAttribute('href'));
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    }
  }

  // ==========================================
  // Theme Manager
  // ==========================================
  class ThemeManager {
    constructor() {
      this.toggle = document.getElementById('themeToggle');
      this.html = document.documentElement;
      this.init();
    }

    init() {
      // Load saved theme
      const saved = localStorage.getItem('theme') || 'dark';
      this.html.setAttribute('data-theme', saved);

      if (this.toggle) {
        this.toggle.addEventListener('click', () => this.toggleTheme());
      }
    }

    toggleTheme() {
      const current = this.html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      
      this.html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      
      // Update particle color
      CONFIG.particles.color = next === 'dark' 
        ? 'rgba(99, 102, 241, 0.5)' 
        : 'rgba(99, 102, 241, 0.3)';
    }
  }

  // ==========================================
  // Skills Tabs
  // ==========================================
  class SkillsTabs {
    constructor() {
      this.tabs = document.querySelectorAll('.tab-btn');
      this.panels = document.querySelectorAll('.skills-panel');
      this.init();
    }

    init() {
      this.tabs.forEach(tab => {
        tab.addEventListener('click', () => this.switchTab(tab));
      });
    }

    switchTab(activeTab) {
      const target = activeTab.dataset.tab;

      // Update tabs
      this.tabs.forEach(tab => tab.classList.remove('active'));
      activeTab.classList.add('active');

      // Update panels
      this.panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `tab-${target}`) {
          panel.classList.add('active');
          
          // Animate skill bars
          panel.querySelectorAll('.skill-card').forEach((card, i) => {
            card.classList.remove('in-view');
            setTimeout(() => card.classList.add('in-view'), i * 80);
          });
        }
      });
    }
  }

  // ==========================================
  // Contact Form
  // ==========================================
  class ContactForm {
    constructor() {
      this.form = document.getElementById('contactForm');
      this.success = document.getElementById('formSuccess');
      this.init();
    }

    init() {
      if (!this.form) return;

      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
      e.preventDefault();

      const btn = this.form.querySelector('.btn-submit');
      const btnText = btn.querySelector('span');
      const originalText = btnText.textContent;

      btn.disabled = true;
      btnText.textContent = 'Sending...';

      try {
        const response = await fetch(this.form.action, {
          method: 'POST',
          body: new FormData(this.form),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          this.form.reset();
          this.showMessage('Message sent! I\'ll get back to you soon.', false);
        } else {
          throw new Error('Submission failed');
        }
      } catch (error) {
        this.showMessage('Could not send message. Please try again or email me directly.', true);
      } finally {
        btn.disabled = false;
        btnText.textContent = originalText;
      }
    }

    showMessage(text, isError) {
      this.success.textContent = text;
      this.success.classList.toggle('error', isError);
      this.success.classList.add('show');
      
      setTimeout(() => {
        this.success.classList.remove('show');
      }, 5000);
    }
  }

  // ==========================================
  // Scroll Progress
  // ==========================================
  class ScrollProgress {
    constructor() {
      this.bar = document.querySelector('.scroll-progress');
      if (!this.bar) return;
      
      this.init();
    }

    init() {
      window.addEventListener('scroll', utils.throttle(() => {
        const scrolled = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? (scrolled / max) * 100 : 0;
        this.bar.style.width = `${progress}%`;
      }, 50));
    }
  }

  // ==========================================
  // Hero Animations
  // ==========================================
  class HeroAnimations {
    constructor() {
      this.profile = document.querySelector('.profile-wrap');
      this.content = document.querySelector('.hero-content');
      this.nameEl = document.getElementById('typingName');
      this.titleEl = document.getElementById('typingTitle');
      
      this.init();
    }

    init() {
      // Initial reveal animations
      setTimeout(() => {
        if (this.profile) {
          this.profile.style.opacity = '1';
          this.profile.style.transform = 'scale(1)';
        }
      }, 200);

      setTimeout(() => {
        if (this.content) {
          this.content.style.opacity = '1';
          this.content.style.transform = 'translateY(0)';
        }
      }, 400);

      // Text scramble effect
      setTimeout(() => {
        if (this.nameEl) {
          const scrambler = new TextScramble(this.nameEl);
          scrambler.setText("Hi, I'm Assishmon C S");
        }
      }, 800);

      setTimeout(() => {
        if (this.titleEl) {
          const scrambler = new TextScramble(this.titleEl);
          scrambler.setText('CSE Student | Frontend-Focused Builder');
        }
      }, 1400);
    }
  }

  // ==========================================
  // Initialize Everything
  // ==========================================
  function init() {
    // Create scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);

    // Initialize all modules
    new ParticleNetwork();
    new CursorSpotlight();
    new Navigation();
    new ThemeManager();
    new ScrollAnimations();
    new SkillsTabs();
    new ContactForm();
    new ScrollProgress();
    
    // Initialize hero animations
    setTimeout(() => new HeroAnimations(), 100);

    // Initialize magnetic buttons
    document.querySelectorAll('.btn, .nav-link').forEach(btn => {
      new MagneticButton(btn, { strength: 0.2 });
    });

    // Set initial states for animated elements
    document.querySelectorAll('.profile-wrap').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'scale(0.9)';
      el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    document.querySelectorAll('.hero-content').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
