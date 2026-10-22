import fs from 'node:fs';import assert from 'node:assert/strict';
const r=JSON.parse(fs.readFileSync('migration/phase-7/browser-results.json','utf8'));
assert.equal(r.pages.length,54);assert(r.pages.every(p=>!p.overflow&&p.h1));
for(const p of r.pages)assert.equal(p.lang,p.route.startsWith('/en/')?'en':'tr');
assert.equal(r.modals.length,42);assert(r.modals.every(p=>p.open&&p.focusedClose&&p.role==='dialog'));
assert.equal(r.before.length,24);assert.equal(r.blog.length,6);assert(r.blog.every(p=>!p.overflow&&p.jsonld[0].inLanguage===p.lang));
assert.equal(r.menu.expanded,'true');assert.equal(r.menu.closed,'false');assert(r.menu.visible);
assert.equal(r.intro.backgroundInert,'');assert.equal(r.intro.released,null);
for(const lang of ['tr','en']){const item=r.interactions.find(p=>p.lang===lang&&p.zoom);assert(item.trapped&&item.zoom.open&&item.zoom.alt&&item.modalRemains===1&&item.restored);}
assert.deepEqual(r.logs,[]);assert.equal(r.cms.editorSession,false);assert.equal(r.cms.remoteWrites,false);
console.log('Browser evidence passed: 54 localized layouts, 24 baseline screenshots, 42 dialogs, 6 bilingual QA blog views, keyboard/zoom/menu, no console errors.');
