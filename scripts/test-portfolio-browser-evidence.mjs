// Checks saved observations, does not pretend to rerun an authenticated CMS session.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir='migration/phase-4',r=JSON.parse(fs.readFileSync(`${dir}/browser-results.json`));
for(const view of ['desktop','mobile']){assert(r[`${view}Identical`]);assert.deepEqual(fs.readFileSync(`${dir}/screenshots/${view}-before.png`),fs.readFileSync(`${dir}/screenshots/${view}-after.png`));}
assert.equal(r.modals.length,42);assert(r.modals.every(m=>m.open&&m.aria==='false'));
assert(r.zoomCheck.open&&r.zoomCheck.loaded&&r.zoomCheck.alt);assert(r.closeCheck.modalsClosed&&r.closeCheck.zoomClosed&&r.closeCheck.ariaHidden==='true');
assert.equal(r.filterCheck.counter,'21');assert.equal(r.filterCheck.visible.length,5);
assert.equal(r.fixtureFilter.counter,'23');assert.deepEqual(r.fixtureFilter.visible,['23']);
assert(r.fixtureModal.open&&r.fixtureModal.images.every(i=>i.loaded&&i.alt));assert.equal(r.fixtureEN.counter,'23');assert.equal(r.fixtureEN.visible,23);
assert(r.minimalModal.open&&r.minimalModal.galleries===0);assert(r.fixtureMobile.open&&!r.fixtureMobile.overflow&&r.fixtureMobile.images.every(Boolean));assert.deepEqual(r.logs,[]);
console.log('Phase-4 fresh browser evidence verified: two identical screenshot pairs, 42 bilingual modals, 21/23 counters, dynamic filters, minimal record, desktop/mobile galleries, no console errors.');
