import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const pages = JSON.parse(fs.readFileSync('migration/phase-2/extraction-manifest.json')).pages;
const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.xml': 'application/xml', '.txt': 'text/plain' };
http.createServer((req, res) => {
  try {
    const requestUrl = new URL(req.url, 'http://localhost');
    let url = decodeURIComponent(requestUrl.pathname);
    const phase7Baseline=url.startsWith('/__phase7before/');if(phase7Baseline)url=url.slice('/__phase7before'.length);
    const baseline = url.startsWith('/__baseline/');
    if (baseline) url = url.slice('/__baseline'.length);
    const fixture = url.startsWith('/__cmsfixture/');
    if (fixture) url = url.slice('/__cmsfixture'.length);
    const blogFixture = url.startsWith('/__blogfixture/');
    if (blogFixture) url = url.slice('/__blogfixture'.length);
    const i18nFixture=url.startsWith('/__i18nfixture/');if(i18nFixture)url=url.slice('/__i18nfixture'.length);
    let relative = url.replace(/^\/+/, '');
    if (!relative || relative.endsWith('/')) relative += 'index.html';
    if (!pages.includes(relative) && !/^en\/(?:[a-z0-9-]+\/)*(?:index.html|404.html|feed.xml)$/.test(relative) && !/^blog\/(?:[a-z0-9-]+\/)?index\.html$/.test(relative) && !relative.startsWith('assets/') && !['CNAME','robots.txt','sitemap.xml','feed.xml','404.html','favicon.ico','favicon.png','favicon-48x48.png','favicon-96x96.png'].includes(relative)) { res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}); res.end(fs.readFileSync(path.join(root,url.startsWith('/en/')?'_site/en/404.html':'_site/404.html'))); return; }
    let base = path.resolve(root, phase7Baseline ? '.migration-preview/phase-7-before' : baseline ? '.' : fixture ? '.migration-preview/cms-edit-output' : '_site');
    if(blogFixture){base=path.resolve(JSON.parse(fs.readFileSync('.migration-preview/blog-fixture.json')).site);if(!base.startsWith(path.join(root,'.migration-preview')+path.sep))throw Error('Unsafe fixture root');}
    if(i18nFixture){base=path.resolve(JSON.parse(fs.readFileSync('.migration-preview/i18n-fixture.json')).site);if(!base.startsWith(path.join(root,'.migration-preview')+path.sep))throw Error('Unsafe fixture root');}
    const file = path.resolve(base, relative);
    if (!file.startsWith(base + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'}); res.end(fs.readFileSync(path.join(root,'_site/404.html'))); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'Content-Security-Policy': "script-src 'self' 'unsafe-inline'; connect-src 'self'" });
    if (file.endsWith('.html')) {
      let html=fs.readFileSync(file,'utf8');
      // Ignored QA posts/assets remain isolated; this prefix never enters real output.
      if(blogFixture)html=html.replace(/\b(href|src)="\/(assets\/|blog\/)/g,'$1="/__blogfixture/$2');
      if(i18nFixture)html=html.replace(/\b(href|src)="\/(?!\/)/g,'$1="/__i18nfixture/');
      if(requestUrl.searchParams.get('visual')==='1'){
      // Screenshot-only stabilization, identical for baseline and build.
      // Never written to source/output; ordinary routes test real animations.
      const stable = '<style data-preview-only="visual">*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}#cur,#cur-ring,#iglow,.i-p,.h-p,.star-el{visibility:hidden!important}.reveal{opacity:1!important;transform:none!important}.h-eyebrow,.hero h1,.h-desc,.h-actions,.h-stats,.scroll-ind{opacity:1!important;transform:translateY(0)!important}[data-count]{visibility:hidden!important}</style>';
        html=html.replace('</head>',stable+'</head>');
      }
      res.end(html);
    } else fs.createReadStream(file).pipe(res);
  } catch { res.writeHead(400); res.end(); }
}).listen(4174, '127.0.0.1', () => console.log('Eleventy comparison: http://127.0.0.1:4174/ ; original /__baseline/ ; analytics blocked by preview-only CSP.'));
