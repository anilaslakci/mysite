import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {loadBlog,readPost} from '../lib/blog.mjs';

// All simulated output stays outside the production artifact directory.
const root=path.resolve('.migration-preview/november-boundaries');
assert(root.startsWith(path.resolve('.migration-preview')+path.sep));
const out=path.join(root,'site');
const calendar=JSON.parse(fs.readFileSync('migration/phase-18/calendar.json'));
const baseline=JSON.parse(fs.readFileSync('migration/phase-18/preserved-files.json'));
const hash=file=>{const b=fs.readFileSync(file);return crypto.createHash('sha256').update(/\.(md|json|svg)$/.test(file)?b.toString('utf8').replace(/\r\n/g,'\n'):b).digest('hex');};
for(const [file,sha] of Object.entries(baseline.files))assert.equal(hash(file),sha,`Existing file changed: ${file}`);
for(const p of calendar.posts){
  const record=readPost(p.source);assert.equal(record.uid,p.uid);assert.equal(record.slug,p.slug);
  assert.equal(record.locale,'tr');assert.equal(record.status,'published');assert.equal(record.publishAt,p.publishAt);
  assert(!record.translationKey&&!record.translationOf);
  assert.equal(new Date(record.publishAt).getUTCDay(),1);assert.equal(new Date(record.publishAt).getUTCHours(),7);
  assert.equal(new Date(record.publishAt).getUTCMinutes(),0);
  assert.equal(hash(p.source),p.sha256);
  const bytes=fs.readFileSync(record.cover.slice(1));assert.equal(bytes.readUInt32BE(16),1200);assert.equal(bytes.readUInt32BE(20),675);
  assert(record.coverAlt.length>20);assert(bytes.length<80000);
}
const cases=[['2026-11-02T09:00:00+03:00',0],['2026-11-02T09:59:00+03:00',0],['2026-11-02T09:59:59+03:00',0],['2026-11-02T10:00:00+03:00',1],['2026-11-02T10:17:00+03:00',1],['2026-11-09T09:59:00+03:00',1],['2026-11-09T10:00:00+03:00',2],['2026-11-16T10:00:00+03:00',3],['2026-11-23T10:00:00+03:00',4]];
fs.mkdirSync(root,{recursive:true});const results=[];
for(const [time,count] of cases){
  fs.rmSync(out,{recursive:true,force:true});
  const env={...process.env,SITE_BUILD_TIME:time,SITE_TEST_OUTPUT:out};
  // Explicitly use real checked-in content, not another suite's fixture overrides.
  delete env.BLOG_TEST_DIR;delete env.BLOG_CATEGORY_TEST_DIR;
  execFileSync(process.execPath,['node_modules/@11ty/eleventy/cmd.cjs','--output='+out],{env,stdio:'pipe'});
  execFileSync(process.execPath,['scripts/test-blog-output.mjs'],{env,stdio:'pipe'});
  const blog=loadBlog({now:new Date(time)});assert.equal(blog.posts.length,4+count);
  const htmls=[];const walk=dir=>{for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(/\.(html|xml)$/.test(e.name))htmls.push(fs.readFileSync(file,'utf8'));}};walk(out);
  const all=htmls.join('\n');
  for(const [i,p] of calendar.posts.entries()){
    const present=i<count;assert.equal(fs.existsSync(path.join(out,'blog',p.slug,'index.html')),present);
    assert.equal(fs.readFileSync(path.join(out,'sitemap.xml'),'utf8').includes('/blog/'+p.slug+'/'),present);
    assert.equal(fs.readFileSync(path.join(out,'feed.xml'),'utf8').includes('urn:uuid:'+p.uid),present);
    if(!present){assert(!all.includes('/blog/'+p.slug+'/'));assert(!all.includes(p.title));assert(!all.includes(p.uid));}
  }
  assert.equal(blog.posts.filter(p=>calendar.posts.some(n=>n.uid===p.uid)).length,count);
  results.push({time,newArticles:count,totalArticles:blog.posts.length,htmlSitemapRssRelated:'passed'});
  console.log(`November publication: ${time} -> ${count} new / ${blog.posts.length} total; output, SEO and links passed`);
}
// Status remains a gate independently of the scheduled date.
const fixture=path.join(root,'posts');fs.mkdirSync(fixture,{recursive:true});
for(const file of fs.readdirSync('src/content/posts'))fs.copyFileSync(path.join('src/content/posts',file),path.join(fixture,file));
const first=path.join(fixture,path.basename(calendar.posts[0].source));
fs.writeFileSync(first,fs.readFileSync(first,'utf8').replace('status: "published"','status: "draft"'));
assert.equal(loadBlog({directory:fixture,now:new Date('2026-11-24T10:00:00+03:00')}).posts.length,7);
// Early CMS saves do not override publication time.
fs.writeFileSync(first,fs.readFileSync(first,'utf8').replace('status: "draft"','status: "published"')+'\nEk editoryal test metni.\n');
assert.equal(loadBlog({directory:fixture,now:new Date('2026-11-02T09:59:59+03:00')}).posts.length,4);
for(const [file,sha] of Object.entries(baseline.files))assert.equal(hash(file),sha);
fs.writeFileSync(path.join(root,'results.json'),JSON.stringify({cases:results,draftAfterDue:'passed',earlyCmsEdit:'passed',oldFilesUnchanged:Object.keys(baseline.files).length},null,2)+'\n');
console.log('November calendar, independent draft gate, early CMS edit and original file preservation passed.');
