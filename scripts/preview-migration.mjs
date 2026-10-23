import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const allowed = new Set(JSON.parse(fs.readFileSync('migration/phase-1/baseline-inventory.json')).files.map(f => f.file));
http.createServer((req, res) => {
  let url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const baseline = url.startsWith('/__baseline/');
  if (baseline) url = url.slice('/__baseline'.length);
  let relative = url.replace(/^\/+/, '');
  if (!relative || relative.endsWith('/')) relative += 'index.html';
  if (!allowed.has(relative) && !/^assets\/portfolio\/[a-f0-9]{64}\.(png|jpg)$/.test(relative)) { res.writeHead(404); res.end(); return; }
  const file = path.join(root, baseline ? '.migration-backups/phase-1/snapshot' : '', relative);
  if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };
  res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'text/plain', 'Cache-Control': 'no-store', 'Content-Security-Policy': "script-src 'self' 'unsafe-inline'; connect-src 'self'" });
  fs.createReadStream(file).pipe(res);
}).listen(4173, '127.0.0.1', () => console.log('Local preview http://127.0.0.1:4173/portfolyo/ ; baseline /__baseline/portfolyo/ ; analytics blocked via preview-only CSP'));
