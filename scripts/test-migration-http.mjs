import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const dir = 'migration/phase-1';
const baseline = JSON.parse(fs.readFileSync(`${dir}/baseline-inventory.json`));
const images = JSON.parse(fs.readFileSync(`${dir}/image-manifest.json`));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const checks = [];
for (const f of baseline.files.filter(f => f.file.endsWith('.html'))) {
  const route = f.file === 'index.html' ? '/' : '/' + f.file.replace(/index\.html$/, '');
  const res = await fetch(`http://127.0.0.1:4173${route}`);
  assert.equal(res.status, 200, route);
  assert.equal(hash(Buffer.from(await res.arrayBuffer())), hash(fs.readFileSync(f.file)), route);
  checks.push({ route, passed: true });
}
for (const img of images.unique) {
  const res = await fetch(`http://127.0.0.1:4173/${img.file}`);
  assert.equal(res.status, 200, img.file);
  assert.equal(res.headers.get('content-type'), img.actualFormat === 'png' ? 'image/png' : 'image/jpeg');
  assert.equal(hash(Buffer.from(await res.arrayBuffer())), img.sha256);
  checks.push({ file: img.file, passed: true });
}
for (const kind of ['desktop', 'mobile']) {
  assert.deepEqual(fs.readFileSync(`${dir}/screenshots/${kind}-before.png`), fs.readFileSync(`${dir}/screenshots/${kind}-after.png`));
  checks.push({ screenshotComparison: kind, passed: true });
}
fs.writeFileSync(`${dir}/http-results.json`, JSON.stringify({ passed: checks.length, failed: 0, checks }, null, 2) + '\n');
console.log(`HTTP and screenshot assertions: ${checks.length} passed, 0 failed`);
