import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {parseEditorialDate,readPost} from '../lib/blog.mjs';
const yaml=createRequire(import.meta.url)('js-yaml');
const collection=yaml.load(fs.readFileSync('.pages.yml','utf8')).content.find(c=>c.name==='posts');
const field=collection.fields.find(f=>f.name==='publishAt');
assert.equal(field.type,'date');assert.equal(field.options.time,true);
// Literal offset is intentional: the CMS datetime-local input is Istanbul civil
// time, not the editor computer's zone. xxx/XXX would shift it between zones.
assert.equal(field.options.format,"yyyy-MM-dd'T'HH:mm:ss'+03:00'");
assert.equal(field.default,'');
for(const file of fs.readdirSync(collection.path).filter(f=>f.endsWith('.md'))){
  const p=readPost(collection.path+'/'+file);
  if(!p.publishAt)continue;
  assert(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+03:00$/.test(p.publishAt),`${file}: CMS publication format mismatch`);
  const civil=p.publishAt.slice(0,16);
  assert.equal(parseEditorialDate(civil),parseEditorialDate(p.publishAt),`${file}: Istanbul civil/offset mismatch`);
}
console.log('CMS publication format and Istanbul/runtime equivalence passed for current dated records.');
