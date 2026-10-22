import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { loadMediaRegistry } from './portfolio-media.mjs';

export const isUUID = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(value);
export function projectIdentity(project) {
  return project.id == null || project.id === '' ? project.uid : project.id;
}

// Historical category labels are used ONLY by the migration comparison helpers.
const historicalCategories = [
  { key: 'data-analysis', tr: 'Veri Analizi', en: 'Data Analysis', color: '#FF9F43' },
  { key: 'operations', tr: 'Operasyon Otomasyonu', en: 'Operations Automation', color: '#F4C95D' },
  { key: 'marketplace', tr: 'Pazaryeri Araçları', en: 'Marketplace Tools', color: '#55C271' },
  { key: 'finance', tr: 'Finans', en: 'Finance', color: '#FF6B6B' },
  { key: 'entertainment', tr: 'Eğlence', en: 'Entertainment', color: '#B388FF' },
  { key: 'mobile', tr: 'Mobil Geliştirme', en: 'Mobile Development', color: '#F28CA6' },
  { key: 'other', tr: 'Diğer', en: 'Other', color: '#48C9B0' }
];
export function loadCategories(directory = process.env.PORTFOLIO_CATEGORY_TEST_DIR || 'src/content/categories') {
  const keys = new Set();
  return fs.readdirSync(directory).filter(f => f.endsWith('.json')).map(file => {
    const c = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    assert(typeof c.key === 'string' && /^[a-z][a-z0-9-]*$/.test(c.key) && c.key !== 'all', `Invalid category key ${c.key}`);
    assert.equal(file, `${c.key}.json`, `Category key/filename mismatch: ${file}`);
    assert(!keys.has(c.key), `Duplicate category ${c.key}`); keys.add(c.key);
    for (const lang of ['tr','en']) assert(typeof c[lang] === 'string' && c[lang].trim() && !/[<>]/.test(c[lang]), `Invalid category ${c.key}.${lang}`);
    assert(c.order == null || c.order === '' || (Number.isSafeInteger(c.order) && c.order > 0), `Invalid category order ${c.key}`);
    assert(c.archived == null || typeof c.archived === 'boolean', `Invalid category archive flag ${c.key}`);
    assert(!c.color || /^#[a-f0-9]{6}$/i.test(c.color), `Invalid category color ${c.key}`);
    return {...c, color: c.color || '#48C9B0'};
  }).sort(compareOrderThenKey);
}
export const categories = loadCategories();
function rank(p) { return p.order == null || p.order === '' ? Infinity : p.order; }
export function compareOrderThenKey(a, b) {
  if (rank(a) !== rank(b)) return rank(a) < rank(b) ? -1 : 1;
  const left = projectIdentity(a) ?? a.key, right = projectIdentity(b) ?? b.key;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  if (typeof left === 'number') return -1;
  if (typeof right === 'number') return 1;
  return left < right ? -1 : left > right ? 1 : 0;
}
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
  // Equivalent handler also supports UUID strings; restore old form for historical comparison only.
  html = html.replace(/data-pid="(\d+)" onclick="openProject\(this.dataset.pid\)"/g, 'data-pid="$1" onclick="openProject($1)"');
  html = html.replace(/<article\b[^>]*>/g, tag => {
    const key = tag.match(/data-category="([^"]+)"/)?.[1];
    const lang = tag.match(/data-lang="([^"]+)"/)?.[1];
    const c = historicalCategories.find(c=>c.key===key);
    return c ? tag.replace(`data-category="${key}"`, `data-category="${c[lang]}"`) : tag;
  });
  html = html.replace(/<div class="filters" id="filters-(tr|en)"[^>]*>[\s\S]*?<\/div>/g, (block,lang) => {
    for (const c of historicalCategories) block = block.replaceAll(`filterProjects('${c.key}', this)`, `filterProjects('${c[lang]}', this)`);
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
export function validateProjects(projects, { root = process.cwd(), mediaRoot = root, categories: categoryList = categories } = {}) {
  const ids = new Set(), uids = new Set();
  for (const p of projects) {
    if(p.id != null && p.id !== '') assert(Number.isSafeInteger(p.id) && p.id > 0, 'Legacy id must remain a positive integer');
    const identity = projectIdentity(p);
    assert((Number.isSafeInteger(identity) && identity > 0) || isUUID(identity), 'Project identity must be a legacy positive integer or a UUID v4');
    assert(!ids.has(identity), `Duplicate project id ${identity}`); ids.add(identity);
    if(p.uid != null && p.uid !== '') {assert(isUUID(p.uid), `Invalid project UUID ${p.uid}`);assert(!uids.has(p.uid), `Duplicate project UUID ${p.uid}`);uids.add(p.uid);}
    assert(p.order == null || p.order === '' || (Number.isSafeInteger(p.order) && p.order > 0), `Invalid order ${p.order}`);
    assert(p.archived == null || typeof p.archived === 'boolean', `Invalid archived flag ${p.id}`);
    assert(categoryList.some(c => c.key === p.category), `Unknown category ${p.category} (project ${p.id}); reassign references before deleting a category`);
    assert(!categoryList.find(c => c.key === p.category)?.archived, `Archived category ${p.category} is still used by project ${identity}; move all references before archiving`);
    for (const lang of ['tr', 'en']) {
      const t = p[lang]; assert(t && typeof t === 'object', `${p.id}: missing ${lang}`);
      assert(typeof t.title === 'string' && t.title.trim() && !/[<>]/.test(t.title), `${p.id}: invalid ${lang} title`);
      htmlFragment(t.summary, `${p.id}.${lang}.summary`);
      for (const key of ['intro','problem','solution','impact']) if (t[key] != null && t[key] !== '') htmlFragment(t[key], `${p.id}.${lang}.${key}`);
      for (const key of ['technologies','detailTechnologies']) assert(t[key] == null || (Array.isArray(t[key]) && t[key].every(v => typeof v === 'string' && v.trim() && !/[<>]/.test(v))), `${p.id}.${lang}.${key}`);
      for (const key of ['galleryTitle','galleryIntro']) assert(t[key] == null || (typeof t[key] === 'string' && !/[<>]/.test(t[key])), `${p.id}.${lang}.${key}`);
      assert(!t.legacyModalTail || /^(<\/div>\s*)+$/.test(t.legacyModalTail), `${p.id}: invalid legacy boundary`);
    }
    assert(p.gallery == null || Array.isArray(p.gallery), `${p.id}: invalid gallery`);
    for (const img of p.gallery ?? []) {
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
  return projects;
}
export function loadPortfolio({ directory = process.env.PORTFOLIO_TEST_DIR || 'src/content/projects', mediaRoot = process.cwd(), categoryDirectory = process.env.PORTFOLIO_CATEGORY_TEST_DIR || 'src/content/categories' } = {}) {
  const categoryList = loadCategories(categoryDirectory);
  const projects = fs.readdirSync(directory).filter(f => f.endsWith('.json')).map(file => {
    const project = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    assert.equal(file, `${projectIdentity(project)}.json`, `ID/filename mismatch: ${file}`);
    return project;
  });
  validateProjects(projects, { mediaRoot, categories: categoryList });
  const media = loadMediaRegistry({mediaRoot});
  const published = projects.filter(p => !p.archived).sort(compareOrderThenKey).map(p => ({
    ...p, id: projectIdentity(p), gallery: p.gallery ?? [], links: p.links ?? [],
    ...Object.fromEntries(['tr','en'].map(lang => [lang, {...p[lang], technologies: p[lang].technologies ?? [], detailTechnologies: p[lang].detailTechnologies ?? p[lang].technologies ?? []}])),
    categoryInfo: categoryList.find(c => c.key === p.category)
  }));
  return { projects: published, allProjects: projects, media, categories: categoryList.filter(c => !c.archived && published.some(p => p.category === c.key)), words };
}
export function mediaReferences(projects, file) {
  return projects.filter(p => (p.gallery ?? []).some(img => img.file === file)).map(projectIdentity);
}
export function assertMediaUnused(projects, file) {
  const users = mediaReferences(projects, file);
  assert.equal(users.length, 0, `Image is still used by projects: ${users.join(', ')}`);
}
