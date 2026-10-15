import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { publicFiles } from './public-files.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const allowed = new Set(publicFiles);
const mime = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8', svg: 'image/svg+xml', jpg: 'image/jpeg', ttf: 'font/ttf', txt: 'text/plain; charset=utf-8' };

export function createSiteServer() {
  return createServer(async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'no-store');
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      response.end();
      return;
    }
    let path;
    try {
      path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      response.writeHead(400);
      response.end('Invalid request');
      return;
    }
    // Also support the GitHub Pages project prefix for local verification.
    if (path === '/happy-run') path += '/';
    if (path.startsWith('/happy-run/')) path = path.slice('/happy-run'.length);
    const file = path === '/' ? 'index.html' : path.slice(1);
    const found = allowed.has(file);
    try {
      const body = await readFile(resolve(root, found ? file : '404.html'));
      const extension = (found ? file : '404.html').split('.').at(-1);
      response.writeHead(found ? 200 : 404, { 'Content-Type': mime[extension] || 'application/octet-stream' });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(500);
      response.end('Unable to load page');
    }
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  const host = process.env.HOST || '127.0.0.1';
  createSiteServer().listen(port, host, () => console.log(`Happy Run: http://${host}:${port}/happy-run/`));
}
