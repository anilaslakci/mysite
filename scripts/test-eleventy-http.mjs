import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const walk = root => fs.readdirSync(root, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(root, e.name)) : [path.join(root, e.name).replaceAll('\\','/')]);
const checks = [];
for (const file of walk('_site')) {
  const route = '/' + file.slice(6).replace(/index\.html$/, '');
  const response = await fetch(`http://127.0.0.1:4174${route}`);
  assert.equal(response.status, 200, route);
  assert.equal(hash(Buffer.from(await response.arrayBuffer())), hash(fs.readFileSync(file)), route);
  if (file.endsWith('.css')) assert(response.headers.get('content-type').startsWith('text/css'));
  if (file.endsWith('.js')) assert(response.headers.get('content-type').startsWith('text/javascript'));
  checks.push({ route, passed: true });
}
for (const route of ['/migration/phase-1/README.md','/.migration-backups/phase-1/metadata.json','/package.json','/src/index.njk','/blog/does-not-exist/']) {
  const response=await fetch(`http://127.0.0.1:4174${route}`);
  assert.equal(response.status, 404, route);
  if(route.startsWith('/blog/'))assert((await response.text()).includes('Bu sayfa bulunamadı.'));
  checks.push({ blockedPrivateRoute: route, passed: true });
}
fs.writeFileSync('migration/phase-7/http-results.json', JSON.stringify({ passed: checks.length, failed: 0, checks }, null, 2) + '\n');
console.log(`HTTP: ${checks.length} passed; 0 failures.`);
