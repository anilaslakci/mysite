// Verifies saved observations from a real local browser; not a hosted CMS session.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const dir='migration/phase-6',r=JSON.parse(fs.readFileSync(`${dir}/browser-results.json`));
for(const name of ['desktop','tablet','mobile']){
  const list=r.blogViews.find(v=>v.view===name&&v.page==='list'),filtered=r.blogViews.find(v=>v.view===name&&v.page==='filtered'),post=r.blogViews.find(v=>v.view===name&&v.page==='post');
  assert(list&&!list.overflow);assert.equal(list.count,'2 yazı');assert.equal(filtered.count,'1 yazı');assert.equal(filtered.visible,1);assert.equal(filtered.pressed,'true');
  assert(post&&!post.overflow);assert.equal(post.h1,1);assert(post.related.length===1);assert(post.images.every(i=>i.loaded&&i.alt));assert.deepEqual(post.jsonld,['BlogPosting','BreadcrumbList']);
  assert(fs.statSync(`${dir}/screenshots/blog-post-${name}.png`).size>1000);
}
for(const c of r.portfolioComparisons){assert(c.equal);assert.deepEqual(fs.readFileSync(`${dir}/screenshots/portfolio-${c.view}-before.png`),fs.readFileSync(`${dir}/screenshots/portfolio-${c.view}-after.png`));}
assert.equal(r.portfolioModals.length,42);assert(r.portfolioModals.every(m=>m.open));assert(r.home.blogLink==='/blog/'&&!r.home.overflow);assert(r.empty.posts===0&&!r.empty.overflow);assert.deepEqual(r.logs,[]);assert.equal(r.realCmsEditor,false);
console.log('Browser evidence verified: blog desktop/tablet/mobile, filters, post images and SEO, home link, empty state; 42 portfolio modals and identical desktop/mobile screenshots; no console errors.');
