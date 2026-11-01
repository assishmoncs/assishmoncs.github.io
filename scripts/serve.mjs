// Local preview only. Bind to loopback and keep file requests inside this folder.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const testFixtures = process.argv.includes('--test-fixtures');
const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.png':'image/png','.ico':'image/x-icon','.pdf':'application/pdf' };
const server = http.createServer(async (req,res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const requestPath = decodeURIComponent(url.pathname);
    const target = path.resolve(root, '.' + (requestPath === '/' ? '/index.html' : requestPath));
    const relative = path.relative(root,target);
    if (relative.startsWith('..') || path.isAbsolute(relative) || relative.split(path.sep).some(p=>p.startsWith('.'))) {
      res.writeHead(403);res.end('Forbidden');return;
    }
    let data = await readFile(target);
    // Explicit local QA mode only. These fixtures never enter index.html.
    const fixture = testFixtures && url.searchParams.get('test');
    if (fixture && path.basename(target) === 'index.html') {
      let html = data.toString('utf8');
      if (fixture === 'no-js') html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
      else {
        const setup = {
          'form-success': `window.fetch=async()=>new Response('{}',{status:200});`,
          'form-error': `window.fetch=async()=>new Response('{}',{status:422});`,
          'form-offline': `window.fetch=async()=>{throw new TypeError('Simulated offline');};`,
          'no-canvas': `HTMLCanvasElement.prototype.getContext=()=>null;`,
          'reduced-motion': `const original=window.matchMedia.bind(window);window.matchMedia=q=>q.includes('prefers-reduced-motion')?{matches:true,addEventListener(){},removeEventListener(){}}:original(q);`,
          'no-storage': `Storage.prototype.getItem=()=>{throw new Error('Storage unavailable');};Storage.prototype.setItem=()=>{throw new Error('Storage unavailable');};`
        }[fixture];
        if (setup) html = html.replace('<head>', `<head><script>${setup}</script>`);
      }
      // Never send a real message from any fixture, including the no-JS case.
      html = html.replace('action="https://formspree.io/f/mlgoglgr"', 'action="/__test-form"');
      data = Buffer.from(html);
    }
    res.writeHead(200, {'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {res.writeHead(404);res.end('Not found');}
});
server.listen(8000,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:8000'));
