import fs from 'node:fs';
import assert from 'node:assert/strict';
import {site} from './site.mjs';
export const pagePairs=[
 {key:'home',tr:'/',en:'/en/',source:'index.njk'},
 {key:'portfolio',tr:'/portfolyo/',en:'/en/portfolio/',source:'portfolyo/index.njk'},
 ...[['pazaryeri-yonetimi','marketplace-management'],['erp-entegrasyonu','erp-integration'],['reklam-kampanya-yonetimi','advertising-campaign-management'],['e-ticaret-sitesi-yonetimi','ecommerce-website-management'],['veri-analizi-raporlama','data-analysis-reporting'],['operasyon-otomasyon','operations-automation']].map(([tr,en])=>({key:tr,tr:`/${tr}/`,en:`/en/${en}/`,source:`${tr}/index.njk`})),
 {key:'blog',tr:'/blog/',en:'/en/blog/'}
];
const dictionary=JSON.parse(fs.readFileSync('src/i18n/en.json','utf8'));
const invariant=new Set(JSON.parse(fs.readFileSync('src/i18n/invariant-text.json','utf8')));
for(const [tr,en]of Object.entries({...dictionary}))if(tr.includes('&amp;'))dictionary[tr.replaceAll('&amp;','&')]=en.replaceAll('&amp;','&');
export function translate(text){const t=text.trim();return dictionary[t]===undefined?text:text.replace(t,dictionary[t]);}
export function localizedURL(value,locale){
 if(locale!=='en')return value;
 if(value.startsWith(site.url+'/'))return site.url+localizedURL(value.slice(site.url.length),locale);
 if(!value.startsWith('/'))return value;
 const [pathname,suffix='']=value.split(/(?=[?#])/s,2),pair=pagePairs.find(p=>p.tr===pathname);
 return pair?pair.en+suffix:value;
}
export function alternates(variants){const valid=Object.entries(variants).filter(([,url])=>url);return valid.length>1?valid.map(([lang,url])=>`<link rel="alternate" hreflang="${lang}" href="${site.url+url}">`).join('')+`<link rel="alternate" hreflang="x-default" href="${site.url+(variants.tr||variants.en)}">`:'';}
export function languageNav(variants,locale){return `<nav class="site-language" aria-label="${locale==='en'?'Language':'Dil seçimi'}">`+['tr','en'].map(lang=>variants[lang]?`<a lang="${lang}" hreflang="${lang}" href="${variants[lang]}"${locale===lang?' aria-current="page"':''}>${lang.toUpperCase()}</a>`:`<span aria-disabled="true" title="${locale==='en'?'Translation not available':'Çeviri bulunmuyor'}">${lang.toUpperCase()}</span>`).join('')+'</nav>';}
function jsonEnglish(value){if(Array.isArray(value))return value.map(jsonEnglish);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,jsonEnglish(v)]));if(typeof value==='string')return value==='tr-TR'?'en':localizedURL(translate(value),'en');return value;}
export function localizeHTML(content,outputPath){
 if(!outputPath?.endsWith('.html'))return content;
 // Use HTML's explicit marker, not an inferred translation of a slug.
 const marker=content.match(/<html[^>]*data-page-key="([^"]+)"/),key=marker?.[1];
 const pair=pagePairs.find(p=>p.key===key),locale=/<html[^>]*lang="en"/.test(content)?'en':'tr';
 if(locale==='en'){
   content=content.replace(/\b(src|href)="(?:\.\/)?assets\//g,'$1="/assets/');
   const languageBlocks=[];content=content.replace(/<nav class="site-language"[\s\S]*?<\/nav>|<link\b[^>]*hreflang=[^>]+>/g,block=>{languageBlocks.push(block);return `<!--language-block-${languageBlocks.length-1}-->`;});
   const saved=[];content=content.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,block=>{if(block.includes('application/ld+json'))block=block.replace(/(<script[^>]*>)([\s\S]*?)(<\/script>)/,(_,a,json,z)=>a+JSON.stringify(jsonEnglish(JSON.parse(json))).replace(/</g,'\\u003c')+z);saved.push(block);return `<!--i18n-block-${saved.length-1}-->`;});
   if(pair&&key!=='portfolio'&&key!=='blog')for(const [,text]of content.matchAll(/>([^<>]+)</g)){const t=text.trim();if(t&&!invariant.has(t))assert.notEqual(translate(t),t,`Missing deliberate English translation: ${t}`);}
   content=content.replace(/>([^<>]+)</g,(_,text)=>'>'+translate(text)+'<').replace(/\b(content|aria-label|title|alt)="([^"]*)"/g,(_,attr,value)=>`${attr}="${translate(value)}"`).replace(/\bhref="([^"]*)"/g,(_,href)=>`href="${localizedURL(href,'en')}"`).replace(/\bcontent="https:\/\/anilaslakci.com.tr([^"\s]*)"/g,(_,tail)=>`content="${site.url+localizedURL(tail,'en')}"`).replace(/content="tr_TR"/g,'content="en_US"');
   content=content.replace(/<!--i18n-block-(\d+)-->/g,(_,n)=>saved[Number(n)]);
   content=content.replace(/<!--language-block-(\d+)-->/g,(_,n)=>languageBlocks[Number(n)]);
 }
 if(pair){content=content.replace(/<link\b[^>]*hreflang=[^>]+>\s*/g,'');content=content.replace('</head>',alternates({tr:pair.tr,en:pair.en})+'\n</head>');
   const nav=languageNav({tr:pair.tr,en:pair.en},locale);if(content.includes('<!--language-switch-->'))content=content.replace('<!--language-switch-->',nav);else content=content.replace('<body>','<body>'+nav);
 }
 if(locale==='en'&&key==='home')content=content.replace('<p class="h-desc"><strong>','<p class="h-desc">I’m <strong>').replace('</strong> I manage','</strong>. I manage');
 if(!content.includes('/assets/css/i18n.css'))content=content.replace('</head>','<link rel="stylesheet" href="/assets/css/i18n.css"></head>');
 return content;
}
