// Historical migration evidence stays immutable; compare content, not the old single-URL bilingual DOM.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n'),json=p=>JSON.parse(read(p));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const original=json('migration/phase-2/baseline-inventory.json'),extraction=json('migration/phase-2/extraction-manifest.json'),images=json('migration/phase-1/image-manifest.json');
const checks=[];const check=(name,fn)=>{fn();checks.push(name);};
check('All phase-1 original tracked files remain unchanged',()=>{for(const f of original.files)assert.equal(hash(fs.readFileSync(f.file)),f.sha256,f.file);});
const visible=s=>s.replace(/<button[^>]*data-cookie-preferences[^]*?<\/button>/g,'').replace(/<head[\s\S]*?<\/head>/g,'').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[^]*?-->/g,'').replace(/<nav class="site-language"[^]*?<\/nav>/g,'').replace(/<button class="menu-toggle"[^]*?<\/button>/g,'').replace(/<a data-blog-entry[^]*?<\/a>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
for(const file of extraction.pages){const output=read('_site/'+file),old=read(file);check(file+': original SEO retained',()=>{for(const re of [/<title[^>]*>[^]*?<\/title>/g,/<meta[^>]*name="description"[^>]*>/g,/<link[^>]*rel="canonical"[^>]*>/g,/<script type="application\/ld\+json">[^]*?<\/script>/g])assert.deepEqual(output.match(re),old.match(re),file);});if(file!=='portfolyo/index.html')check(file+': full Turkish visible content preserved',()=>assert.equal(visible(output),visible(old)));}
check('67 source/output image SHA-256 values preserved',()=>{for(const image of images.unique){assert.equal(hash(fs.readFileSync(image.file)),image.sha256);assert.equal(hash(fs.readFileSync('_site/'+image.file)),image.sha256);}});
check('42 cards and modals split across two independent language URLs',()=>{for(const [lang,route]of [['tr','portfolyo'],['en','en/portfolio']]){const h=read('_site/'+route+'/index.html');assert.equal((h.match(/data-pid=/g)||[]).length,21);assert.equal((h.match(/id="modal-(?:tr|en)-[0-9a-f-]+"/g)||[]).length,21);assert(!h.includes('id="grid-'+(lang==='tr'?'en':'tr')+'"'));}});
check('Six services share one layout and stylesheet',()=>{for(const file of extraction.pages.filter(f=>!['index.html','portfolyo/index.html'].includes(f))){assert(read('src/_includes/pages/'+file.split('/')[0]+'.njk').includes('extends "layouts/service.njk"'));assert(read('_site/'+file).includes('/assets/css/services.css'));}});
fs.writeFileSync('migration/phase-7/historical-eleventy-results.json',JSON.stringify({passed:checks.length,failed:0,checks},null,2)+'\n');console.log(checks.length+' historical preservation checks passed.');
