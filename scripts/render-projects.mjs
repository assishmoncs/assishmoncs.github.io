// Optional content-authoring helper. The resulting index.html is standalone;
// visitors need no build step, JSON fetch, or JavaScript to read the projects.
import { readFileSync, writeFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const projects = JSON.parse(readFileSync(new URL('data/projects.json', root), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const artwork = [
  `<div class="project-art pairpad-art" aria-hidden="true"><div class="mini-editor"><div class="editor-top"><i></i><i></i><i></i><span>workspace.ts</span><b>2 connected</b></div><div class="code-line"><small>01</small><span class="code-purple">const</span> workspace = {</div><div class="code-line"><small>02</small>&nbsp; ideas: <span class="code-green">'better together'</span>,</div><div class="code-line"><small>03</small>&nbsp; possibilities: <span class="code-purple">Infinity</span></div><div class="code-line"><small>04</small>};<span class="remote-cursor">You</span></div><div class="editor-bottom">● Shared state <span>CRDT / REAL-TIME</span></div></div></div>`,
  `<div class="project-art shadowcast-art" aria-hidden="true"><svg viewBox="0 0 400 220"><g fill="none" stroke="#a6a0ed" stroke-opacity=".4"><path d="M200 110 80 55 72 160 200 110 320 55 330 160 200 110 200 28 320 55M80 55 200 28M72 160 200 195 330 160"/><circle cx="200" cy="110" r="72" stroke-dasharray="3 7"/></g><g fill="#252137" stroke="#aba1ff"><circle cx="80" cy="55" r="10"/><circle cx="72" cy="160" r="10"/><circle cx="320" cy="55" r="10"/><circle cx="330" cy="160" r="10"/><circle cx="200" cy="28" r="8"/><circle cx="200" cy="195" r="8"/><circle cx="200" cy="110" r="28"/></g><path d="m188 110 8 8 17-17" stroke="#c7bcff" stroke-width="2" fill="none"/><g fill="#c7bcff"><circle cx="140" cy="83" r="3"/><circle cx="265" cy="135" r="3"/></g></svg><span class="art-caption">PEER → PEER / VERIFIED CHUNKS</span></div>`,
  `<div class="project-art shield-art" aria-hidden="true"><div class="shield-rings"></div><svg viewBox="0 0 100 115"><path d="M50 5 87 20v36c0 25-37 49-37 49S13 81 13 56V20Z" fill="#1b3432" stroke="#8ed1bf" stroke-width="1.5"/><path d="m34 54 11 11 23-25" fill="none" stroke="#a5e1d0" stroke-width="3"/></svg><span class="art-caption">DETECT → EXPLAIN → PROTECT</span></div>`
];
const card = (p, i) => `
        <article class="project-card${i < 3 ? ' featured' : ''}" data-category="${escape(p.category.join(' '))}" data-tech="${escape(p.tech.join('|'))}">
          ${artwork[i] || ''}
          <div class="project-body"><div class="project-meta"><span>${String(i + 1).padStart(2, '0')} / ${escape(p.label.toUpperCase())}</span><span aria-hidden="true">${p.symbol || '↗'}</span></div>
            <h3>${escape(p.name)}</h3><p>${escape(p.summary)}</p>
            <div class="tags">${p.tags.map(t => `<span>${escape(t)}</span>`).join('')}</div>
            <details><summary aria-label="Explore ${escape(p.name)}">Explore project <span aria-hidden="true">↗</span></summary><div class="project-details"><p class="detail-kicker">${escape(p.subtitle.toUpperCase())}</p><p>${escape(p.description)}</p><h4>Engineering highlights</h4><ul>${p.highlights.map(h => `<li>${escape(h)}</li>`).join('')}</ul><h4>Built with</h4><p>${escape(p.tech.join(' · '))}</p></div></details>
            <a class="repo-link" href="https://github.com/assishmoncs/${escape(p.repo)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(p.name)} on GitHub">GitHub ↗</a>
          </div>
        </article>`;
const content = `
      <h3 class="collection-label" id="featured-label">IN THE SPOTLIGHT <span>01—03</span></h3>
      <div class="featured-grid project-grid" aria-labelledby="featured-label">${projects.slice(0,3).map(card).join('')}
      </div>
      <h3 class="collection-label more-label" id="more-label">MORE EXPLORATIONS <span>04—09</span></h3>
      <div class="more-grid project-grid" aria-labelledby="more-label">${projects.slice(3).map((p,i) => card(p,i+3)).join('')}
      </div>
      `;
const index = new URL('index.html', root);
const source = readFileSync(index, 'utf8');
if (!source.includes('<!-- PROJECTS:START -->') || !source.includes('<!-- PROJECTS:END -->')) throw new Error('Project markers missing');
writeFileSync(index, source.replace(/(?<=<!-- PROJECTS:START -->)[\s\S]*?(?=<!-- PROJECTS:END -->)/, content.replace(/[ \t]+$/gm, '')));
console.log(`Rendered ${projects.length} static project cards.`);
