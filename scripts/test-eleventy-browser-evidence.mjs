// Verifies recorded real-browser evidence; this does not launch a browser.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir = 'migration/phase-2';
const data = JSON.parse(fs.readFileSync(`${dir}/browser-results.json`));
assert.equal(data.comparisons.length, 14);
assert.equal(data.homeComparisons.length, 2);
for (const c of data.comparisons) {
  assert(c.screenshotEqual && c.geometryEqual);
  const stem = `${c.route.replaceAll('/', '')}-${c.viewport}`;
  assert.deepEqual(fs.readFileSync(`${dir}/screenshots/${stem}-before.png`), fs.readFileSync(`${dir}/screenshots/${stem}-after.png`));
}
for (const c of data.homeComparisons) {
  assert(c.screenshotEqual && c.stabilized && c.geometryEqual && c.heroOpacity === '1');
  assert.deepEqual(fs.readFileSync(`${dir}/screenshots/home-${c.viewport}-before.png`), fs.readFileSync(`${dir}/screenshots/home-${c.viewport}-after.png`));
}
assert.equal(data.modals.length, 42);
for (const lang of ['tr','en']) for (let id=1;id<=21;id++) assert.equal(data.modals.filter(m => m.lang === lang && m.id === id && m.open).length,1);
assert.equal(data.filter.count,5); assert.equal(data.filter.lang,'en');
assert(data.zoom.loaded && data.zoom.open && data.escape.zoomClosed && data.escape.modalsClosed);
assert(data.homeRuntime.educationActive && data.homeRuntime.introClosed && data.homeRuntime.unlocked && data.homeRuntime.siteVisible);
assert.equal(data.homeRuntime.particles,91); assert.equal(data.homeRuntime.particleAnimation,'pUp');
assert(data.homeRuntime.visibleReveals > 0);
assert(data.mobile.open && data.mobile.noHorizontalOverflow && data.mobile.images.every(i => i.loaded));
assert(data.returnHome.introHidden && data.returnHome.visible && data.returnHome.queryCleared);
assert.equal(data.capturedConsoleErrorsAndWarnings.length,0);
console.log('Recorded browser evidence verified: 16 screenshot pairs, 42 modals, home/navigation/tabs/animations, language/filter/zoom/Escape, mobile, no captured console errors.');
