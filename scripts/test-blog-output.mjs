import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {loadBlog,postStructuredData} from '../lib/blog.mjs';
const output=process.env.SITE_TEST_OUTPUT||'_site',blog=loadBlog();
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const text=file=>fs.readFileSync(path.join(output,file),'utf8');
const sitemap=text('sitemap.xml'),rss=text('feed.xml');
function wellFormed(xml){const stack=[];assert(xml.startsWith('<?xml'));assert(!/&(?!(?:amp|lt|gt|quot|apos);)/.test(xml),'XML entity escaping');for(const m of xml.matchAll(/<([^>]+)>/g)){if(m[1].startsWith('?'))continue;const name=m[1].match(/^\/?([^\s/]+)/)[1];if(m[1].startsWith('/'))assert.equal(stack.pop(),name,'XML nesting');else if(!m[1].endsWith('/'))stack.push(name);}assert.equal(stack.length,0);}
wellFormed(sitemap);wellFormed(rss);
const expected=['/', '/blog/',...JSON.parse(fs.readFileSync('migration/phase-2/extraction-manifest.json')).pages.map(f=>'/'+f.replace(/index\.html$/,'')),...blog.posts.map(p=>p.url)];
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);assert.deepEqual(urls.sort(),[...new Set(expected)].map(u=>blog.site.url+u).sort());
assert.equal((rss.match(/<item>/g)||[]).length,blog.posts.length);
assert.deepEqual(walk(path.join(output,'blog')).filter(f=>f.endsWith('.html')).map(f=>path.relative(output,f).replaceAll('\\','/')).sort(),['blog/index.html',...blog.posts.map(p=>p.url.slice(1)+'index.html')].sort());
for(const p of blog.posts){const html=text(p.url.slice(1)+'index.html');assert.equal((html.match(/<h1\b/g)||[]).length,1);for(const name of ['description','twitter:card','twitter:title','twitter:description','twitter:image'])assert(html.includes(`name="${name}"`));for(const name of ['og:title','og:description','og:url','og:type','article:published_time','article:modified_time'])assert(html.includes(`property="${name}"`));assert(html.includes(`rel="canonical" href="${p.canonical}"`));const ld=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);assert.deepEqual(ld,postStructuredData(p));assert(sitemap.includes(p.modifiedISO));assert(rss.includes(`urn:uuid:${p.uid}`));}
for(const file of walk(output).filter(f=>f.endsWith('.html'))){const html=fs.readFileSync(file,'utf8');for(const [,raw]of html.matchAll(/(?:href|src)="([^"]+)"/g)){const ref=raw.startsWith(blog.site.url+'/')?raw.slice(blog.site.url.length):raw;if(/^(?:https?:|mailto:|tel:|data:|\/\/)/.test(ref))continue;const u=new URL(ref,'https://local.invalid/'+path.relative(output,file).replaceAll('\\','/'));let dest=u.pathname.replace(/^\//,'');if(!dest||dest.endsWith('/'))dest+='index.html';assert(fs.existsSync(path.join(output,decodeURIComponent(dest))),`${file}: broken link ${ref}`);if(u.hash)assert(text(decodeURIComponent(dest)).includes(`id="${decodeURIComponent(u.hash.slice(1))}"`),`Missing anchor ${ref}`);}}
assert(text('404.html').includes('noindex, follow'));assert(!sitemap.includes('/404.html'));assert(text('robots.txt').includes('Sitemap: https://anilaslakci.com.tr/sitemap.xml'));
for(const privateFile of ['.pages.yml','content/posts','.migration-preview','migration','package.json'])assert(!fs.existsSync(path.join(output,privateFile)));
console.log(`Blog output checks passed: ${blog.posts.length} published posts, sitemap/RSS, JSON-LD, SEO, links, 404 and private-file exclusion.`);
