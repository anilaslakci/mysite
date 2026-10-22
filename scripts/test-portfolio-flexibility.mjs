// Real builds from isolated copies. Original projects/categories/media are never edited.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {loadPortfolio,validateProjects,loadCategories,assertMediaUnused} from '../lib/portfolio.mjs';
const root=process.cwd(), work=path.resolve('.migration-preview/phase-4-fixtures');
fs.mkdirSync(work,{recursive:true});
const dir=fs.mkdtempSync(path.join(work,'records-')), cats=fs.mkdtempSync(path.join(work,'categories-'));
const original=new Map(fs.readdirSync('src/content/projects').map(f=>[f,fs.readFileSync(`src/content/projects/${f}`)]));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const categoriesBefore=new Map(fs.readdirSync('src/content/categories').map(f=>[f,hash(fs.readFileSync(`src/content/categories/${f}`))]));
const checks=[];
const put=(p)=>fs.writeFileSync(path.join(dir,`${p.id}.json`),JSON.stringify(p));
const putCat=c=>fs.writeFileSync(path.join(cats,`${c.key}.json`),JSON.stringify(c));
const build=(name,fail=false)=>{
  const out=path.join(work,name);
  try {execFileSync(process.execPath,['node_modules/@11ty/eleventy/cmd.cjs',`--output=${out}`],{env:{...process.env,PORTFOLIO_TEST_DIR:dir,PORTFOLIO_CATEGORY_TEST_DIR:cats},stdio:'pipe'});assert(!fail,'Expected build rejection');}
  catch(e){if(fail&&e.status)return '';throw e;}
  return fs.readFileSync(path.join(out,'portfolyo/index.html'),'utf8');
};
const check=(name,fn)=>{fn();checks.push(name);};
const load=()=>loadPortfolio({directory:dir,categoryDirectory:cats});
const count=(html,n)=>{assert(html.includes(`<strong id="stat1-num">${n}</strong>`));assert.equal((html.match(/data-pid=/g)||[]).length,n*2);assert.equal((html.match(/id="modal-(?:tr|en)-\d+"/g)||[]).length,n*2);};
try {
  for(const [f,b]of original)fs.writeFileSync(path.join(dir,f),b);
  fs.cpSync('src/content/categories',cats,{recursive:true});
  const base=JSON.parse(original.get('1.json')), p22={...structuredClone(base),id:22},p23={...structuredClone(base),id:23};delete p22.order;delete p23.order;
  check('Add projects 22 and 23; unset order appends with deterministic ID tie-break',()=>{put(p22);put(p23);count(build('23-projects'),23);assert.deepEqual(load().projects.slice(-2).map(p=>p.id),[22,23]);});
  check('Existing order can change independently of ID',()=>{const p={...base,order:100};put(p);assert.equal(load().projects.at(-3).id,1);count(build('reordered'),23);});
  check('Equal orders retain both records and sort by ID',()=>{p22.order=2;p23.order=2;put(p22);put(p23);const ids=load().projects.filter(p=>p.order===2).map(p=>p.id);assert.deepEqual(ids,[2,22,23]);count(build('ties'),23);});
  check('Archive removes both translations/modals and counter; unarchive restores',()=>{p22.archived=true;put(p22);const h=build('archived');count(h,22);assert(!h.includes('data-pid="22"'));p22.archived=false;put(p22);count(build('restored'),23);});
  check('Delete one project without renumbering or losing remaining modals',()=>{fs.unlinkSync(path.join(dir,'2.json'));const h=build('deleted');count(h,22);assert(!h.includes('data-pid="2"'));assert(h.includes('id="modal-en-23"'));});
  check('New category from data generates filters and safe default color',()=>{putCat({key:'qa-category',tr:'Veri Analizi',en:'Data Analysis'});p23.category='qa-category';put(p23);const h=build('new-category');assert(h.includes("filterProjects('qa-category', this)"));assert.equal(load().categories.find(c=>c.key==='qa-category').color,'#48C9B0');});
  check('Category label edits propagate; archive hides unused filter; unused category can be deleted',()=>{
    putCat({key:'qa-category',tr:'Finans',en:'Finance'});const h=build('category-renamed');assert(h.includes("filterProjects('qa-category', this)\">Finance</button>"));assert.equal(load().projects.find(p=>p.id===23).category,'qa-category');
    p23.archived=true;put(p23);const archived=build('category-archived');count(archived,21);assert(!archived.includes("filterProjects('qa-category', this)"));assert.throws(()=>assertMediaUnused(load().allProjects,base.gallery[0].file),/23/);
    p23.archived=false;put(p23);putCat({key:'unused',tr:'Finans',en:'Finance'});assert(!build('unused-category').includes("filterProjects('unused', this)"));fs.unlinkSync(path.join(cats,'unused.json'));count(build('unused-category-deleted'),22);
  });
  check('Deleting a referenced category rejects the build, including archived projects',()=>{fs.unlinkSync(path.join(cats,'qa-category.json'));build('missing-category',true);assert.throws(load,/Unknown category/);p23.archived=true;put(p23);build('missing-archived-category',true);putCat({key:'qa-category',tr:'Finans',en:'Finance'});p23.archived=false;put(p23);});
  check('Tech, independent translations, gallery ordering and shared media survive a build',()=>{p23.tr.title=JSON.parse(original.get('3.json')).tr.title;p23.en.intro=JSON.parse(original.get('4.json')).en.intro;p23.tr.technologies.push('JavaScript');p23.gallery.push({...base.gallery[0]});p23.gallery.reverse();put(p23);const h=build('content-edits');assert(h.includes(p23.tr.title));assert(h.includes(p23.en.intro));const p=load().projects.find(p=>p.id===23);assert.equal(p.gallery.at(-1).file,base.gallery[0].file);assert.throws(()=>assertMediaUnused([p22,p23],base.gallery[0].file),/22, 23/);});
  check('Optional links can be added and removed',()=>{p23.links=[{url:'/portfolyo/',labelTR:base.tr.title,labelEN:base.en.title}];put(p23);assert(build('links').includes(`href="/portfolyo/">${base.tr.title}</a>`));delete p23.links;put(p23);assert(!build('links-removed').includes(`href="/portfolyo/">${base.tr.title}</a>`));});
  check('Minimal bilingual project works without optional detail text, tech, gallery or order',()=>{put({id:24,category:'finance',tr:{title:base.tr.title,summary:base.tr.summary},en:{title:base.en.title,summary:base.en.summary}});count(build('minimal'),23);});
  check('Empty portfolio builds with zero count, no cards/modals or category filters',()=>{const empty=fs.mkdtempSync(path.join(work,'empty-'));const p=loadPortfolio({directory:empty,categoryDirectory:cats});assert.equal(p.projects.length,0);execFileSync(process.execPath,['node_modules/@11ty/eleventy/cmd.cjs',`--output=${path.join(work,'empty-site')}`],{env:{...process.env,PORTFOLIO_TEST_DIR:empty,PORTFOLIO_CATEGORY_TEST_DIR:cats},stdio:'pipe'});count(fs.readFileSync(path.join(work,'empty-site/portfolyo/index.html'),'utf8'),0);});
  check('Duplicate IDs, bad ID/order/archive, missing translations, unsafe HTML/URLs, bad media/alts fail',()=>{
    const invalid=[p=>p.id=0,p=>p.order=-1,p=>p.archived='yes',p=>delete p.en,p=>p.tr.summary='<script>x</script>',p=>p.tr.summary='<strong>x',p=>p.gallery[0].file='/assets/portfolio/../x.png',p=>p.gallery[0].file='/assets/portfolio/missing.png',p=>p.gallery[0].altEN='',p=>p.links=[{url:'javascript:alert(1)',labelTR:'x',labelEN:'x'}]];
    for(const edit of invalid){const p=structuredClone(base);edit(p);assert.throws(()=>validateProjects([p]));}assert.throws(()=>validateProjects([base,base]),/Duplicate project id/);
    fs.writeFileSync(path.join(dir,'9999.json'),JSON.stringify(base));assert.throws(load,/ID\/filename mismatch/);fs.unlinkSync(path.join(dir,'9999.json'));
    putCat({key:'unsafe',tr:'Finans',en:'Finance',color:'red;display:none'});assert.throws(()=>loadCategories(cats),/Invalid category color/);fs.unlinkSync(path.join(cats,'unsafe.json'));
  });
  check('Original source files remain byte-identical to synced CMS baseline',()=>{assert.equal(fs.readdirSync('src/content/projects').length,original.size);for(const [f,b]of original)assert.deepEqual(fs.readFileSync(`src/content/projects/${f}`),b);for(const [f,h]of categoriesBefore)assert.equal(hash(fs.readFileSync(`src/content/categories/${f}`)),h);});
  // Keep an ignored fixture for explicit browser checks; this never touches real records.
  fs.writeFileSync(path.join(work,'fixture-info.json'),JSON.stringify({projects:dir,categories:cats,output:path.join(work,'minimal'),count:23},null,2));
  fs.mkdirSync('migration/phase-4',{recursive:true});fs.writeFileSync('migration/phase-4/flexibility-results.json',JSON.stringify({passed:checks.length,failed:0,checks,realCmsEditor:false},null,2)+'\n');
  console.log(`${checks.length} isolated flexibility scenarios passed (real Eleventy builds).`);
} catch(error) { console.error(error);process.exitCode=1; }
