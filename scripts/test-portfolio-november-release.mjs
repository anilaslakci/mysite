// Release-specific preservation/acceptance; daily runtime checks remain dynamic.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {loadPortfolio,validateProjects} from '../lib/portfolio.mjs';
const base=JSON.parse(fs.readFileSync('migration/phase-21/baseline.json'));
const manifest=JSON.parse(fs.readFileSync('migration/phase-21/change-manifest.json'));
const changed=new Set(['src/content/projects/4.json','src/content/projects/9.json','src/content/projects/10.json','src/content/projects/19.json','src/content/categories/finance.json']);
const hash=(bytes,file)=>crypto.createHash('sha256').update(/\.(json|md|yml|mjs|njk|css|js|svg|xml|txt)$/.test(file)?bytes.toString('utf8').replace(/\r\n/g,'\n'):bytes).digest('hex');
for(const [file,sha]of Object.entries(base.files))if(!changed.has(file))assert.equal(hash(fs.readFileSync(file),file),sha,`Unrelated file changed: ${file}`);
for(const file of changed){const previous=JSON.parse(execFileSync('git',['show',base.base+':'+file],{encoding:'utf8'})),current=JSON.parse(fs.readFileSync(file));const permitted=file.includes('/categories/')||file.endsWith('/9.json')?'archived':'category';delete previous[permitted];delete current[permitted];assert.deepEqual(current,previous,`Only ${permitted} may change in ${file}`);}
const p=loadPortfolio();assert.equal(p.allProjects.length,25);assert.equal(p.projects.length,24);assert.equal(p.media.length,75);
assert(p.allProjects.find(x=>x.id===9).archived);assert(!p.projects.some(x=>x.id===9));assert(!p.categories.some(x=>x.key==='finance'));
assert.equal(p.projects.find(x=>x.id===10).category,'other');for(const id of [4,19])assert.equal(p.projects.find(x=>x.id===id).category,'process-improvement');
const category=p.categories.find(x=>x.key==='process-improvement');assert.equal(category.color,'#FF6B6B');assert.equal(category.tr,'Süreç Geliştirme');
for(const row of manifest.addedProjects){const item=p.projects.find(x=>x.uid===row.uid);assert(item);assert.equal(item.category,row.category);assert(item.tr.problem&&item.en.problem&&item.tr.solution&&item.en.solution);if(row.key==='furniture-configurator'){assert.equal(item.gallery.length,0);assert(!/adore/i.test(JSON.stringify(item)));}}
const invoice=p.projects.find(x=>x.uid===manifest.addedProjects.find(x=>x.key==='invoice-review').uid);assert.deepEqual(invoice.gallery.map(x=>x.file),['/assets/portfolio/invoice-review-empty-analysis.png','/assets/portfolio/invoice-review-empty-classification.png']);
for(const row of manifest.addedMedia)assert.equal(hash(fs.readFileSync(row.file),row.file),row.sha256);
for(const lang of ['tr','en']){const html=fs.readFileSync('_site/'+(lang==='tr'?'portfolyo':'en/portfolio')+'/index.html','utf8');assert(!html.includes('Sırlar Dünyası'));assert(!html.includes('id="modal-'+lang+'-9"'));assert(!html.includes("filterProjects('finance',"));assert.equal((html.match(/data-pid=/g)||[]).length,24);assert.equal((html.match(/id="modal-(?:tr|en)-[0-9a-f-]+"/g)||[]).length,24);assert(html.includes('id="stat1-num">24</strong>'));}
const duplicate=structuredClone(p.allProjects);duplicate.push(structuredClone(duplicate.at(-1)));assert.throws(()=>validateProjects(duplicate),/Duplicate/);
console.log('Portfolio release passed: 24 public / 25 retained, four bilingual additions, eight approved media, category/archive moves, unchanged content and source, UUID protection.');
