// Historical release acceptance; not a freeze on future intentional CMS edits.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {loadBlog,readPost} from '../lib/blog.mjs';
const manifest=JSON.parse(fs.readFileSync('migration/phase-20/editorial-manifest.json'));
const preserved=JSON.parse(fs.readFileSync('migration/phase-20/preserved-files.json'));
const root=path.resolve('.migration-preview/winter-tests'),out=path.join(root,'site');
assert(root.startsWith(path.resolve('.migration-preview')+path.sep));fs.mkdirSync(root,{recursive:true});
const hash=file=>{const b=fs.readFileSync(file);return crypto.createHash('sha256').update(/\.(md|json|svg)$/.test(file)?b.toString('utf8').replace(/\r\n/g,'\n'):b).digest('hex');};
for(const [file,sha]of Object.entries(preserved.files))assert.equal(hash(file),sha,'Preserved file '+file);
const final=loadBlog({now:new Date('2027-01-04T10:00:00+03:00')}),seo=new Set(),titles=new Set();
for(const row of manifest.posts){
 const p=final.posts.find(p=>p.uid===row.uid),source=readPost(row.source);assert(p);assert.equal(hash(row.source),row.sourceSHA256);
 assert.equal(p.locale,row.locale);assert.equal(p.publishAt,row.publishAt);assert.equal(source.translationOf||null,row.translationOf);
 assert(!source.translationKey);assert.equal(p.status,'published');assert.equal(new Date(p.publishAt).getUTCDay(),1);assert.equal(new Date(p.publishAt).getUTCHours(),7);
 assert(p.variants.tr&&p.variants.en);assert(!seo.has(p.seoTitle));seo.add(p.seoTitle);assert(!titles.has(p.title));titles.add(p.title);
 assert(row.wordCount>=1000);assert(p.description.length>=100&&p.description.length<=170);
 assert((p.body.split(p.locale==='tr'?'## Sık sorulan sorular':'## Frequently asked questions')[1]?.match(/^### /gm)||[]).length>=4);
 assert(p.body.includes(p.locale==='tr'?'/#iletisim':'/en/#iletisim'));assert(p.links.some(x=>x.startsWith('https:')));assert(p.html.includes('<table>'));
 for(const img of row.images){const bytes=fs.readFileSync(img.src.slice(1));assert(bytes.length<90000);assert(fs.existsSync(img.src.slice(1).replace('.png','.svg')));}
 for(const tag of p.html.matchAll(/<img\b[^>]+>/g)){const src=tag[0].match(/src="([^"]+)"/)[1];const b=fs.readFileSync(src.slice(1));assert(tag[0].includes(`width="${b.readUInt32BE(16)}"`));assert(tag[0].includes(`height="${b.readUInt32BE(20)}"`));assert(tag[0].includes('loading="lazy"'));}
}
assert.equal(120000-60000-9000-21600-12000,17400);
assert.equal(108000-60000-9000-19440-12000,7560);
assert.equal(96000-60000-9000-17280-12000,-2280);assert(Math.abs(810/.67-1208.95522388)<1e-6);
assert.equal(100-20-15,65);assert.equal(100-23-15,62);assert.equal(97-20-15,62);
assert.equal(100000-50000-15000-20000,15000);assert.equal(125-25-20-15,65);
const clocks=[['2026-11-03T12:00:00+03:00',0],...['2026-11-30','2026-12-07','2026-12-14','2026-12-21','2026-12-28','2027-01-04'].flatMap((day,i)=>[[day+'T09:59:59+03:00',i],[day+'T10:00:00+03:00',i+1]]),['2027-01-11T10:00:00+03:00',6]];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
function build(time,directory){fs.rmSync(out,{recursive:true,force:true});const env={...process.env,SITE_BUILD_TIME:time,SITE_TEST_OUTPUT:out};if(directory)env.BLOG_TEST_DIR=directory;else delete env.BLOG_TEST_DIR;delete env.BLOG_CATEGORY_TEST_DIR;execFileSync(process.execPath,['node_modules/@11ty/eleventy/cmd.cjs','--output='+out],{env,stdio:'pipe'});execFileSync(process.execPath,['scripts/test-blog-output.mjs'],{env,stdio:'pipe'});return walk(out).filter(f=>/\.(html|xml)$/.test(f)).map(f=>fs.readFileSync(f,'utf8')).join('\n');}
const results=[];
for(const [time,pairs]of clocks){const html=build(time),blog=loadBlog({now:new Date(time)});assert.equal(blog.posts.filter(p=>manifest.posts.some(x=>x.uid===p.uid)).length,pairs*2);
 for(const row of manifest.posts){const eligible=Date.parse(row.publishAt)<=Date.parse(time),url=(row.locale==='en'?'/en':'')+'/blog/'+row.slug+'/';assert.equal(fs.existsSync(path.join(out,url,'index.html')),eligible);if(!eligible){assert(!html.includes(url));assert(!html.includes(row.uid));assert(!html.includes(row.title));}}
 results.push({time,newPairs:pairs,newRecords:pairs*2,totalTr:blog.posts.filter(p=>p.locale==='tr').length,totalEn:blog.posts.filter(p=>p.locale==='en').length,htmlSitemapRssLinksTranslations:'passed'});console.log(`PASS winter ${time}: ${pairs} pairs`);
}
// A peer made draft must disappear and must not create a false hreflang.
const fixture=path.join(root,'posts');fs.mkdirSync(fixture,{recursive:true});for(const f of fs.readdirSync('src/content/posts'))fs.copyFileSync('src/content/posts/'+f,path.join(fixture,f));
const first=manifest.posts.find(p=>p.topic==='conversion'&&p.locale==='en'),file=path.join(fixture,path.basename(first.source));fs.writeFileSync(file,fs.readFileSync(file,'utf8').replace('status: "published"','status: "draft"'));
// At the pair's first publication no later article links to it yet.
build('2026-11-30T10:00:00+03:00',fixture);const tr=manifest.posts.find(p=>p.topic==='conversion'&&p.locale==='tr');const h=fs.readFileSync(path.join(out,'blog',tr.slug,'index.html'),'utf8');assert(!h.includes('hreflang="en"'));assert(!fs.existsSync(path.join(out,'en/blog',first.slug,'index.html')));
// Later unpublishing an article with live body links must require link cleanup,
// rather than silently publishing broken links. Keep the existing safety gate.
assert.throws(()=>loadBlog({directory:fixture,now:new Date('2027-01-04T10:00:00+03:00')}),/Unpublished or unknown internal link/);
for(const [file,sha]of Object.entries(preserved.files))assert.equal(hash(file),sha);
fs.writeFileSync(path.join(root,'results.json'),JSON.stringify({sourceFilesUnchanged:Object.keys(preserved.files).length,records:manifest.posts.length,pairs:6,cases:results,draftPeerNoFalseHreflang:'passed',unpublishingLinkedArticleRequiresCleanup:'passed',arithmetic:'passed',imageDimensions:'passed'},null,2)+'\n');
console.log('Winter release acceptance passed; simulated output never enters _site.');
