# Assishmon C S — Portfolio

A futuristic AI-developer portfolio website built with pure HTML, CSS, and JavaScript.

## File Structure
```
portfolio/
├── index.html          — Main HTML file
├── css/
│   ├── style.css       — Main styles, layout, components
│   └── animations.css  — All animation definitions
├── js/
│   ├── particles.js    — Interactive particle background system
│   └── main.js         — Core JS: cursor, typing, scroll, tilt, tabs, etc.
└── README.md
```

## Features
- 🌟 Cinematic profile reveal animation
- ✍️ Typing intro sequence
- 🔵 Interactive AI-style particle background
- 🖱️ Custom magnetic cursor with ring lag
- 🌙 Dark / Light mode toggle (persists via localStorage)
- 📱 Fully responsive (mobile hamburger nav)
- 🃏 3D tilt hover on cards
- 📊 Animated skill progress bars
- 🔢 Skills tab switcher (Web / App)
- ✉️ Contact form with success state
- 🎞️ Scroll-triggered section reveals
- 📈 Scroll progress bar
- ✨ Button ripple effects

## Customization
1. **Profile Photo**: Replace the SVG placeholder in `.profile-img-wrap` with an `<img>` tag
2. **GitHub Links**: Replace `href="#"` on `.project-link` elements with your actual URLs
3. **Contact info**: Update email/LinkedIn/GitHub in the contact section
4. **Skills**: Adjust `--w` CSS variable on `.skill-fill` elements for percentages

## Usage
Open `index.html` directly in any modern browser. No build step required.

## Fonts Used (Google Fonts)
- **Syne** — Display/headings
- **DM Mono** — Monospace accents
- **Outfit** — Body text

## Design System
- Primary accent: `#a855f7` (purple)
- Secondary accent: `#7c3aed` (deep purple)
- Cyan accent: `#06b6d4`
- Background (dark): `#080810`
