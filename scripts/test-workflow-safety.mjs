import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const yaml=createRequire(import.meta.url)('js-yaml');
const files=fs.readdirSync('.github/workflows').sort();assert(files.every(file=>['validate.yml','publish.yml'].includes(file)));assert(files.includes('validate.yml'));
const active=yaml.load(fs.readFileSync('.github/workflows/validate.yml','utf8'));
assert.deepEqual(active.permissions,{contents:'read'});assert(!active.on.schedule);
assert.deepEqual(active.on.push.branches,['refactor/eleventy-cms-migration']);
assert.deepEqual(Object.keys(active.jobs),['validate']);
const pins=JSON.parse(fs.readFileSync('ops/github-actions/action-pins.json'));
for(const step of active.jobs.validate.steps){
  if(step.uses)assert(['checkout','setup-node'].some(name=>step.uses==='actions/'+name+'@'+pins[name].sha));
  if(step.run)assert(['npm ci --ignore-scripts','npm test','npm run test:blog','npm run test:workflow'].includes(step.run));
}
assert.equal(active.jobs.validate.steps[0].with['persist-credentials'],false);
const disabled=yaml.load(fs.readFileSync('ops/github-actions/publish.yml.example','utf8'));
assert.equal(disabled.on.schedule[0].cron,'0 6 * * *');assert.deepEqual(disabled.on.push.branches,['main']);
for(const job of Object.values(disabled.jobs))assert(job.if.includes("github.ref == 'refs/heads/main'")&&job.if.includes("vars.ENABLE_SITE_DEPLOY == 'true'"));
if(files.includes('publish.yml')){
  assert.equal(process.env.ENABLE_SITE_DEPLOY,'true','Publishing workflow requires explicit deployment approval');
  assert.deepEqual(yaml.load(fs.readFileSync('.github/workflows/publish.yml','utf8')),disabled,'Only the reviewed, guarded publishing template is allowed');
}else assert(!fs.existsSync('.github/workflows/publish.yml'));
console.log(`Workflow safety passed: validation is read-only; production template is ${files.includes('publish.yml')?'explicitly enabled and guarded':'inactive outside .github/workflows'}.`);
