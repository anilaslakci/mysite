// Daily checks validate current editorial intent, never the migration's old counts/text.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { loadPortfolio } from '../lib/portfolio.mjs';
const {projects,categories} = loadPortfolio();
const outputDir = process.env.SITE_TEST_OUTPUT || '_site';
const pages = JSON.parse(fs.readFileSync('migration/phase-2/extraction-manifest.json')).pages;
const html = fs.readFileSync(`${outputDir}/portfolyo/index.html`,'utf8');
assert.equal((html.match(/data-pid=/g)||[]).length,projects.length*2);
assert.equal((html.match(/id="modal-(?:tr|en)-[0-9a-f-]+"/g)||[]).length,projects.length*2);
assert(html.includes(`<strong id="stat1-num">${projects.length}</strong>`));
assert.equal((html.match(/class="filter-btn(?: active)?"/g)||[]).length,2*(categories.length+1));
for (const lang of ['tr','en']) {
  assert.deepEqual([...html.matchAll(new RegExp(`data-lang="${lang}" data-pid="([0-9a-f-]+)"`,'g'))].map(m=>m[1]),projects.map(p=>String(p.id)));
  for (const c of categories) assert(html.includes(`filterProjects('${c.key}', this)`));
  for (const p of projects) assert(html.includes(`id="modal-${lang}-${p.id}"`));
}
for (const file of pages) {
  const source=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'), output=fs.readFileSync(`${outputDir}/${file}`,'utf8').replace(/\r\n/g,'\n');
  for(const re of [/<title\b[^>]*>[\s\S]*?<\/title>/g,/<meta[^>]*name="description"[^>]*>/g,/<link[^>]*rel="canonical"[^>]*>/g,/<script type="application\/ld\+json">[\s\S]*?<\/script>/g]) assert.deepEqual(output.match(re),source.match(re),`${file}: SEO`);
  assert(!output.includes('https://anilaslakci.com.tr/mysite/'));
  for(const [,ref] of output.matchAll(/(?:src|href)="([^"]*)"/g)) {
    if(!ref || /^(?:https?:|mailto:|tel:|data:|#|\/\/)/.test(ref)) continue;
    const [url,fragment]=ref.split('#');
    let dest=path.posix.normalize(url.startsWith('/')?url.slice(1):path.posix.join(path.posix.dirname(file),url));
    dest=dest.split('?')[0]; if(!dest||dest.endsWith('/'))dest+='index.html';
    const absolute=path.resolve(outputDir,dest);assert(absolute.startsWith(path.resolve(outputDir)+path.sep),`Outside output: ${ref}`);
    assert(fs.existsSync(absolute),`${file}: missing ${ref}`);
    if(fragment)assert(fs.readFileSync(absolute,'utf8').includes(`id="${fragment}"`),`${file}: missing fragment ${ref}`);
  }
}
console.log(`Runtime validation passed: ${projects.length} published projects, ${categories.length} used categories, eight URLs, SEO and internal references.`);
