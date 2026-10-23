import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { categories } from '../lib/portfolio.mjs';
const require = createRequire(import.meta.url);
const yaml = require('js-yaml');
const file = 'src/portfolyo/index.njk';
let html = fs.readFileSync(file,'utf8');
assert.equal((html.match(/data-pid=/g)||[]).length,42,'Expected untouched source');
function balancedDiv(s,start){let depth=0;const re=/<\/?div\b[^>]*>/g;re.lastIndex=start;for(let m;(m=re.exec(s));){depth+=m[0].startsWith('</')?-1:1;if(!depth)return s.slice(start,re.lastIndex);}throw Error('Unbalanced div');}
for(const lang of ['tr','en']) {
  const match = html.match(new RegExp(`<div class="grid" id="grid-${lang}"[^>]*>`));
  const block = balancedDiv(html,match.index);
  const replacement = `${match[0]}\n{% set lang = '${lang}' %}{% for project in portfolio.projects %}{% set t = project[lang] %}{% set category = project.categoryInfo %}{% include "portfolio/card.njk" %}{% endfor %}\n</div>`;
  html=html.replace(block,replacement);
  const filter=html.match(new RegExp(`<div class="filters" id="filters-${lang}"[^>]*>[\\s\\S]*?</div>`))[0];
  const opener=filter.match(/^<div[^>]*>/)[0];
  html=html.replace(filter,`${opener}<button class="filter-btn active" data-lang="${lang}" onclick="filterProjects('all', this)">{{ portfolio.words.${lang}.all }}</button>{% for category in portfolio.categories %}<button class="filter-btn" data-lang="${lang}" onclick="filterProjects('{{ category.key }}', this)">{{ category.${lang} }}</button>{% endfor %}</div>`);
}
for(const lang of ['tr','en']) {
  const blocks=[...html.matchAll(new RegExp(`<div aria-hidden="true" class="modal" data-lang="${lang}" id="modal-${lang}-\\d+">`,'g'))];
  const first=blocks[0].index,last=blocks.at(-1).index;
  const end=last+balancedDiv(html,last).length;
  html=html.slice(0,first)+`{% set lang = '${lang}' %}{% for project in portfolio.projects %}{% set t = project[lang] %}{% set category = project.categoryInfo %}{% include "portfolio/modal.njk" %}{% endfor %}`+html.slice(end);
}
html=html.replace('<strong id="stat1-num">21</strong>','<strong id="stat1-num">{{ portfolio.projects | length }}</strong>');
assert(!html.includes('data-pid='));fs.writeFileSync(file,html);
const jsfile='src/assets/js/portfolio-1.js';let js=fs.readFileSync(jsfile,'utf8');
js=js.replace(/const STRINGS = (.*);/,(_,value)=>{const s=JSON.parse(value);for(const lang of ['tr','en'])delete s[lang].stat1_num;return `const STRINGS = ${JSON.stringify(s)};`;});
assert(js.includes("document.getElementById('stat1-num').textContent = s.stat1_num;") || js.includes("document.querySelectorAll('#grid-' + lang"));
js=js.replace("document.getElementById('stat1-num').textContent = s.stat1_num;", "document.getElementById('stat1-num').textContent = document.querySelectorAll('#grid-' + lang + ' .project-card').length;");fs.writeFileSync(jsfile,js);
const htmlField = (name,label)=>({name,label,type:'text',required:true,description:'Metin ve mevcut <strong>/<em>/<br> biçimlendirmesi korunur; Markdown kullanılmaz.'});
const translationFields = [
  {name:'title',label:'Başlık',type:'string',required:true},
  htmlField('summary','Kart özeti'),htmlField('intro','Detay giriş açıklaması'),htmlField('problem','Sorun'),htmlField('solution','Çözüm'),htmlField('impact','Etki'),
  {name:'technologies',label:'Kart teknoloji etiketleri',type:'string',list:true,required:true},
  {name:'detailTechnologies',label:'Detay teknoloji etiketleri',type:'string',list:true,required:true,description:'Bazı mevcut projelerde kart listesinden farklıdır; iki liste ayrı korunur.'},
  {name:'galleryTitle',label:'Galeri başlığı',type:'string',required:true},
  {name:'galleryIntro',label:'Galeri açıklaması',type:'string',required:true},
  {name:'legacyModalTail',label:'Korunan eski HTML sınırı',type:'string',hidden:true,default:''}
];
const config={
  media:[{name:'portfolio',label:'Portfolyo görselleri',input:'assets/portfolio',output:'/assets/portfolio',rename:'random',extensions:['png','jpg','jpeg']}],
  content:[{name:'projects',label:'Portfolyo projeleri',type:'collection',path:'src/content/projects',format:'json',subfolders:false,filename:{template:'{fields.id}.json',field:false},operations:{create:true,rename:false,delete:false},view:{primary:'tr.title',fields:['id','tr.title','en.title','category','order'],sort:['order','id','tr.title'],search:['tr.title','en.title'],default:{sort:'order',order:'asc'}},fields:[
    {name:'id',label:'Proje kimliği',type:'number',required:true,options:{min:1},description:'Mevcut kimliği değiştirmeyin. Yeni projede kullanılmayan bir sonraki tam sayıyı girin; dosya adı bu kimlikten üretilir.'},
    {name:'order',label:'Sıralama',type:'number',required:true,options:{min:1},description:'Mevcut 1–21 sırası sabittir. Yeni projeye kullanılmayan sonraki sıralama numarasını verin.'},
    {name:'category',label:'Kategori',type:'select',required:true,options:{values:categories.map(c=>({name:c.key,label:c.tr}))}},
    {name:'tr',label:'Türkçe',type:'object',required:true,fields:translationFields},
    {name:'en',label:'English',type:'object',required:true,fields:translationFields.map(f=>({...f}))},
    {name:'gallery',label:'Galeri (sürükleyerek sıralayın)',type:'object',required:true,list:{min:1,collapsible:{collapsed:true,summary:'{altTR}'}},fields:[
      {name:'file',label:'Görsel',type:'image',required:true,options:{media:'portfolio',extensions:['png','jpg','jpeg']}},
      {name:'altTR',label:'Türkçe alternatif metin',type:'string',required:true},{name:'altEN',label:'English alternative text',type:'string',required:true}
    ]},
    {name:'links',label:'Proje bağlantıları (isteğe bağlı)',type:'object',list:true,fields:[{name:'url',label:'Adres',type:'string',required:true},{name:'labelTR',label:'Türkçe etiket',type:'string',required:true},{name:'labelEN',label:'English label',type:'string',required:true}]}
  ]}]
};
if (!fs.existsSync('.pages.yml')) fs.writeFileSync('.pages.yml',yaml.dump(config,{noRefs:true,lineWidth:110}));
console.log('Integrated data-driven portfolio; wrote documented Pages CMS collection schema.');
