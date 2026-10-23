import {escapeXML as xml,site,sourceModified} from './blog.mjs';
import {staticPages} from './site.mjs';
import {pagePairs} from './i18n.mjs';
export function sitemap(blog){
  const pages=staticPages.map(p=>({url:p.url,modified:sourceModified(p.sources)}));
  pages.push(...pagePairs.filter(p=>p.source).map(p=>({url:p.en,modified:sourceModified(['src/_includes/pages/'+p.key+'.njk','src/i18n/en.json','lib/i18n.mjs'])})),{url:'/blog/',modified:blog.modified},{url:'/en/blog/',modified:blog.modified},...blog.posts.map(p=>({url:p.url,modified:p.modifiedISO})));
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(p=>`  <url><loc>${xml(site.url+p.url)}</loc>${p.modified?`<lastmod>${xml(p.modified)}</lastmod>`:''}</url>`).join('\n')+'\n</urlset>\n';
}
export function rss(view){
 const en=view.locale==='en',url=view.url||'/blog/',feed=view.feed||'/feed.xml';
 return '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>'+xml(site.name+' — Blog')+'</title><link>'+site.url+url+'</link><description>'+(en?'Articles on e-commerce, marketplaces, integration and automation.':'E-ticaret, pazaryeri yönetimi, entegrasyon ve otomasyon üzerine yazılar.')+'</description><language>'+(en?'en':'tr')+'</language><atom:link href="'+site.url+feed+'" rel="self" type="application/rss+xml"/>'+(view.modified?`<lastBuildDate>${new Date(view.modified).toUTCString()}</lastBuildDate>`:'')+view.posts.map(p=>`<item><title>${xml(p.title)}</title><link>${xml(p.canonical)}</link><guid isPermaLink="false">urn:uuid:${p.uid}</guid><description>${xml(p.summary)}</description><pubDate>${new Date(p.publishTime).toUTCString()}</pubDate><category>${xml(p.categoryInfo.name)}</category></item>`).join('')+'</channel></rss>\n';
}
