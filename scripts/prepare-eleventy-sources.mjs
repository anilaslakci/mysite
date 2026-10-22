// One-time, lossless source extraction. Not used by normal builds.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const hash = x => crypto.createHash('sha256').update(x).digest('hex');
const put = (file, text) => { assert(!fs.existsSync(file), `Refusing overwrite: ${file}`); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };
const json = (file, data) => put(file, JSON.stringify(data, null, 2) + '\n');
assert.equal(execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim(), 'refactor/eleventy-cms-migration');
assert(!fs.existsSync('src'), 'Source folder already exists');
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
json('migration/phase-2/baseline-inventory.json', {
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  files: files.map(file => ({ file, bytes: fs.statSync(file).size, sha256: hash(fs.readFileSync(file)) }))
});
const services = ['pazaryeri-yonetimi', 'erp-entegrasyonu', 'reklam-kampanya-yonetimi', 'e-ticaret-sitesi-yonetimi', 'veri-analizi-raporlama', 'operasyon-otomasyon'];
const transforms = [];
const assets = new Map();
function externalize(html, kind, file) {
  let style = 0; let script = 0;
  return html.replace(/<(style|script)\b([^>]*)>([\s\S]*?)<\/\1>/g, (block, tag, attrs, body, offset) => {
    // JSON-LD, async third-party loader, and the JS-disabled fallback remain inline.
    if (tag === 'script' && (/\bsrc=|application\/ld\+json/.test(attrs))) return block;
    if (tag === 'style' && html.lastIndexOf('<noscript>', offset) > html.lastIndexOf('</noscript>', offset)) return block;
    const name = tag === 'style' ? (kind === 'service' ? 'services.css' : `${kind}-${++style}.css`) : (body.includes('function gtag') ? (kind === 'service' ? 'analytics-service.js' : 'analytics.js') : `${kind}-${++script}.js`);
    const asset = `assets/${tag === 'style' ? 'css' : 'js'}/${name}`;
    if (assets.has(asset)) assert.equal(assets.get(asset), body, `Shared asset mismatch ${asset}`);
    else { assets.set(asset, body); put(`src/${asset}`, body); }
    const replacement = tag === 'style' ? `<link rel="stylesheet" href="/${asset}">` : `<script src="/${asset}"></script>`;
    transforms.push({ file, asset, originalBlock: block, replacement, sha256: hash(body) });
    return replacement;
  });
}
for (const [file, kind] of [['index.html', 'home'], ['portfolyo/index.html', 'portfolio']]) {
  const html = externalize(fs.readFileSync(file, 'utf8'), kind, file);
  const output = file === 'index.html' ? '/index.html' : '/portfolyo/index.html';
  put(`src/${file.replace('.html', '.njk')}`, `---\npermalink: ${output}\n---\n${html}`);
}
let shared;
for (const service of services) {
  const file = `${service}/index.html`;
  const html = externalize(fs.readFileSync(file, 'utf8'), 'service', file);
  const head = html.match(/^[\s\S]*?<head>([\s\S]*?)<\/head>/)[1];
  const header = html.match(/<header\b[\s\S]*?<\/header>/)[0];
  const hero = html.match(/<section class="hero">[\s\S]*?<\/section>/)[0];
  const article = html.match(/<article>([\s\S]*?)<\/article>/)[1];
  const sidebar = html.match(/<aside\b[\s\S]*?<\/aside>/)[0];
  const cta = html.match(/<section class="cta">[\s\S]*?<\/section>/)[0];
  const related = html.match(/<section class="related">[\s\S]*?<\/section>/)[0];
  const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)[0];
  if (!shared) {
    shared = { header, sidebar, cta, footer };
    for (const [name, value] of Object.entries(shared)) put(`src/_includes/services/${name}.njk`, value);
    const layout = html.replace(head, '{% block head %}{% endblock %}').replace(header, '{% include "services/header.njk" %}').replace(hero, '{% block hero %}{% endblock %}').replace(article, '{% block article %}{% endblock %}').replace(sidebar, '{% include "services/sidebar.njk" %}').replace(cta, '{% include "services/cta.njk" %}').replace(related, '{% block related %}{% endblock %}').replace(footer, '{% include "services/footer.njk" %}');
    put('src/_includes/layouts/service.njk', layout);
  } else assert.deepEqual({ header, sidebar, cta, footer }, shared, 'Shared service HTML differs');
  put(`src/${service}/index.njk`, `---\npermalink: /${service}/index.html\n---\n{% extends "layouts/service.njk" %}{% block head %}${head}{% endblock %}{% block hero %}${hero}{% endblock %}{% block article %}${article}{% endblock %}{% block related %}${related}{% endblock %}`);
}
json('migration/phase-2/extraction-manifest.json', { pages: ['index.html', 'portfolyo/index.html', ...services.map(x => `${x}/index.html`)], transforms });
console.log('Created eight templates, shared service layout/partials and lossless CSS/JS assets.');
