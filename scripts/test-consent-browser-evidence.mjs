import fs from 'node:fs';
import assert from 'node:assert/strict';
const qa=JSON.parse(fs.readFileSync('migration/phase-10/browser-results.json'));
const state=name=>qa.scenarios.find(s=>s.scenario===name).state;
for(const name of ['first-visit','reject-reload','reject-shared-en','withdrawn-event-blocked','portfolio-no-google','mobile-home-rejected']){
  const s=state(name);assert.equal(s.scripts,0,name);assert.equal(s.events.length,0,name);assert.equal(s.disabled,true,name);
  assert.equal((s.cookieNames||[]).length,0,name);
  assert.equal(s.queue.filter(q=>q[0]==='event'||q[0]==='config').length,0,name);
}
for(const name of ['accepted-real-google','accepted-again','accepted-reload','first-accept-button']){
  const s=state(name);assert.equal(s.scripts,1,name);
  assert.equal(s.events.filter(e=>e.kind==='script'&&e.url.includes('googletagmanager')).length,1,name);
  assert(s.events.some(e=>e.url.includes('google-analytics.com/g/collect')&&e.event==='page_view'),name);
  assert(s.cookieNames.includes('_ga'),name);
  assert.equal(s.queue.filter(q=>q[0]==='config').length,1,name);
  const update=s.queue.find(q=>q[0]==='consent'&&q[1]==='update')[2];
  assert.equal(update.analytics_storage,'granted');
  for(const key of ['ad_storage','ad_user_data','ad_personalization'])assert.equal(update[key],'denied');
}
assert.deepEqual(state('accepted-real-google').events,state('accepted-again').events,'Repeated acceptance must not add a request');
assert.equal(qa.layouts.length,54);
assert(qa.layouts.every(p=>!p.overflow&&p.footer===1&&p.notice));
const keyboard=qa.scenarios.find(s=>s.scenario==='keyboard-after-fix');
assert.equal(keyboard.backFocus,'Kapat');assert.equal(keyboard.nextFocus,'consent-analytics');assert.equal(keyboard.restoreFocus,'Tercihleri Yönet');
assert.equal(qa.logs.length,0);assert.equal(qa.realGoogleLibrary,true);
console.log('Fresh consent browser evidence passed: real Google requests/cookies after acceptance, none before/reject/withdrawal, idempotence, 54 layouts, keyboard and portfolio.');
