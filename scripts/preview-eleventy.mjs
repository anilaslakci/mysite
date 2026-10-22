import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const pages = JSON.parse(fs.readFileSync('migration/phase-2/extraction-manifest.json')).pages;
const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.xml': 'application/xml', '.txt': 'text/plain' };
http.createServer((req, res) => {
  try {
    const requestUrl = new URL(req.url, 'http://localhost');
    let url = decodeURIComponent(requestUrl.pathname);
    const baseline = url.startsWith('/__baseline/');
    if (baseline) url = url.slice('/__baseline'.length);
    let relative = url.replace(/^\/+/, '');
    if (!relative || relative.endsWith('/')) relative += 'index.html';
    if (!pages.includes(relative) && !relative.startsWith('assets/') && !['CNAME','robots.txt','sitemap.xml','favicon.ico','favicon.png','favicon-48x48.png','favicon-96x96.png'].includes(relative)) { res.writeHead(404); res.end(); return; }
    const base = path.resolve(root, baseline ? '.' : '_site');
    const file = path.resolve(base, relative);
    if (!file.startsWith(base + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Content-Security-Policy': "script-src 'self' 'unsafe-inline'; connect-src 'self'" });
    if (requestUrl.searchParams.get('visual') === '1' && file.endsWith('index.html')) {
      // Screenshot-only stabilization, identical for baseline and build.
      // Never written to source/output; ordinary routes test real animations.
      const stable = '<style data-preview-only="visual">*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}#cur,#cur-ring,#iglow,.i-p,.h-p,.star-el{visibility:hidden!important}.reveal{opacity:1!important;transform:none!important}.h-eyebrow,.hero h1,.h-desc,.h-actions,.h-stats,.scroll-ind{opacity:1!important;transform:translateY(0)!important}[data-count]{visibility:hidden!important}</style>';
      res.end(fs.readFileSync(file, 'utf8').replace('</head>', stable + '</head>'));
    } else fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(400); res.end(); }
}).listen(4174, '127.0.0.1', () => console.log('Eleventy comparison: http://127.0.0.1:4174/ ; original /__baseline/ ; analytics blocked by preview-only CSP.'));
