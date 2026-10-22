import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { categories, words, imagePath, loadPortfolio, validateProjects, legacyPortfolioMarkup, normalizeMarkup, assertMediaUnused } from '../lib/portfolio.mjs';
const require = createRequire(import.meta.url), yaml = require('js-yaml'), nunjucks = require('nunjucks');
const source = JSON.parse(fs.readFileSync('migration/phase-1/content-manifest.json'));
const images = JSON.parse(fs.readFileSync('migration/phase-1/image-manifest.json'));
const config = yaml.load(fs.readFileSync('.pages.yml','utf8'));
const records = fs.readdirSync('src/content/projects').map(f => JSON.parse(fs.readFileSync(`src/content/projects/${f}`)));
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader('src/_includes'),{autoescape:false});env.addFilter('portfolioImage',imagePath);
const checks=[];const check=(name,fn)=>{fn();checks.push({name,passed:true});};
check('21 independent records with fixed historical IDs and order',()=>{validateProjects(records);assert.equal(records.length,21);assert.deepEqual(loadPortfolio().projects.map(p=>p.id),source.projects.map(p=>p.id));});
check('All 84 card/modal markup round trips preserve content, formatting, technologies and image order',()=>{
  for(const p of records)for(const lang of ['tr','en'])for(const kind of ['card','modal']){
    const html=env.render(`portfolio/${kind}.njk`,{project:p,t:p[lang],lang,category:categories.find(c=>c.key===p.category),portfolio:{words}});
    const expected=source.projects.find(x=>x.id===p.id).translations[lang][kind].html+(kind==='modal'?(p[lang].legacyModalTail||''):'');
    assert.equal(legacyPortfolioMarkup(html),normalizeMarkup(expected),`${p.id}.${lang}.${kind}`);
  }
});
check('All gallery references resolve to original image manifest bytes, including alt translations',()=>{
  const known=new Map(images.unique.map(x=>['/'+x.file,x.sha256]));
  for(const p of records){const old=source.projects.find(x=>x.id===p.id);assert.equal(p.gallery.length,old.translations.tr.modal.images.length);for(const image of p.gallery){assert(known.has(image.file));assert.equal(crypto.createHash('sha256').update(fs.readFileSync('.'+image.file)).digest('hex'),known.get(image.file));}}
});
function verifyField(field,value,label){
  if(field.required && field.type!=='uuid')assert(value!==undefined&&value!==null&&value!=='',label);
  if(value===undefined||value===null)return;
  if(field.list){assert(Array.isArray(value),label);for(const item of value)verifyField({...field,list:false},item,label+'[]');return;}
  if(field.type==='object'){assert.equal(typeof value,'object',label);const names=field.fields.map(f=>f.name);for(const key of Object.keys(value))assert(names.includes(key),`${label}: undeclared CMS key ${key}`);for(const child of field.fields)verifyField(child,value[child.name],label+'.'+child.name);}
  else if(field.type==='number')assert.equal(typeof value,'number',label);
  else {assert.equal(typeof value,'string',label);if(field.type==='select')assert(field.options.values.some(v=>(typeof v==='string'?v:v.name)===value),label);}
}
check('Every stored JSON key is declared in supported CMS fields, and every required field has a value',()=>{
  const entry=config.content[0];assert.equal(entry.format,'json');assert.equal(entry.path,'src/content/projects');assert.equal(entry.operations.create,true);assert.equal(entry.operations.rename,false);assert.equal(entry.operations.delete,true);assert.equal(entry.filename.template,'{fields.uid}.json');
  for(const p of records)verifyField({name:'project',type:'object',fields:entry.fields},p,'project');
});
check('CMS media input/output map to the actual public passthrough directory; upload names are randomized',()=>{const m=config.media[0];assert.equal(m.input,'assets/portfolio');assert.equal(m.output,'/assets/portfolio');assert.equal(m.rename,'random');assert.equal(config.content[0].fields.find(f=>f.name==='gallery').fields[0].options.media,m.name);});
check('Existing TR/EN strong emphasis and distinct card/modal technologies retained',()=>{const p=records.find(p=>p.id===19);assert(p.tr.impact.includes('<strong>'));assert(p.en.impact.includes('<strong>'));assert.notDeepEqual(p.tr.technologies,p.tr.detailTechnologies);assert.notDeepEqual(records.find(p=>p.id===18).tr.technologies,records.find(p=>p.id===18).tr.detailTechnologies);});
check('Duplicate IDs/invalid orders, missing translation, unsafe content and missing media are rejected',()=>{
  let test=structuredClone(records);test.push(structuredClone(test[0]));assert.throws(()=>validateProjects(test));
  test=structuredClone(records);test[0].order=-1;assert.throws(()=>validateProjects(test));
  test=structuredClone(records);delete test[0].en;assert.throws(()=>validateProjects(test));
  test=structuredClone(records);test[0].tr.impact='<script>bad</script>';assert.throws(()=>validateProjects(test));
  test=structuredClone(records);test[0].tr.impact='<strong>unclosed';assert.throws(()=>validateProjects(test));
  test=structuredClone(records);test[0].gallery[0].file='/assets/portfolio/missing-image.png';assert.throws(()=>validateProjects(test));
});
check('Referenced/shared image deletion guard rejects removal without deleting any file',()=>{const p=records[0],shared=structuredClone(p);shared.id=22;shared.order=22;assert.throws(()=>assertMediaUnused([p,shared],p.gallery[0].file),/1, 22/);});
check('Project count is server-generated and language JS has no fixed stat1_num',()=>{const html=fs.readFileSync('_site/portfolyo/index.html','utf8');assert(html.includes('<strong id="stat1-num">21</strong>'));const js=fs.readFileSync('src/assets/js/portfolio-1.js','utf8');assert(!js.includes('stat1_num'));assert(js.includes("querySelectorAll('#grid-' + lang + ' .project-card').length"));});
fs.writeFileSync('migration/phase-6/historical-record-results.json',JSON.stringify({passed:checks.length,failed:0,checks},null,2)+'\n');
console.log(`${checks.length} project/CMS data checks passed; 84 lossless card/modal comparisons included.`);
