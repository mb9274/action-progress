import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSite } from './build-site.mjs';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const outDir = path.join(root, 'dist');
const noWatch = process.argv.includes('--no-watch');
const port = Number(process.env.PORT || 4321);

function mime(file) {
  const ext = path.extname(file).toLowerCase();
  return (
    {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.ico': 'image/x-icon',
      '.webmanifest': 'application/manifest+json; charset=utf-8',
      '.xml': 'application/xml; charset=utf-8',
      '.txt': 'text/plain; charset=utf-8',
    }[ext] || 'application/octet-stream'
  );
}

function safeJoin(base, requestPath) {
  const decoded = decodeURIComponent(requestPath.split('?')[0]);
  const target = path.normalize(path.join(base, decoded));
  if (!target.startsWith(base)) return null;
  return target;
}

function serve(req, res) {
  if (!req.url) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  let file = safeJoin(outDir, req.url);
  if (!file) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, 'index.html');
  }

  if (!fs.existsSync(file)) {
    const notFound = path.join(outDir, '404.html');
    if (fs.existsSync(notFound)) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(notFound));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const body = fs.readFileSync(file);
  res.writeHead(200, {
    'Content-Type': mime(file),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function rebuild(reason) {
  try {
    buildSite({ root, outDir, log: false });
    console.log(`[build] ok${reason ? ` (${reason})` : ''}`);
  } catch (error) {
    console.error('[build] failed');
    console.error(error?.stack || error?.message || error);
  }
}

rebuild('initial');

const server = http.createServer(serve);
server.listen(port, '127.0.0.1', () => {
  console.log(`Local site running at http://127.0.0.1:${port}/`);
  console.log(noWatch ? 'Watch mode disabled.' : 'Watching content, src, public and scripts for changes...');
});

if (!noWatch) {
  const watchDirs = ['content', 'src', 'public', 'scripts'].map((d) => path.join(root, d));
  let timer = null;
  for (const dir of watchDirs) {
    if (!fs.existsSync(dir)) continue;
    fs.watch(dir, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      clearTimeout(timer);
      timer = setTimeout(() => rebuild(String(filename)), 120);
    });
  }
}
