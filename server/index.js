import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApiMiddleware } from './api.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const envFile = path.join(root, '.env');

if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const dist = path.join(root, 'dist');
const api = createApiMiddleware(process.env);
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
};

async function serveStatic(req, res) {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(dist, `.${pathname}`);

    if (!file.startsWith(`${dist}${path.sep}`) && file !== dist) {
      res.writeHead(403);
      res.end();
      return;
    }

    if (!path.extname(file)) {
      file = path.join(dist, 'index.html');
    }

    const content = await readFile(file);
    const contentType = contentTypes[path.extname(file)] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found. Run npm run build first.');
  }
}

const server = http.createServer((req, res) => {
  api(req, res, () => serveStatic(req, res));
});

server.listen(Number(process.env.PORT) || 3000, '127.0.0.1', () => {
  console.log(`Favorit Parts: http://127.0.0.1:${server.address().port}`);
});
