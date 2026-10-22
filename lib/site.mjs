// Runtime site contract. Historical migration manifests are QA evidence, not build inputs.
export const site={url:'https://anilaslakci.com.tr',name:'Mustafa Anıl Aşlakcı',locale:'tr',timeZone:'Europe/Istanbul'};
const services=['pazaryeri-yonetimi','erp-entegrasyonu','reklam-kampanya-yonetimi','e-ticaret-sitesi-yonetimi','veri-analizi-raporlama','operasyon-otomasyon'];
export const staticPages=[
  {url:'/',sources:['src/_includes/pages/home.njk','src/index.njk','src/assets/css/home-1.css','src/assets/css/home-2.css','src/assets/css/home-3.css','src/assets/js/home-1.js']},
  {url:'/portfolyo/',sources:['src/_includes/pages/portfolio.njk','src/portfolyo/index.njk','src/content/projects','src/content/categories','src/_includes/portfolio','src/assets/js/portfolio-1.js','src/assets/css/portfolio-1.css']},
  ...services.map(key=>({url:`/${key}/`,sources:[`src/_includes/pages/${key}.njk`,`src/${key}/index.njk`,'src/_includes/services','src/_includes/layouts/service.njk','src/assets/css/services.css']}))
];
