// One-time extraction from immutable phase-1 manifests. Pilot must pass first.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';
import { categories, words, decodeText, normalizeMarkup, imagePath, validateProjects } from '../lib/portfolio.mjs';
const require = createRequire(import.meta.url);
const nunjucks = require('nunjucks');
const source = JSON.parse(fs.readFileSync('migration/phase-1/content-manifest.json'));
const originalPage = fs.readFileSync('portfolyo/index.html','utf8');
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader('src/_includes'), { autoescape: false });
env.addFilter('portfolioImage', imagePath);
const record = p => {
  const category = categories.find(c => c.tr === p.translations.tr.category);
  assert(category, `Unknown category ${p.id}`);
  const result = { id: p.id, order: p.id, category: category.key };
  for (const lang of ['tr','en']) {
    const t = p.translations[lang], h = t.modal.html;
    assert.equal(t.titleHtml, t.detailTitleHtml, 'Different card/modal titles require explicit schema');
    assert.equal(t.category, category[lang]);
    assert.equal(h.match(/--tag:([^";]+)/)[1], category.color, `Category color ${p.id}`);
    assert(!/\bhref=/.test(t.card.html + h), 'Existing links require explicit migration');
    assert.deepEqual(t.detailSections.map(s => s.headingHtml), [words[lang].problem,words[lang].solution,words[lang].impact]);
    const gallery = h.match(/<div class="gallery-head"><h4>(.*?)<\/h4><p>(.*?)<\/p><\/div>/s);
    result[lang] = { title: decodeText(t.titleHtml), summary: t.summaryHtml, intro: t.detailIntroHtml, problem: t.detailSections[0].textHtml, solution: t.detailSections[1].textHtml, impact: t.detailSections[2].textHtml, technologies: t.technologies.map(decodeText), detailTechnologies: [...h.matchAll(/<span class="chip">([\s\S]*?)<\/span>/g)].map(m => decodeText(m[1])), galleryTitle: decodeText(gallery[1]), galleryIntro: decodeText(gallery[2]) };
    let tail = '';
    if (p.id !== source.projects.at(-1).id) {
      const end = originalPage.indexOf(h) + h.length;
      const next = originalPage.indexOf('<div aria-hidden="true" class="modal"', end);
      tail = originalPage.slice(end,next).trim();
      assert(!tail || /^(<\/div>\s*)+$/.test(tail), 'Unexpected legacy modal boundary');
    }
    result[lang].legacyModalTail = tail;
  }
  const tr = p.translations.tr.modal.images, en = p.translations.en.modal.images;
  assert.equal(tr.length, en.length);
  result.gallery = tr.map((img,i) => { assert.equal(img.src,en[i].src); return { file: img.src.replace(/^\.\./,''), altTR: decodeText(img.alt), altEN: decodeText(en[i].alt) }; });
  result.links = [];
  validateProjects([result], { requireLegacy: false });
  return result;
};
function roundTrip(p, value) {
  for (const lang of ['tr','en']) for (const kind of ['card','modal']) {
    const html = env.render(`portfolio/${kind}.njk`, { project: value, t: value[lang], lang, category: categories.find(c=>c.key===value.category), portfolio: { words } });
    const restored = html.replaceAll(`data-category="${value.category}"`, `data-category="${value[lang] && categories.find(c=>c.key===value.category)[lang]}"`);
    assert.equal(normalizeMarkup(restored), normalizeMarkup(p.translations[lang][kind].html + (kind === 'modal' ? value[lang].legacyModalTail : '')), `Lossy ${kind}: project ${p.id}, ${lang}`);
  }
}
fs.mkdirSync('migration/phase-3', { recursive: true });
const mode = process.argv[2];
if (mode === 'pilot') {
  const p = source.projects[0], value = record(p); roundTrip(p,value);
  fs.writeFileSync('migration/phase-3/pilot-result.json', JSON.stringify({ projectId:p.id, cardAndModalRoundTrips:4,passed:true, record:value },null,2)+'\n');
  console.log('Pilot project 1: all 4 TR/EN card/modal round trips lossless.');
} else if (mode === 'all') {
  assert(JSON.parse(fs.readFileSync('migration/phase-3/pilot-result.json')).passed, 'Pilot required');
  const records = source.projects.map(p=>{const value=record(p);roundTrip(p,value);return value;});
  assert(!fs.existsSync('src/content/projects'), 'Refusing to overwrite existing records');
  fs.mkdirSync('src/content/projects',{recursive:true});
  for (const p of records) fs.writeFileSync(path.join('src/content/projects',`${p.id}.json`),JSON.stringify(p,null,2)+'\n');
  fs.writeFileSync('migration/phase-3/conversion-result.json',JSON.stringify({projects:records.length,roundTrips:records.length*4,passed:true},null,2)+'\n');
  console.log('21 projects: 84 exact semantic markup round trips passed.');
} else throw Error('Use pilot then all');
