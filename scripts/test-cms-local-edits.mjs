// Isolated filesystem edits, NOT a Pages CMS/GitHub editor session.
// All test text/media is reused from the real records; no fictional project is retained.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root=fs.realpathSync(process.cwd());
const sourceDir='src/content/projects';
const files=fs.readdirSync(sourceDir).filter(f=>f.endsWith('.json'));
const originals=new Map(files.map(f=>[f,fs.readFileSync(path.join(sourceDir,f))]));
fs.mkdirSync('.migration-preview',{recursive:true});
const temp=fs.mkdtempSync(path.join('.migration-preview','cms-edit-data-'));
const upload=`assets/portfolio/qa-upload-${crypto.randomUUID()}.png`;
let ownsUpload=false;
const checks=[];
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const put=(name,data)=>fs.writeFileSync(path.join(temp,name),JSON.stringify(data,null,2)+'\n');
const editedOutput='.migration-preview/cms-edit-output',restoredOutput='.migration-preview/cms-restored-output';
function build(output){
  const absolute=path.resolve(output),preview=path.resolve('.migration-preview');
  assert.equal(path.dirname(absolute),preview); assert(absolute.startsWith(root+path.sep));
  if(fs.existsSync(absolute))assert(!fs.lstatSync(absolute).isSymbolicLink());
  fs.rmSync(absolute,{recursive:true,force:true});
  execFileSync(process.execPath,['node_modules/@11ty/eleventy/cmd.cjs',`--output=${output}`],{env:{...process.env,PORTFOLIO_TEST_DIR:temp},maxBuffer:2*1024*1024,stdio:['ignore','pipe','pipe']});
}
try{
  for(const [name,bytes]of originals)fs.writeFileSync(path.join(temp,name),bytes);
  const first=JSON.parse(originals.get('1.json')),second=JSON.parse(originals.get('2.json')),eighteenth=JSON.parse(originals.get('18.json'));
  const edited=structuredClone(first);
  edited.tr.title=second.tr.title;edited.en.intro=second.en.intro;edited.category='marketplace';
  edited.tr.technologies.push(eighteenth.tr.technologies.find(t=>!first.tr.technologies.includes(t)));
  fs.copyFileSync('.'+first.gallery[0].file,upload,fs.constants.COPYFILE_EXCL);ownsUpload=true;
  edited.gallery.push({...first.gallery[0],file:'/'+upload});put('1.json',edited);
  const additional=structuredClone(first);additional.id=22;additional.order=22;additional.category='finance';
  additional.links=[{url:'/portfolyo/',labelTR:first.tr.title,labelEN:first.en.title}];put('22.json',additional);
  build(editedOutput);
  const html=fs.readFileSync(`${editedOutput}/portfolyo/index.html`,'utf8');
  assert(html.includes('<strong id="stat1-num">22</strong>'));assert.equal((html.match(/data-pid=/g)||[]).length,44);assert.equal((html.match(/id="modal-(?:tr|en)-\d+"/g)||[]).length,44);
  checks.push('Isolated 22nd record produces 44 cards/modals and server counter 22');
  const card=html.match(/<article\b[^>]*data-lang="tr"[^>]*data-pid="1"[\s\S]*?<\/article>/)[0];
  assert(card.includes(edited.tr.title));assert(card.includes('data-category="marketplace"'));assert(card.includes(edited.tr.technologies.at(-1)));
  assert(html.includes(edited.en.intro));checks.push('TR title, EN intro, category and technology edits appear after a real Eleventy build');
  assert(html.includes('../'+upload));assert.equal(hash(fs.readFileSync(`${editedOutput}/${upload}`)),hash(fs.readFileSync(upload)));checks.push('Locally copied PNG gallery addition is published with exact bytes; this is not a CMS upload test');
  assert(html.includes('href="/portfolyo/"'));checks.push('Optional project links render from structured data');
  fs.writeFileSync(path.join(temp,'1.json'),originals.get('1.json'));fs.unlinkSync(path.join(temp,'22.json'));
  build(restoredOutput);
  const restored=fs.readFileSync(`${restoredOutput}/portfolyo/index.html`);
  assert.equal(hash(restored),hash(fs.readFileSync('_site/portfolyo/index.html')));checks.push('Undo restores the previous generated portfolio byte-for-byte and count 21');
  for(const [name,bytes]of originals)assert.deepEqual(fs.readFileSync(path.join(sourceDir,name)),bytes);assert.equal(fs.readdirSync(sourceDir).length,21);checks.push('Production source records never changed; synthetic record exists only in ignored QA output');
  fs.writeFileSync('migration/phase-4/local-edit-results.json',JSON.stringify({passed:checks.length,failed:0,editorTested:false,fixtureContent:'Existing project 1 copied temporarily; no invented project or description saved to production records',checks},null,2)+'\n');
  console.log(`${checks.length} isolated CMS-style edit/build/undo checks passed; real CMS editor NOT tested.`);
}finally{
  if(ownsUpload){assert(upload.startsWith('assets/portfolio/qa-upload-'));fs.unlinkSync(upload);}
  const resolved=path.resolve(temp);assert.equal(path.dirname(resolved),path.resolve('.migration-preview'));assert(path.basename(resolved).startsWith('cms-edit-data-'));fs.rmSync(resolved,{recursive:true,force:true});
}
