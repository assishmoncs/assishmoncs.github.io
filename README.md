# Assishmon C S — Developer Portfolio

A static portfolio for full-stack applications, distributed systems, AI tools, and native experiences. Built with HTML, CSS, and dependency-free JavaScript.

Domain: [assishmoncs.tech](https://assishmoncs.tech)

## Experience

- An animated ribbon hero with scroll and pointer response, a pause control, and a static SVG fallback. It stops animating off-screen, in background tabs, and when reduced motion is requested. Pixel density and frame rate are capped for mobile devices.
- A vertical stack of nine projects, with PairPad, ShadowCast, and RuralShield AI featured first. Category filters and technology buttons connect skills to concrete work.
- Project notes open in keyboard-accessible dialogs; native expandable details work without JavaScript.
- A landing fade and section-by-section scroll journey, with a GSAP ScrollTrigger entrance for the project stack and reduced-motion support.
- Dark and light themes, saved when browser storage is available.
- Responsive navigation, active-section indication, reading progress, a skip link, and visible focus states.
- Resume download, social links, copy-email feedback, and the existing Formspree contact endpoint. Failed submissions preserve the draft; requests time out after 15 seconds.
- Static content and metadata remain readable without JavaScript. Project illustrations are conceptual diagrams, not application screenshots.

## Preview

No installation or build is required. Open `index.html`, or use Node.js for the local server:

```sh
node scripts/serve.mjs
```

Visit [the local preview](http://127.0.0.1:8000). The server binds only to loopback. Stop it with Ctrl+C. The site can be hosted by any static host; the existing `CNAME` is retained.

## Edit project content

Project descriptions and technology mappings live in `data/projects.json`. After changing them, regenerate the static cards:

```sh
node scripts/render-projects.mjs
node scripts/check.mjs
```

Commit both the data and the updated `index.html`. This optional authoring helper runs locally; the website never fetches the JSON at runtime. Other sections are edited directly in `index.html`.

## Files

```text
index.html                 Static page, metadata, and generated project cards
css/style.css              Themes, layouts, and responsive/motion rules
js/theme.js                Early saved-theme application
js/main.js                 Navigation, filtering, dialogs, contact, and feedback
js/scene.js                Dependency-free ribbon canvas renderer
js/journey.js              Landing fade and GSAP scroll transitions
data/projects.json         Project content supplied by the portfolio owner
scripts/render-projects.mjs Optional static-card generator
scripts/serve.mjs          Loopback preview server
scripts/check.mjs          Content, reference, and asset checks
assets/                   Existing portrait, favicon, and resume
CNAME                     Existing custom-domain configuration
```

## Local verification

Run `node scripts/check.mjs` and `node --check` on the JavaScript files. Browser checks should cover 320px, 390px, tablet, and desktop widths; both themes; filters and empty results; dialogs and Escape focus return; mobile navigation; and keyboard-only access.

For isolated failure scenarios, start the server with `node scripts/serve.mjs --test-fixtures`. These query modes are available only with that flag:

- `?test=form-success`, `?test=form-error`, `?test=form-offline`: mocked fetch responses; no external message is sent.
- `?test=no-js`: strips scripts from the served document.
- `?test=no-canvas`: simulates an unavailable canvas context.
- `?test=reduced-motion`: simulates the JavaScript media-query preference. Also check the real OS/browser preference to verify CSS behavior.
- `?test=no-storage`: simulates unavailable local storage.

All fixture forms target a local non-delivering route, including the no-JavaScript fixture. The original HTML is never changed by fixtures. Test fixtures are not enabled by normal preview or static hosting.

## External services

Google Fonts supplies Manrope and Share Tech Mono, with system-font fallbacks. GSAP and ScrollTrigger load from cdnjs; the content remains accessible if they are unavailable. The contact form uses the existing Formspree endpoint; actual inbox delivery depends on that account and was not tested by sending a real message. Project details are based on owner-supplied information; no impact metrics, live demos, or fabricated screenshots are included.
