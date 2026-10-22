import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { legacyPortfolioMarkup } from '../lib/portfolio.mjs';
const dir = 'migration/phase-2';
const load = file => JSON.parse(fs.readFileSync(file));
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const text = p => fs.readFileSync(p, 'utf8');
const normalize = s => s.replace(/\r\n/g, '\n');
const baseline = load(`${dir}/baseline-inventory.json`);
const extraction = load(`${dir}/extraction-manifest.json`);
const images = load('migration/phase-1/image-manifest.json');
const content = load('migration/phase-1/content-manifest.json');
const results = [];
function check(name, fn) { fn(); results.push({ name, passed: true }); }
const files = root => fs.readdirSync(root, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(root, e.name)) : [path.join(root, e.name).replaceAll('\\', '/')]);
try {
  check('All 102 phase-1 tracked files remain unchanged from extraction baseline', () => {
    assert.equal(baseline.files.length, 102);
    for (const f of baseline.files) assert.equal(hash(fs.readFileSync(f.file)), f.sha256, f.file);
  });
  check('Exactly eight HTML output files at the original paths', () => assert.deepEqual(files('_site').filter(f => f.endsWith('.html')).map(f => f.slice(6)).sort(), [...extraction.pages].sort()));
  for (const file of extraction.pages) {
    const output = text(`_site/${file}`);
    check(`${file}: HTML preserved after external-asset substitution (portfolio inert keys/whitespace normalized)`, () => {
      let restored = output;
      for (const t of extraction.transforms.filter(x => x.file === file)) {
        if (t.asset !== 'assets/js/portfolio-1.js') {
          assert.equal(hash(text(`_site/${t.asset}`)), t.sha256, t.asset);
          assert.equal(text(`_site/${t.asset}`), t.originalBlock.match(/^[\s\S]*?>([\s\S]*)<\/(?:style|script)>$/)[1]);
        } else {
          let expected = t.originalBlock.match(/^[\s\S]*?>([\s\S]*)<\/script>$/)[1];
          expected = expected.replace(/const STRINGS = (.*);/,(_,v)=>{const s=JSON.parse(v);delete s.tr.stat1_num;delete s.en.stat1_num;return `const STRINGS = ${JSON.stringify(s)};`;});
          expected = expected.replace("document.getElementById('stat1-num').textContent = s.stat1_num;", "document.getElementById('stat1-num').textContent = document.querySelectorAll('#grid-' + lang + ' .project-card').length;");
          assert.equal(text(`_site/${t.asset}`), expected, 'Only dynamic project counter change allowed');
        }
        assert.equal(restored.split(t.replacement).length - 1, 1);
        restored = restored.replace(t.replacement, t.originalBlock);
      }
      if (file === 'portfolyo/index.html') assert.equal(legacyPortfolioMarkup(restored), legacyPortfolioMarkup(text(file)), file);
      else assert.equal(normalize(restored), normalize(text(file)), file);
    });
    check(`${file}: title, description, canonical and JSON-LD preserved`, () => {
      const seo = html => ({
        title: html.match(/<title\b[^>]*>[\s\S]*?<\/title>/)[0],
        description: [...html.matchAll(/<meta\b[^>]*>/g)].map(m => m[0]).find(x => /name=["']description["']/.test(x)),
        canonical: [...html.matchAll(/<link\b[^>]*>/g)].map(m => m[0]).find(x => /rel=["']canonical["']/.test(x)),
        jsonld: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]))
      });
      assert.deepEqual(seo(output), seo(text(file)));
      assert(!output.includes('https://anilaslakci.com.tr/mysite/'));
    });
  }
  check('All 67 extracted images retain original SHA-256', () => {
    assert.equal(images.unique.length, 67);
    for (const image of images.unique) assert.equal(hash(fs.readFileSync(`_site/${image.file}`)), image.sha256);
  });
  check('21 projects, 42 cards, 42 modals; every TR/EN card and modal exactly preserved', () => {
    const html = text('_site/portfolyo/index.html');
    assert.equal(content.projects.length, 21);
    assert.equal([...html.matchAll(/data-pid="\d+"/g)].length, 42);
    assert.equal([...html.matchAll(/id="modal-(?:tr|en)-\d+"/g)].length, 42);
    for (const project of content.projects) for (const lang of ['tr', 'en']) {
      assert(legacyPortfolioMarkup(html).includes(legacyPortfolioMarkup(project.translations[lang].card.html)));
      assert(legacyPortfolioMarkup(html).includes(legacyPortfolioMarkup(project.translations[lang].modal.html)));
    }
  });
  check('All legacy media, favicon and SEO files copied byte-for-byte', () => {
    const original = load('migration/phase-1/baseline-inventory.json').files.filter(f => !f.file.endsWith('.html') && f.file !== 'README-KURULUM.txt');
    for (const f of original) assert.equal(hash(fs.readFileSync(`_site/${f.file}`)), f.sha256, f.file);
    for (const asset of files('assets')) assert.equal(hash(fs.readFileSync(`_site/${asset}`)), hash(fs.readFileSync(asset)));
  });
  check('Internal HTML, CSS and JS links resolve; fragment IDs preserved', () => {
    for (const file of extraction.pages) {
      const html = text(`_site/${file}`);
      for (const [, , ref] of html.matchAll(/\b(?:href|src)\s*=\s*(["'])(.*?)\1/gs)) {
        if (!ref || /^(?:https?:|mailto:|tel:|data:|\/\/)/.test(ref)) continue;
        const [url, fragment] = ref.split('#'); const pathname = url.split('?')[0];
        let dest = pathname ? (pathname.startsWith('/') ? pathname.slice(1) : path.posix.join(path.posix.dirname(file), pathname)) : file;
        if (!dest || dest.endsWith('/')) dest = path.posix.join(dest, 'index.html');
        assert(fs.existsSync(`_site/${dest}`), `${file}: ${ref}`);
        if (fragment) assert(text(`_site/${dest}`).includes(`id="${fragment}"`), `${file}: ${ref}`);
      }
    }
  });
  check('Six services use the shared layout, four partials and a single CSS file', () => {
    const services = extraction.pages.filter(f => !['index.html', 'portfolyo/index.html'].includes(f));
    for (const file of services) {
      const src = text(`src/${file.replace('.html', '.njk')}`);
      assert(src.includes('{% extends "layouts/service.njk" %}'));
      assert(!src.includes('<style>'));
      assert(text(`_site/${file}`).includes('/assets/css/services.css'));
    }
    assert.equal(files('src/_includes/services').length, 4);
  });
  check('Only intended public files are output; no migration records, backups, CMS data or blog', () => {
    for (const file of files('_site')) assert(file.startsWith('_site/assets/') || extraction.pages.includes(file.slice(6)) || ['CNAME','robots.txt','sitemap.xml','favicon.ico','favicon.png','favicon-48x48.png','favicon-96x96.png'].includes(file.slice(6)), file);
    assert(!fs.existsSync('_site/.pages.yml')); assert(!fs.existsSync('_site/content')); assert(!fs.existsSync('src/blog'));
  });
  const result = { passed: results.length, failed: 0, eleventy: load('node_modules/@11ty/eleventy/package.json').version, checks: results };
  fs.writeFileSync('migration/phase-3/eleventy-regression-results.json', JSON.stringify(result, null, 2) + '\n');
  console.log(`${results.length} preservation checks passed; 0 failures.`);
} catch (error) {
  fs.writeFileSync('migration/phase-3/eleventy-regression-results.json', JSON.stringify({ passed: results.length, failed: 1, error: error.message, checks: results }, null, 2) + '\n');
  throw error;
}
