import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {isUUID} from './portfolio.mjs';
import {site,staticPages} from './site.mjs';
import {pagePairs} from './i18n.mjs';
import {resolveTranslations} from './blog-translations.mjs';
const require=createRequire(import.meta.url),yaml=require('js-yaml'),MarkdownIt=require('markdown-it');
export {site};
export const escapeXML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export const safeJSON=value=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const plain=(v,label,required=true)=>{assert(typeof v==='string'&&(!required||v.trim()),`Invalid ${label}`);return v.trim();};
const civilFormat=new Intl.DateTimeFormat('en-CA',{timeZone:site.timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
const civilParts=t=>Object.fromEntries(civilFormat.formatToParts(t).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
export function parseEditorialDate(value,label='date') {
  assert(typeof value==='string',`${label}: date must be a string`);
  const m=value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})?$/);
  assert(m,`${label}: use YYYY-MM-DDTHH:mm (Türkiye saati) or an explicit ISO offset`);
  const [y,mo,d,h,mi,s]=m.slice(1,7).map(v=>Number(v||0));
  const milliseconds=Number((m[7]||'').padEnd(3,'0'));
  const target=Date.UTC(y,mo-1,d,h,mi,s,milliseconds),date=new Date(target);
  assert(y>=2000&&date.getUTCFullYear()===y&&date.getUTCMonth()===mo-1&&date.getUTCDate()===d&&h<24&&mi<60&&s<60,`${label}: invalid calendar date`);
  if(m[8]) {
    const zone=m[8];let offset=0;
    if(zone!=='Z'){const zh=Number(zone.slice(1,3)),zm=Number(zone.slice(4));assert(zh<=14&&zm<60&&(zh!==14||zm===0),`${label}: invalid timezone offset`);offset=(zone[0]==='-'?-1:1)*(zh*60+zm);}
    return target-offset*60000;
  }
  let utc=target;
  for(let n=0;n<3;n++){const p=civilParts(utc);const offset=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-(utc-milliseconds);utc=target-offset;}
  const p=civilParts(utc);assert.deepEqual([p.year,p.month,p.day,p.hour,p.minute,p.second],[y,mo,d,h,mi,s],`${label}: ambiguous/nonexistent Istanbul time`);
  return utc;
}
export function buildClock(value=process.env.SITE_BUILD_TIME) {
  if(!value)return new Date();
  assert(/(?:Z|[+-]\d{2}:\d{2})$/.test(value),'SITE_BUILD_TIME must include UTC/offset');
  return new Date(parseEditorialDate(value,'SITE_BUILD_TIME'));
}
export function sourceModified(paths) {
  try{return execFileSync('git',['log','-1','--format=%cI','--',...paths],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()||undefined;}catch{return undefined;}
}
export function readPost(file) {
  const raw=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
  const m=raw.match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/);assert(m,`Missing YAML front matter: ${file}`);
  const data=yaml.load(m[1],{schema:yaml.JSON_SCHEMA});assert(data&&typeof data==='object'&&!Array.isArray(data),`Invalid front matter: ${file}`);
  return {...data,body:m[2],source:file};
}
function localImage(file,root,label) {
  assert(typeof file==='string'&&/^\/assets\/(?:blog|portfolio)\/[a-zA-Z0-9._-]+\.(?:png|jpe?g)$/i.test(file),`Invalid ${label} path ${file}`);
  const full=path.join(root,file.slice(1));assert(fs.existsSync(full),`Missing ${label}: ${file}`);
  const b=fs.readFileSync(full);assert(file.toLowerCase().endsWith('.png')?b.subarray(0,8).toString('hex')==='89504e470d0a1a0a':b.subarray(0,3).toString('hex')==='ffd8ff',`Invalid ${label} bytes: ${file}`);
}
export function loadBlog({directory=process.env.BLOG_TEST_DIR||'src/content/posts',categoryDirectory=process.env.BLOG_CATEGORY_TEST_DIR||'src/content/blog-categories',mediaRoot=process.cwd(),now=buildClock()}={}) {
  const at=now.getTime();assert(Number.isFinite(at),'Invalid build time');
  const categoryKeys=new Set();
  const categories=fs.readdirSync(categoryDirectory).filter(f=>f.endsWith('.json')).map(file=>{
    const c=JSON.parse(fs.readFileSync(path.join(categoryDirectory,file),'utf8'));
    assert(/^[a-z][a-z0-9-]*$/.test(c.key)&&c.key!=='all',`Invalid blog category key ${c.key}`);assert.equal(file,c.key+'.json','Category filename mismatch');assert(!categoryKeys.has(c.key),'Duplicate blog category');categoryKeys.add(c.key);
    plain(c.name,'blog category');assert(c.archived==null||typeof c.archived==='boolean','Invalid category archive flag');assert(c.order==null||c.order===''||(Number.isSafeInteger(c.order)&&c.order>0),'Invalid category order');return c;
  }).sort((a,b)=>(a.order===''||a.order==null?Infinity:a.order)-(b.order===''||b.order==null?Infinity:b.order)||(a.key<b.key?-1:1));
  const uidSet=new Set(),slugSet=new Set();
  const markdown=new MarkdownIt({html:false,linkify:false,typographer:false});
  const renderImage=markdown.renderer.rules.image;
  markdown.renderer.rules.image=(tokens,index,options,env,self)=>{tokens[index].attrSet('loading','lazy');tokens[index].attrSet('decoding','async');return renderImage(tokens,index,options,env,self);};
  const posts=fs.readdirSync(directory).filter(f=>f.endsWith('.md')).map(file=>{
    const p=readPost(path.join(directory,file));
    assert(isUUID(p.uid),`Invalid blog UUID ${file}`);assert.equal(file,p.uid+'.md','Blog UID/filename mismatch');assert(!uidSet.has(p.uid),'Duplicate blog UUID');uidSet.add(p.uid);
    assert(typeof p.slug==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)&&p.slug.length<=120&&p.slug!=='index',`Invalid slug ${p.slug}`);const locale=p.locale||'tr';assert(['tr','en'].includes(locale),'Unsupported blog locale');assert(!slugSet.has(locale+':'+p.slug),`Duplicate slug ${p.slug}`);slugSet.add(locale+':'+p.slug);
    if(p.translationKey)assert(isUUID(p.translationKey),'translationKey must be a UUID');
    p.title=plain(p.title,'post title');p.summary=plain(p.summary,'post summary');assert(['draft','published'].includes(p.status),'Invalid post status');
    assert(categories.some(c=>c.key===p.category),`Unknown blog category ${p.category}`);
    assert(p.featured==null||typeof p.featured==='boolean','Invalid featured flag');
    assert(p.tags==null||(Array.isArray(p.tags)&&p.tags.every(t=>typeof t==='string'&&t.trim()&&!/[<>]/.test(t))),'Invalid tags');
    for(const field of ['seoTitle','description','coverAlt'])if(p[field]!=null)p[field]=plain(p[field],field,false);
    if(p.cover){localImage(p.cover,mediaRoot,'cover image');plain(p.coverAlt,'cover alt');}
    const publishTime=p.publishAt?parseEditorialDate(p.publishAt,'publishAt'):undefined;assert(p.status==='draft'||publishTime!==undefined,'Published status requires publishAt');
    const updatedTime=p.updatedAt?parseEditorialDate(p.updatedAt,'updatedAt'):undefined;
    assert(typeof p.body==='string'&&(p.status==='draft'||p.body.trim()),'Published post needs a body');
    assert(p.related==null||(Array.isArray(p.related)&&p.related.every(isUUID)&&new Set(p.related).size===p.related.length&&!p.related.includes(p.uid)),'Invalid related post IDs');
    const tokens=markdown.parse(p.body,{}),links=[];
    for(const t of tokens){assert(!(t.type==='heading_open'&&t.tag==='h1'),'Use H2/H3 inside the article; page title supplies H1');for(const child of t.children||[]){if(child.type==='image'){localImage(child.attrGet('src'),mediaRoot,'content image');assert(child.content.trim(),'Content image needs alt text');}if(child.type==='link_open'){const href=child.attrGet('href');assert(/^(?:https:\/\/|mailto:|\/(?!\/)|#)/.test(href),'Only HTTPS, site-relative or anchor links allowed');links.push(href);}}}
    return {...p,locale,translationKey:p.translationKey||p.uid,categoryInfo:{...categories.find(c=>c.key===p.category),name:locale==='en'?categories.find(c=>c.key===p.category).en:categories.find(c=>c.key===p.category).name},tags:p.tags||[],url:`${locale==='en'?'/en':''}/blog/${p.slug}/`,canonical:`${site.url}${locale==='en'?'/en':''}/blog/${p.slug}/`,seoTitle:p.seoTitle||p.title,description:p.description||p.summary,publishTime,updatedTime,links,html:markdown.render(p.body)};
  });
  resolveTranslations(posts);
  for(const p of posts)for(const uid of p.related||[])assert(uidSet.has(uid),`Unknown related post ${uid}`);
  const published=posts.filter(p=>p.status==='published'&&p.publishTime<=at).sort((a,b)=>b.publishTime-a.publishTime||(a.uid<b.uid?-1:1));
  for(const p of published){assert(!p.categoryInfo.archived,`Published post uses archived category ${p.category}`);assert(p.updatedTime==null||p.updatedTime<=at,'Published post has a future updatedAt');p.publishedISO=new Date(p.publishTime).toISOString();const committed=sourceModified([p.source,...(p.cover?[p.cover.slice(1)]:[])]);p.modifiedISO=new Date(Math.max(p.publishTime,p.updatedTime??p.publishTime,committed?Date.parse(committed):0)).toISOString();p.dateLabel=new Intl.DateTimeFormat(p.locale==='en'?'en-GB':'tr-TR',{timeZone:site.timeZone,dateStyle:'long'}).format(p.publishTime);}
  for(const p of published){const manual=(p.related||[]).map(uid=>published.find(q=>q.uid===uid)).filter(q=>q&&q.locale===p.locale);p.relatedPosts=(manual.length?manual:published.filter(q=>q.uid!==p.uid&&q.locale===p.locale&&q.category===p.category).slice(0,3)).map(q=>Object.fromEntries(['uid','url','title','summary','cover','coverAlt','category','categoryInfo','publishedISO','dateLabel','featured'].map(key=>[key,q[key]])));}
  const routes=new Set(['/blog/','/404.html','/feed.xml','/sitemap.xml','/en/blog/','/en/feed.xml','/en/404.html',...pagePairs.flatMap(p=>[p.tr,p.en]),...staticPages.map(p=>p.url),...published.map(p=>p.url)]);
  for(const p of published)for(const href of p.links){const u=new URL(href,site.url+p.url);if(u.origin===site.url)assert(routes.has(u.pathname)||u.pathname.startsWith('/assets/'),`Unpublished or unknown internal link ${href}`);}
  const categoryList=categories.filter(c=>!c.archived&&published.some(p=>p.category===c.key));
  const blogSourceDate=sourceModified(['lib/site.mjs','lib/blog.mjs','src/blog','src/_includes/blog','src/content/posts','src/content/blog-categories','src/assets/css/blog.css']);
  const modified=[blogSourceDate,...published.map(p=>p.modifiedISO)].filter(Boolean).sort((a,b)=>Date.parse(b)-Date.parse(a))[0];
  for(const p of published){assert(p.locale!=='en'||p.categoryInfo.name,'English category name required');const peer=published.find(q=>q.locale!==p.locale&&q.translationKey===p.translationKey);p.variants={[p.locale]:p.url,...(peer?{[peer.locale]:peer.url}:{})};}
  const views=['tr','en'].map(locale=>({locale,posts:published.filter(p=>p.locale===locale),categories:categoryList.filter(c=>published.some(p=>p.category===c.key&&p.locale===locale)).map(c=>({...c,name:locale==='en'?c.en:c.name})),url:locale==='en'?'/en/blog/':'/blog/',feed:locale==='en'?'/en/feed.xml':'/feed.xml',site,modified}));
  return {posts:published,categories:categoryList,allCategories:categories,buildTime:now.toISOString(),modified,site,views};
}
export function postStructuredData(post) {
  return [{'@context':'https://schema.org','@type':'BlogPosting','@id':post.canonical+'#article',headline:post.title,description:post.description,datePublished:post.publishedISO,dateModified:post.modifiedISO,inLanguage:post.locale,mainEntityOfPage:post.canonical,author:{'@type':'Person',name:site.name,url:site.url+(post.locale==='en'?'/en/':'/')},...(post.cover?{image:[site.url+post.cover]}:{}),articleSection:post.categoryInfo.name,keywords:post.tags}, {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{name:post.locale==='en'?'Home':'Ana Sayfa',item:site.url+(post.locale==='en'?'/en/':'/')},{name:'Blog',item:site.url+(post.locale==='en'?'/en/blog/':'/blog/')},{name:post.title,item:post.canonical}].map((x,i)=>({'@type':'ListItem',position:i+1,...x}))}];
}
