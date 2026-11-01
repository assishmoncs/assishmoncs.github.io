import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const projects = JSON.parse(readFileSync(new URL('data/projects.json', root), 'utf8'));
assert.equal(projects.length, 9, 'Expected nine selected projects');
assert.deepEqual(projects.slice(0,3).map(p=>p.name), ['PairPad','ShadowCast','RuralShield AI']);
assert.equal((html.match(/class="project-card/g)||[]).length, 9, 'Static projects must exist without JS');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate element IDs');
for (const [,ref] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
  if (ref.startsWith('#')) assert(ids.includes(ref.slice(1)), `Missing anchor ${ref}`);
  else if (!/^(?:https?:|mailto:)/.test(ref)) assert(existsSync(new URL(ref, root)), `Missing asset ${ref}`);
}
for (const [,ref] of html.matchAll(/\b(?:aria-controls|aria-labelledby|for)="([^"]+)"/g)) {
  for (const id of ref.split(' ')) assert(ids.includes(id), `Broken accessible reference ${id}`);
}
for (const [,tech] of html.matchAll(/data-skill="([^"]+)"/g)) {
  assert(projects.some(p=>p.tech.includes(tech)), `Skill ${tech} needs project evidence`);
}
for (const project of projects) {
  assert(html.includes(`https://github.com/assishmoncs/${project.repo}`), `Missing repo ${project.repo}`);
  assert(!project.category.some(c=>!['web','ai','mobile'].includes(c)), 'Unknown project category');
}
assert(html.includes('action="https://formspree.io/f/mlgoglgr"'), 'Preserve the real contact endpoint in the artifact');
assert(!html.includes('window.fetch='), 'Test mocks must not enter the published HTML');
assert(!html.includes('10+') && !html.includes('24/7'), 'Remove unsupported filler statistics');
console.log('Passed: nine static projects, featured order, unique IDs, local assets, accessible references, technology evidence, repository links, and production form configuration.');
