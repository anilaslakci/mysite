import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

export const categories = [
  { key: 'data-analysis', tr: 'Veri Analizi', en: 'Data Analysis', color: '#FF9F43' },
  { key: 'operations', tr: 'Operasyon Otomasyonu', en: 'Operations Automation', color: '#F4C95D' },
  { key: 'marketplace', tr: 'Pazaryeri Araçları', en: 'Marketplace Tools', color: '#55C271' },
  { key: 'finance', tr: 'Finans', en: 'Finance', color: '#FF6B6B' },
  { key: 'entertainment', tr: 'Eğlence', en: 'Entertainment', color: '#B388FF' },
  { key: 'mobile', tr: 'Mobil Geliştirme', en: 'Mobile Development', color: '#F28CA6' },
  { key: 'other', tr: 'Diğer', en: 'Other', color: '#48C9B0' }
];
export const words = {
  tr: { more: 'Detayı gör', problem: 'Sorun', solution: 'Çözüm', impact: 'Etki', zoom: 'Büyüt', all: 'Tümü' },
  en: { more: 'View details', problem: 'Problem', solution: 'Solution', impact: 'Impact', zoom: 'Zoom', all: 'All' }
};
export function decodeText(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e) => e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[e.toLowerCase()]);
}
export const normalizeMarkup = html => html.replace(/\r\n/g, '\n').replace(/>\s+</g, '><').trim();
export const imagePath = file => file.startsWith('/assets/') ? '..' + file : file;
export function legacyPortfolioMarkup(html) {
  html = html.replace(/<article\b[^>]*>/g, tag => {
    const key = tag.match(/data-category="([^"]+)"/)?.[1];
    const lang = tag.match(/data-lang="([^"]+)"/)?.[1];
    const c = categories.find(c=>c.key===key);
    return c ? tag.replace(`data-category="${key}"`, `data-category="${c[lang]}"`) : tag;
  });
  html = html.replace(/<div class="filters" id="filters-(tr|en)"[^>]*>[\s\S]*?<\/div>/g, (block,lang) => {
    for (const c of categories) block = block.replaceAll(`filterProjects('${c.key}', this)`, `filterProjects('${c[lang]}', this)`);
    return block;
  });
  return normalizeMarkup(html);
}
function htmlFragment(s, name) {
  assert.equal(typeof s, 'string', name);
  assert(s.trim(), `Empty ${name}`);
  // Keep existing inline formatting verbatim, without a lossy rich-text round trip.
  for (const tag of s.matchAll(/<([^>]+)>/g)) assert(/^\/?(?:strong|em|b|i|br)\s*\/?$/i.test(tag[1]), `Unsupported HTML in ${name}: ${tag[0]}`);
  assert(!/[<>]/.test(s.replace(/<\/?(?:strong|em|b|i|br)\s*\/?>/gi,'')), `Incomplete HTML in ${name}`);
  const stack=[];
  for(const m of s.matchAll(/<(\/?)(strong|em|b|i|br)\s*(\/?)>/gi)) {
    const tag=m[2].toLowerCase();
    if(tag==='br'){assert(!m[1],`Invalid closing br in ${name}`);continue;}
    if(m[1])assert.equal(stack.pop(),tag,`Unbalanced HTML in ${name}`);
    else {assert(!m[3],`Invalid self-closing ${tag} in ${name}`);stack.push(tag);}
  }
  assert.equal(stack.length,0,`Unclosed HTML in ${name}`);
}
export function validateProjects(projects, { root = process.cwd(), mediaRoot = root, requireLegacy = true } = {}) {
  const ids = new Set(), order = new Set();
  for (const p of projects) {
    assert(Number.isSafeInteger(p.id) && p.id > 0, 'Project id must be a positive integer');
    assert(!ids.has(p.id), `Duplicate project id ${p.id}`); ids.add(p.id);
    assert(Number.isSafeInteger(p.order) && p.order > 0 && !order.has(p.order), `Invalid/duplicate order ${p.order}`); order.add(p.order);
    if (p.id <= 21) assert.equal(p.order, p.id, `Historical order changed: ${p.id}`);
    assert(categories.some(c => c.key === p.category), `Unknown category ${p.category}`);
    for (const lang of ['tr', 'en']) {
      const t = p[lang]; assert(t && typeof t === 'object', `${p.id}: missing ${lang}`);
      assert(typeof t.title === 'string' && t.title.trim() && !/[<>]/.test(t.title), `${p.id}: invalid ${lang} title`);
      for (const key of ['summary','intro','problem','solution','impact']) htmlFragment(t[key], `${p.id}.${lang}.${key}`);
      for (const key of ['technologies','detailTechnologies']) assert(Array.isArray(t[key]) && t[key].length && t[key].every(v => typeof v === 'string' && v.trim() && !/[<>]/.test(v)), `${p.id}.${lang}.${key}`);
      for (const key of ['galleryTitle','galleryIntro']) assert(typeof t[key] === 'string' && t[key].trim(), `${p.id}.${lang}.${key}`);
      assert(!t.legacyModalTail || /^(<\/div>\s*)+$/.test(t.legacyModalTail), `${p.id}: invalid legacy boundary`);
    }
    assert(Array.isArray(p.gallery) && p.gallery.length, `${p.id}: missing gallery`);
    for (const img of p.gallery) {
      assert(/^\/assets\/portfolio\/[a-zA-Z0-9._-]+\.(?:png|jpe?g)$/i.test(img.file), `Invalid media path ${img.file}`);
      assert(fs.existsSync(path.join(mediaRoot, img.file.slice(1))), `Missing referenced image ${img.file} (used by project ${p.id})`);
      const bytes=fs.readFileSync(path.join(mediaRoot,img.file.slice(1)));
      assert(img.file.toLowerCase().endsWith('.png') ? bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a' : bytes.subarray(0,3).toString('hex')==='ffd8ff', `Invalid image signature ${img.file}`);
      for (const lang of ['tr','en']) assert(typeof img[`alt${lang.toUpperCase()}`] === 'string' && img[`alt${lang.toUpperCase()}`].trim(), `${p.id}: missing ${lang} alt`);
    }
    assert(Array.isArray(p.links ?? []), `${p.id}: invalid links`);
    for (const link of p.links ?? []) {
      assert(typeof link.url === 'string' && /^(https:\/\/[^\s"<>]+|\/(?!\/)[^\s"<>]*)$/.test(link.url), `${p.id}: unsafe link URL`);
      for (const key of ['labelTR','labelEN']) assert(typeof link[key] === 'string' && link[key].trim(), `${p.id}: missing link ${key}`);
    }
  }
  if (requireLegacy) for (let id = 1; id <= 21; id++) assert(ids.has(id), `Missing historical project ${id}`);
  return projects;
}
export function loadPortfolio({ directory = process.env.PORTFOLIO_TEST_DIR || 'src/content/projects', mediaRoot = process.cwd() } = {}) {
  const projects = fs.readdirSync(directory).filter(f => f.endsWith('.json')).map(file => {
    const project = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    assert.equal(file, `${project.id}.json`, `ID/filename mismatch: ${file}`);
    return project;
  });
  validateProjects(projects, { mediaRoot });
  projects.sort((a,b) => a.order - b.order);
  return { projects: projects.map(p => ({ ...p, categoryInfo: categories.find(c=>c.key===p.category) })), categories: categories.filter(c => projects.some(p => p.category === c.key)), words };
}
export function mediaReferences(projects, file) {
  return projects.filter(p => p.gallery.some(img => img.file === file)).map(p => p.id);
}
export function assertMediaUnused(projects, file) {
  const users = mediaReferences(projects, file);
  assert.equal(users.length, 0, `Image is still used by projects: ${users.join(', ')}`);
}
