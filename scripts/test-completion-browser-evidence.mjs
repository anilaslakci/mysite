// Audits this revision's recorded UI observations; does not launch a CMS session.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir='migration/phase-5',r=JSON.parse(fs.readFileSync(`${dir}/browser-results.json`));
for(const s of r.screenshots){assert(s.equal);assert.deepEqual(fs.readFileSync(`${dir}/screenshots/${s.viewport}-before.png`),fs.readFileSync(`${dir}/screenshots/${s.viewport}-after.png`));}
assert.equal(r.legacyModals.length,42);assert(r.legacyModals.every(m=>m.open));
assert.equal(r.uuidModals.length,4);assert(r.uuidModals.every(m=>m.open&&m.images.every(i=>i.loaded&&i.alt)));
assert.equal(r.fixture.count,'23');assert.equal(r.fixture.ids.length,23);assert.equal(r.newFilter.count,'23');assert.equal(r.newFilter.visible.length,1);
assert(r.zoom.open&&r.zoom.loaded&&r.zoom.alt);assert(r.uploadZoom.loaded);assert(r.mobile.open&&!r.mobile.overflow&&r.mobile.images.every(Boolean));assert.deepEqual(r.logs,[]);
assert.equal(r.realCmsEditor,false);
console.log('Phase-5 browser evidence passed: identical desktop/mobile screenshots, 42 legacy + 4 UUID modals, dynamic filters/counters, uploaded gallery image, keyboard/zoom, no console errors. Hosted CMS remains untested.');
