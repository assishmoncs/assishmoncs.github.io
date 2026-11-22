/* 1. 3D WebGL Preloader (Spinning Liquid-Chrome Core + Camera Zoom-Through Curtain)
   2. Post-Intro Scroll-Driven 3D GLSL Liquid-Metal Substance (100% GPU Shaders, Zero Lag)
      Awakens after #home and morphs continuously across scroll:
      Projects: Molten Liquid Chrome Orb -> About: Spiked Ferrofluid Crystal -> Skills/Contact: Liquid Torus Sculpture */
(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');

  // =========================================================================
  // PART A: 3D WEBGL LOADING SCREEN WITH CAMERA ZOOM-THROUGH TRANSITION
  // =========================================================================
  const preloader = document.getElementById('preloader-3d');
  const preCanvas = document.getElementById('preloader-canvas');
  const prePct = document.getElementById('preloader-pct');
  const preBar = document.getElementById('preloader-bar');

  function finishPreloader() {
    if (!preloader || preloader.dataset.done) return;
    preloader.dataset.done = 'true';
    preloader.classList.add('is-leaving');
    document.dispatchEvent(new Event('preloaderDone'));
    setTimeout(() => {
      preloader.hidden = true;
    }, 780);
  }

  if (preloader) {
    if (reduced.matches) {
      preloader.hidden = true;
      document.dispatchEvent(new Event('preloaderDone'));
    } else {
      let preRaf = 0;
      let preRenderer = null;
      let progress = 0;
      let dismissed = false;

      const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        cancelAnimationFrame(preRaf);
        if (preRenderer) {
          try { preRenderer.dispose(); } catch { /* ignore */ }
        }
        finishPreloader();
      };

      // Allow instant click/tap to skip
      preloader.addEventListener('click', dismiss, { once: true });

      if (window.THREE && preCanvas) {
        try {
          preRenderer = new THREE.WebGLRenderer({ canvas: preCanvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
          preRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
          preRenderer.setSize(window.innerWidth, window.innerHeight, false);

          const pScene = new THREE.Scene();
          const pCam = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 50);
          pCam.position.set(0, 0, 5.2);

          pScene.add(new THREE.AmbientLight(0xffffff, 0.8));
          const pLight1 = new THREE.DirectionalLight(0xff451a, 2.2);
          pLight1.position.set(4, 4, 4);
          pScene.add(pLight1);
          const pLight2 = new THREE.DirectionalLight(0x1c4ed8, 2.0);
          pLight2.position.set(-4, -3, 3);
          pScene.add(pLight2);

          const pGroup = new THREE.Group();
          pScene.add(pGroup);

          const coreGeo = new THREE.OctahedronGeometry(0.92, 2);
          const coreMat = new THREE.MeshStandardMaterial({
            color: 0xeae5dc,
            metalness: 0.88,
            roughness: 0.14,
            flatShading: true
          });
          const core = new THREE.Mesh(coreGeo, coreMat);
          pGroup.add(core);

          const wire = new THREE.LineSegments(
            new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.32, 1)),
            new THREE.LineBasicMaterial({ color: 0xff451a, transparent: true, opacity: 0.72 })
          );
          pGroup.add(wire);

          const r1 = new THREE.Mesh(
            new THREE.TorusGeometry(1.58, 0.024, 16, 96),
            new THREE.MeshStandardMaterial({ color: 0x1c4ed8, metalness: 0.7, roughness: 0.2 })
          );
          const r2 = new THREE.Mesh(
            new THREE.TorusGeometry(1.88, 0.016, 16, 96),
            new THREE.MeshStandardMaterial({ color: 0xff451a, metalness: 0.6, roughness: 0.25 })
          );
          pGroup.add(r1, r2);

          const startTime = performance.now();
          const duration = 1150; // Crisp 1.15s 3D assembly + zoom-through

          const tickPre = now => {
            if (dismissed) return;
            const elapsed = now - startTime;
            progress = Math.min(1, elapsed / duration);
            const eased = 1 - Math.pow(1 - progress, 3);

            if (prePct) prePct.textContent = `${String(Math.round(eased * 100)).padStart(2, '0')}%`;
            if (preBar) preBar.style.transform = `scaleX(${eased.toFixed(4)})`;

            core.rotation.y = elapsed * 0.0024;
            core.rotation.x = elapsed * 0.0014;
            wire.rotation.y = -elapsed * 0.0016;
            r1.rotation.x = Math.PI * 0.35 + elapsed * 0.002;
            r1.rotation.y = elapsed * 0.0012;
            r2.rotation.y = -elapsed * 0.0022;
            r2.rotation.z = elapsed * 0.0015;

            // Dramatic 3D camera zoom-through in final 20%
            if (progress > 0.8) {
              const zoomT = (progress - 0.8) / 0.2;
              pCam.position.z = 5.2 - zoomT * zoomT * 3.8;
              pGroup.scale.setScalar(1 + zoomT * 0.45);
            }

            preRenderer.render(pScene, pCam);

            if (progress < 1) {
              preRaf = requestAnimationFrame(tickPre);
            } else {
              dismiss();
            }
          };
          preRaf = requestAnimationFrame(tickPre);
        } catch {
          setTimeout(dismiss, 450);
        }
      } else {
        // Offline fast fallback
        const start = performance.now();
        const tickFallback = now => {
          if (dismissed) return;
          const p = Math.min(1, (now - start) / 650);
          if (prePct) prePct.textContent = `${String(Math.round(p * 100)).padStart(2, '0')}%`;
          if (preBar) preBar.style.transform = `scaleX(${p.toFixed(4)})`;
          if (p < 1) preRaf = requestAnimationFrame(tickFallback);
          else dismiss();
        };
        preRaf = requestAnimationFrame(tickFallback);
      }
    }
  }

})();
