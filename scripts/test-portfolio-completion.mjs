// Isolated UUID/lifecycle/media safety QA. Does not save to a remote CMS.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {Worker} from 'node:worker_threads';
import {loadPortfolio,projectIdentity,isUUID,validateProjects,mediaReferences} from '../lib/portfolio.mjs';
const yaml=createRequire(import.meta.url)('js-yaml');
const work=fs.mkdtempSync(path.resolve('.migration-preview/phase5-qa-'));
const dirs={projects:path.join(work,'projects'),categories:path.join(work,'categories'),media:path.join(work,'media')};
for(const [key,dir]of Object.entries(dirs))fs.cpSync(`src/content/${key}`,dir,{recursive:true});
const sources=['projects','categories','media'].flatMap(key=>fs.readdirSync(`src/content/${key}`).map(file=>({file:`src/content/${key}/${file}`,bytes:fs.readFileSync(`src/content/${key}/${file}`)})));
const load=()=>loadPortfolio({directory:dirs.projects,categoryDirectory:dirs.categories});
// loadPortfolio takes this env only for the registry, fixtures never touch production JSON.
process.env.PORTFOLIO_MEDIA_TEST_DIR=dirs.media;
const put=p=>fs.writeFileSync(path.join(dirs.projects,`${projectIdentity(p)}.json`),JSON.stringify(p));
const cat=c=>fs.writeFileSync(path.join(dirs.categories,`${c.key}.json`),JSON.stringify(c));
const md=m=>fs.writeFileSync(path.join(dirs.media,`${m.uid}.json`),JSON.stringify(m));
const checks=[], negatives=[];
const check=(name,fn)=>{const result=fn();if(result?.then)return result.then(()=>checks.push(name));checks.push(name);};
const build=(name,{fail=false}={})=>{
  const output=path.join(work,name);
  try{execFileSync(process.execPath,['node_modules/@11ty/eleventy/cmd.cjs',`--output=${output}`],{env:{...process.env,PORTFOLIO_TEST_DIR:dirs.projects,PORTFOLIO_CATEGORY_TEST_DIR:dirs.categories},stdio:'pipe'});assert(!fail,'Expected rejection');}
  catch(error){if(fail&&error.status){negatives.push(name);return '';}throw error;}
  return fs.readFileSync(path.join(output,'portfolyo/index.html'),'utf8');
};
const count=(html,n)=>{assert(html.includes(`<strong id="stat1-num">${n}</strong>`));assert.equal((html.match(/data-pid=/g)||[]).length,n*2);assert.equal((html.match(/id="modal-(?:tr|en)-[0-9a-f-]+"/g)||[]).length,n*2);};
const first=JSON.parse(sources.find(x=>x.file==='src/content/projects/1.json').bytes);
const config=yaml.load(fs.readFileSync('.pages.yml','utf8'));
const uidField=config.content[0].fields.find(f=>f.name==='uid');
let p22,p23,upload;
try {
  await check('Official UUID default generates 10000 distinct UUID v4 values across four concurrent workers',async()=>{
    const official=fs.readFileSync('migration/phase-5/upstream/uuid-field.ts.txt','utf8');
    const body=official.match(/const defaultValue = \(\): string => \{([\s\S]*?)\};/)[1];
    assert.equal(body.trim(),'return crypto.randomUUID();');
    const generate=new Function('crypto',body).bind(null,crypto);
    const workerCode=`const {parentPort,workerData}=require('node:worker_threads'); const crypto=require('node:crypto'); const generate=new Function('crypto',workerData).bind(null,crypto); parentPort.postMessage(Array.from({length:2500},generate));`;
    const batches=await Promise.all(Array.from({length:4},()=>new Promise((resolve,reject)=>{const worker=new Worker(workerCode,{eval:true,workerData:body});worker.once('message',resolve);worker.once('error',reject);worker.once('exit',code=>{if(code!==0)reject(new Error('UUID worker failed'));});})));
    const ids=batches.flat();assert.equal(ids.length,10000);assert.equal(new Set(ids).size,ids.length);assert(ids.every(isUUID));
    assert.equal(uidField.type,'uuid');assert(uidField.hidden&&uidField.readonly&&uidField.options.generate===false&&uidField.options.editable===false);assert(!('default' in uidField));
    assert.equal(config.content[0].filename.template,'{fields.uid}.json');
    p22={...structuredClone(first),id:undefined,uid:generate(),order:undefined};p23={...structuredClone(first),id:'',uid:generate(),order:''};
  });
  check('Two independently created UUID records build 23 projects and safe string modal handlers',()=>{
    put(p22);put(p23);const h=build('uuid-projects');count(h,23);for(const p of [p22,p23]){assert(h.includes(`data-pid="${p.uid}" onclick="openProject(this.dataset.pid)"`));assert(h.includes(`id="modal-en-${p.uid}"`));}
    assert.deepEqual(load().projects.slice(-2).map(p=>p.id),[p22.uid,p23.uid].sort());
  });
  check('Legacy numeric identities survive an automatically added UID during an old-record save',()=>{
    const p={...first,uid:crypto.randomUUID()};put(p);const h=build('legacy-edit');assert(h.includes('id="modal-tr-1"'));assert(!h.includes(`id="modal-tr-${p.uid}"`));put(first);
  });
  check('ID/filename tampering and duplicate UUIDs reject the build',()=>{
    const bad={...first,id:999};fs.writeFileSync(path.join(dirs.projects,'1.json'),JSON.stringify(bad));build('changed-id',{fail:true});put(first);
    assert.throws(()=>validateProjects([p22,{...p22}]),/Duplicate/);
    assert.throws(()=>validateProjects([p22,{...first,uid:p22.uid}]),/Duplicate project UUID/);
  });
  check('UUID records reorder, tie, archive and republish without altering identity',()=>{
    p22.order=1;p23.order=1;put(p22);put(p23);count(build('uuid-ties'),23);assert.deepEqual(load().projects.slice(0,3).map(p=>p.id),[1,...[p22.uid,p23.uid].sort()]);
    p22.archived=true;put(p22);const h=build('uuid-archived');count(h,22);assert(!h.includes(`data-pid="${p22.uid}"`));p22.archived=false;put(p22);count(build('uuid-republished'),23);
  });
  check('Unused category archives/reactivates; archived selection fails, no unsupported CMS filtering claimed',()=>{
    const c={key:'qa-category',tr:'Finans',en:'Finance',archived:true};cat(c);assert(!build('unused-category-archived').includes("filterProjects('qa-category', this)"));
    p23.category=c.key;put(p23);build('archived-category-selection',{fail:true});c.archived=false;cat(c);assert(build('category-reactivated').includes("filterProjects('qa-category', this)"));
    c.tr='Veri Analizi';c.en='Data Analysis';c.color='#FF9F43';c.order=1;cat(c);assert(build('category-label-color').includes('Data Analysis</button>'));
    c.archived=true;cat(c);build('used-category-archive',{fail:true});c.archived=false;cat(c);
    fs.unlinkSync(path.join(dirs.categories,c.key+'.json'));build('used-category-delete',{fail:true});cat(c);
    fs.writeFileSync(path.join(dirs.categories,c.key+'.json'),JSON.stringify({...c,key:'renamed'}));build('category-key-change',{fail:true});cat(c);
  });
  check('Metadata archive preserves every shared gallery and can be reused/reactivated',()=>{
    const m=load().media.find(m=>m.file===first.gallery[0].file),bytes=fs.readFileSync('.'+m.file);m.archived=true;md(m);
    const h=build('media-archived');count(h,23);assert(h.includes(m.file.slice(1)));assert.deepEqual(fs.readFileSync('.'+m.file),bytes);assert(mediaReferences(load().allProjects,m.file).includes(p22.uid));
    p23.gallery.push({...first.gallery[0]});put(p23);count(build('archived-media-reuse'),23);m.archived=false;md(m);count(build('media-reactivated'),23);
    assert.equal(config.content.find(c=>c.name==='portfolioMedia').operations.delete,false);
  });
  check('Missing registered physical image rejects build even if metadata is archived and unused',()=>{
    const m={uid:crypto.randomUUID(),file:'/assets/portfolio/not-present.png',title:'',archived:true};md(m);build('missing-registered-image',{fail:true});fs.unlinkSync(path.join(dirs.media,m.uid+'.json'));
  });
  check('Local upload bytes, gallery order, bilingual alt texts and shared use are preserved',()=>{
    upload=`assets/portfolio/qa-upload-${crypto.randomUUID()}.png`;fs.copyFileSync('.'+first.gallery[0].file,upload,fs.constants.COPYFILE_EXCL);
    p22.gallery=[{...first.gallery[0],file:'/'+upload},...first.gallery.slice().reverse()];put(p22);const h=build('uploaded-gallery');assert(h.includes(upload));
    assert.deepEqual(fs.readFileSync(path.join(work,'uploaded-gallery',upload)),fs.readFileSync(upload));assert.equal(load().projects.find(p=>p.id===p22.uid).gallery[0].file,'/'+upload);
    const m={uid:crypto.randomUUID(),file:'/'+upload,archived:false};md(m);count(build('upload-registered'),23);
  });
  check('Independent translations, technology and optional links work; record deletion leaves others intact',()=>{
    p22.tr.title=JSON.parse(sources.find(s=>s.file==='src/content/projects/3.json').bytes).tr.title;p22.en.intro=first.en.summary;p22.tr.technologies.push('JavaScript');p22.links=[{url:'/portfolyo/',labelTR:first.tr.title,labelEN:first.en.title}];put(p22);
    let h=build('uuid-content-edits');assert(h.includes(p22.tr.title));assert(h.includes(`href="/portfolyo/">${first.tr.title}</a>`));delete p22.links;put(p22);h=build('links-removed');assert(!h.includes(`href="/portfolyo/">${first.tr.title}</a>`));
    fs.unlinkSync(path.join(dirs.projects,p23.uid+'.json'));h=build('uuid-deleted');count(h,22);assert(!h.includes(`data-pid="${p23.uid}"`));assert(h.includes('id="modal-tr-1"'));put(p23);
  });
  check('Duplicate metadata and media path tampering reject the build',()=>{
    const m={...load().media[0],uid:crypto.randomUUID()};md(m);build('duplicate-media',{fail:true});fs.unlinkSync(path.join(dirs.media,m.uid+'.json'));
    m.file='/assets/portfolio/../outside.png';md(m);build('unsafe-media-path',{fail:true});fs.unlinkSync(path.join(dirs.media,m.uid+'.json'));
  });
  check('Production records, categories and metadata are byte-identical after isolated edits',()=>{for(const s of sources)assert.deepEqual(fs.readFileSync(s.file),s.bytes);});
  // A clean 23-project browser fixture, including UUID and archived/reused media.
  build('browser-site');
  execFileSync(process.execPath,['scripts/test-portfolio-runtime.mjs'],{env:{...process.env,PORTFOLIO_TEST_DIR:dirs.projects,PORTFOLIO_CATEGORY_TEST_DIR:dirs.categories,SITE_TEST_OUTPUT:path.join(work,'browser-site')},stdio:'pipe'});
  fs.writeFileSync('.migration-preview/phase-5-fixture.json',JSON.stringify({site:path.join(work,'browser-site'),uid:p22.uid,otherUid:p23.uid,count:23},null,2));
  fs.writeFileSync('migration/phase-6/completion-test-results.json',JSON.stringify({passed:checks.length,failed:0,negativeBuilds:negatives,uuidSamples:10000,concurrentUuidWorkers:4,collisionObserved:false,realCmsEditor:false,checks},null,2)+'\n');
  console.log(`${checks.length} completion scenarios passed, ${negatives.length} invalid builds correctly rejected. 10000 UUID samples, no collisions observed. Real hosted CMS NOT tested.`);
} finally {
  // Only the uniquely named test upload is removed. The ignored fixture preserves its byte copy.
  if(upload){assert(upload.startsWith('assets/portfolio/qa-upload-'));fs.unlinkSync(upload);}
}
