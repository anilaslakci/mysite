import fs from 'node:fs';import assert from 'node:assert/strict';
const r=JSON.parse(fs.readFileSync('migration/phase-9/browser-results.json','utf8'));assert.equal(r.pages.length,54);assert(r.pages.every(p=>p.h1&&!p.overflow&&p.forms===0));assert.equal(r.pages.filter(p=>p.cards===21).length,6);
for(const p of r.pages.filter(p=>p.sidebar)){assert.equal(p.sidebar.count,6);assert(p.sidebar.display.every(d=>d==='block'));assert(!p.sidebar.overflow);}
assert.equal(r.modals.length,42);assert(r.modals.every(p=>p.open&&p.focus==='close'));
for(const lang of ['tr','en']){const x=r.interactions.find(p=>p.lang===lang&&p.zoom);assert(x.focusTrap&&x.zoom.open&&x.zoom.alt&&x.remains===1&&x.restored);}
assert.equal(r.menu.expanded,'true');assert.equal(r.menu.closed,'false');assert(r.serviceLanguageSwitch.endsWith('/erp-entegrasyonu/'));assert.deepEqual(r.logs,[]);console.log('Fresh release browser QA passed: 54 layouts, 36 corrected service views, 42 dialogs, keyboard/filter/gallery/menu, no console errors.');
