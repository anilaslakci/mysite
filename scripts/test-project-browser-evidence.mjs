// Audits recorded real-browser results; does not launch/repeat the UI session.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir='migration/phase-3',data=JSON.parse(fs.readFileSync(`${dir}/browser-results.json`));
assert.equal(data.comparisons.length,16);
for(const c of data.comparisons){assert(c.screenshotEqual);const stem=(c.route==='/'?'home':c.route.replaceAll('/',''))+'-'+c.viewport;assert.deepEqual(fs.readFileSync(`${dir}/screenshots/${stem}-before.png`),fs.readFileSync(`${dir}/screenshots/${stem}-after.png`));}
assert.equal(data.modals.length,42);for(const l of ['tr','en'])for(let id=1;id<=21;id++)assert.equal(data.modals.filter(m=>m.id===id&&m.lang===l&&m.open).length,1);
assert.equal(data.filter.count,5);assert.equal(data.filter.category,'data-analysis');assert.equal(data.filter.counter,'21');
assert(data.zoom.loaded&&data.zoom.open&&data.escape.zoomClosed&&data.escape.modalsClosed);
assert(data.mobile.open&&data.mobile.noHorizontalOverflow&&data.mobile.images.every(i=>i.loaded));assert.equal(data.mobileCount,'21');
assert(data.homeReturn.skipIntroWorks&&data.homeReturn.visible&&data.homeTab.active);assert.equal(data.homeReturn.particles,91);
assert.equal(data.fixture.initial.counter,'22');assert.equal(data.fixture.initial.cards,44);assert.equal(data.fixture.initial.modals,44);
assert.equal(data.fixture.filter.counter,'22');assert.deepEqual(data.fixture.filter.visible,['10','22']);assert(data.fixture.modal.open&&data.fixture.gallery.loaded&&data.fixture.gallery.zoom);assert.equal(data.fixture.modal.optionalLinks,1);
assert.equal(data.consoleErrorsAndWarnings.length,0);
const editor=JSON.parse(fs.readFileSync(`${dir}/editor-test-status.json`));assert.equal(editor.authenticated,false);assert.equal(editor.realEditorOperationsTested,false);
console.log('Phase-3 browser evidence verified: 16 identical screenshot pairs, 42 modals, 21/22 dynamic counters, filters/gallery/mobile; real CMS sign-in requirement remains open.');
