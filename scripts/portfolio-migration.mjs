import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const backup = '.migration-backups/phase-1';
const report = 'migration/phase-1';
const target = 'portfolyo/index.html';
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const read = p => fs.readFileSync(p);
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const json = (p, value) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n'); };
const load = p => JSON.parse(read(p));
const uriPattern = /data:image\/png;base64,[A-Za-z0-9+/=]+/g;
function decode(uri) {
  const value = uri.slice(uri.indexOf(',') + 1);
  const bytes = Buffer.from(value, 'base64');
  assert.equal(bytes.toString('base64'), value, 'Noncanonical or damaged Base64');
  assert(['89504e470d0a1a0a', 'ffd8ffe000104a46'].includes(bytes.subarray(0, 8).toString('hex')), 'Unknown image signature');
  return bytes;
}
function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*(["'])(.*?)\2/gs)].map(m => [m[1], m[3]]));
}
function balancedDiv(html, start) {
  let depth = 0;
  const re = /<\/?div\b[^>]*>/g; re.lastIndex = start;
  for (let m; (m = re.exec(html));) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (!depth) return html.slice(start, re.lastIndex);
  }
  throw Error('Unbalanced modal');
}
function content(html) {
  const tagText = (block, tag) => (block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`)) || [])[1] ?? '';
  const cards = [...html.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map(m => ({ attributes: attrs(m[0].split('>')[0]), html: m[0] }));
  const modals = [...html.matchAll(/<div\b[^>]*\bid="modal-(tr|en)-(\d+)"[^>]*>/g)].map(m => {
    const block = balancedDiv(html, m.index);
    return { lang: m[1], id: Number(m[2]), html: block, images: [...block.matchAll(/<img\b[^>]*>/g)].map(x => attrs(x[0])) };
  });
  const projects = Array.from({ length: 21 }, (_, i) => ({ id: i + 1, translations: Object.fromEntries(['tr', 'en'].map(lang => {
    const card = cards.filter(c => c.attributes['data-lang'] === lang && Number(c.attributes['data-pid']) === i + 1);
    const modal = modals.filter(m => m.lang === lang && m.id === i + 1);
    assert.equal(card.length, 1); assert.equal(modal.length, 1);
    return [lang, {
      titleHtml: tagText(card[0].html, 'h3'),
      summaryHtml: tagText(card[0].html, 'p'),
      category: card[0].attributes['data-category'],
      detailTitleHtml: tagText(modal[0].html, 'h2'),
      detailIntroHtml: tagText(modal[0].html, 'p'),
      detailSections: [...modal[0].html.matchAll(/<div class="detail-block[^\"]*">([\s\S]*?)<\/div>/g)].map(m => ({ headingHtml: tagText(m[1], 'h4'), textHtml: tagText(m[1], 'p') })),
      technologies: [...card[0].html.matchAll(/<span class="chip">([\s\S]*?)<\/span>/g)].map(m => m[1]),
      card: card[0], modal: modal[0]
    }];
  })) }));
  assert.equal(cards.length, 42); assert.equal(modals.length, 42);
  return { projects, cards: cards.length, modals: modals.length };
}
function inventory(files, prefix = '') {
  return files.map(file => {
    const bytes = read(path.join(prefix, file));
    const item = { file, bytes: bytes.length, sha256: hash(bytes) };
    if (file.endsWith('.html')) {
      const html = bytes.toString('utf8');
      item.inlineBlocks = [...html.matchAll(/<(style|script)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m, i) => ({ index: i, tag: m[1], sha256: hash(m[0]), bytes: Buffer.byteLength(m[0]) }));
      item.links = [...html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gs)].map(m => m[2].startsWith('data:') ? `sha256:${hash(decode(m[2]))}` : m[2]);
    }
    return item;
  });
}
function prepare() {
  assert.equal(git('branch', '--show-current'), 'refactor/eleventy-cms-migration');
  assert(!fs.existsSync(backup), 'Backup exists; refusing overwrite');
  const files = git('ls-files', '-z').split('\0').filter(Boolean).filter(f => !f.startsWith('scripts/') && !f.startsWith('migration/') && f !== '.gitignore');
  assert.equal(files.length, 18, 'Unexpected baseline inventory');
  const source = inventory(files);
  for (const file of files) { const dest = path.join(backup, 'snapshot', file); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(file, dest); }
  assert.deepEqual(inventory(files, `${backup}/snapshot`), source);
  json(`${backup}/metadata.json`, { commit: git('rev-parse', 'HEAD'), branch: git('branch', '--show-current'), files: source });
  json(`${report}/baseline-inventory.json`, { commit: git('rev-parse', 'HEAD'), files: source });
  console.log('Verified independent snapshot: 18 files. Create and verify Git bundle before extract.');
}
function extract() {
  assert.equal(git('branch', '--show-current'), 'refactor/eleventy-cms-migration');
  const meta = load(`${backup}/metadata.json`);
  assert.deepEqual(inventory(meta.files.map(f => f.file), `${backup}/snapshot`), meta.files);
  git('bundle', 'verify', `${backup}/history-complete.bundle`);
  assert.equal(hash(read(target)), meta.files.find(f => f.file === target).sha256, 'Source changed since backup');
  const original = read(target).toString('utf8');
  const mappings = []; const unique = new Map();
  const updated = original.replace(uriPattern, (uri, offset) => {
    const bytes = decode(uri); const sha256 = hash(bytes);
    const format = bytes[0] === 0x89 ? 'png' : 'jpg';
    const file = `assets/portfolio/${sha256}.${format}`;
    const relative = `../${file}`;
    if (fs.existsSync(file)) assert.equal(hash(read(file)), sha256);
    else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, bytes, { flag: 'wx' }); }
    assert.equal(hash(read(file)), sha256);
    unique.set(sha256, { file, sha256, bytes: bytes.length, declaredMime: 'image/png', actualFormat: format, width: format === 'png' ? bytes.readUInt32BE(16) : null, height: format === 'png' ? bytes.readUInt32BE(20) : null });
    mappings.push({ occurrence: mappings.length + 1, sourceOffset: offset, sourceUriSha256: hash(uri), sha256, file, relative });
    return relative;
  });
  assert.equal(mappings.length, 133); assert.equal(unique.size, 67);
  // No changes other than the 133 exact URI substitutions are permitted.
  let n = 0;
  const uris = [...original.matchAll(uriPattern)].map(m => m[0]);
  const reconstructed = updated.replace(/\.\.\/assets\/portfolio\/[a-f0-9]{64}\.(?:png|jpg)/g, () => uris[n++]);
  assert.equal(reconstructed, original);
  json(`${report}/image-manifest.json`, { occurrences: mappings, unique: [...unique.values()], originalBytes: Buffer.byteLength(original), updatedBytes: Buffer.byteLength(updated) });
  json(`${report}/content-manifest.json`, content(updated));
  fs.writeFileSync(target, updated);
  verify();
}
function verify() {
  const checks = [];
  const check = (name, fn) => { fn(); checks.push(name); };
  const meta = load(`${backup}/metadata.json`); const images = load(`${report}/image-manifest.json`);
  const original = read(`${backup}/snapshot/${target}`).toString('utf8'); const current = read(target).toString('utf8');
  check('Development branch', () => assert.equal(git('branch', '--show-current'), 'refactor/eleventy-cms-migration'));
  check('Independent snapshot hashes', () => assert.deepEqual(inventory(meta.files.map(f => f.file), `${backup}/snapshot`), meta.files));
  check('Git history bundle', () => git('bundle', 'verify', `${backup}/history-complete.bundle`));
  check('Original HTML agrees with Git commit after Git newline normalization', () => {
    const committed = execFileSync('git', ['show', `${meta.commit}:${target}`], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
    assert.equal(hash(committed.replace(/\r\n/g, '\n')), hash(original.replace(/\r\n/g, '\n')));
  });
  check('Other 17 original files unchanged', () => { for (const f of meta.files.filter(f => f.file !== target)) assert.equal(hash(read(f.file)), f.sha256, f.file); });
  const sourceUris = [...original.matchAll(uriPattern)].map(m => m[0]);
  check('133 occurrences and 67 unique images', () => { assert.equal(images.occurrences.length, 133); assert.equal(images.unique.length, 67); assert.equal(sourceUris.length, 133); });
  check('All extracted bytes match source', () => images.occurrences.forEach((m, i) => { assert.equal(hash(decode(sourceUris[i])), m.sha256); assert.equal(hash(sourceUris[i]), m.sourceUriSha256); assert.deepEqual(read(m.file), decode(sourceUris[i])); }));
  check('Exact HTML transformation; all content/CSS/JS/attributes/order unchanged', () => { let i = 0; assert.equal(original.replace(uriPattern, () => images.occurrences[i++].relative), current); assert.equal(i, 133); });
  check('No remaining Base64 data URI', () => assert(!/data:[^\s"']*;base64,/i.test(current)));
  check('21 projects; 21 TR + 21 EN cards and modals; full manifest match', () => assert.deepEqual(content(current), load(`${report}/content-manifest.json`)));
  check('TR/EN gallery image order preserved and shared hashes match', () => { const c = content(current); for (const p of c.projects) assert.deepEqual(p.translations.tr.modal.images.map(i => i.src), p.translations.en.modal.images.map(i => i.src)); });
  check('All local file links and fragment targets resolve across eight pages', () => {
    for (const f of meta.files.filter(f => f.file.endsWith('.html'))) {
      const html = read(f.file).toString('utf8');
      for (const m of html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gs)) {
        const ref = m[2]; if (/^(?:https?:|mailto:|tel:|data:|\/\/)/.test(ref) || !ref) continue;
        const [url, fragment] = ref.split('#'); const pathname = url.split('?')[0];
        let dest = pathname ? (pathname.startsWith('/') ? pathname.slice(1) : path.posix.join(path.posix.dirname(f.file), pathname)) : f.file;
        if (!dest || dest.endsWith('/') || (fs.existsSync(dest) && fs.statSync(dest).isDirectory())) dest = path.posix.join(dest, 'index.html');
        assert(fs.existsSync(dest), `${f.file}: ${ref}`);
        if (fragment) assert(read(dest).toString('utf8').includes(`id="${fragment}"`), `${f.file}: missing #${fragment}`);
      }
    }
  });
  json(`${report}/test-results.json`, { checks: checks.map(name => ({ name, passed: true })), failed: 0, originalBytes: Buffer.byteLength(original), updatedBytes: Buffer.byteLength(current), uniqueImages: images.unique.length });
  console.log(JSON.stringify({ passed: checks.length, failed: 0, originalBytes: Buffer.byteLength(original), updatedBytes: Buffer.byteLength(current), uniqueImages: images.unique.length }, null, 2));
}
const mode = process.argv[2];
if (mode === 'backup') prepare(); else if (mode === 'extract') extract(); else if (mode === 'test') verify();
else if (mode === 'manifest') {
  let i = 0; const mappings = load(`${report}/image-manifest.json`).occurrences;
  const expected = read(`${backup}/snapshot/${target}`).toString('utf8').replace(uriPattern, () => mappings[i++].relative);
  assert.equal(expected, read(target).toString('utf8'));
  json(`${report}/content-manifest.json`, content(expected));
} else throw Error('Use backup, extract, manifest or test');
