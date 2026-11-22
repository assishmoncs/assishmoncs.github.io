# Assishmon C S — Spatial Systems & 3D Engineering Portfolio

A Swiss-architectural static developer portfolio featuring a real-time Three.js Chromatic Glass Prism & 3D Gyroscope scene, GSAP ScrollTrigger 3D perspective transitions, an interactive 3D project stage viewer with live architecture simulators for all nine projects, and a warm alabaster / midnight blueprint theme switcher.

Domain: [assishmoncs.tech](https://assishmoncs.tech)

## File Structure

```text
portfolio/
├── CNAME
├── index.html
├── README.md
├── assets/
│   ├── favicon.ico
│   ├── profile.png
│   └── resume.pdf
├── css/
│   └── style.css
├── data/
│   └── projects.json
├── js/
│   ├── journey.js
│   ├── main.js
│   ├── scene.js
│   └── theme.js
└── scripts/
    ├── check.mjs
    ├── render-projects.mjs
    └── serve.mjs
```

## Local Preview & Verification

```sh
node scripts/render-projects.mjs
node scripts/check.mjs
node scripts/serve.mjs
```

Visit `http://127.0.0.1:8000` to preview locally. No build step or package installation is required for static hosting on GitHub Pages.
