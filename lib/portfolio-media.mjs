import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

// Metadata archiving NEVER moves/deletes bytes or removes existing gallery references.
export function loadMediaRegistry({directory = process.env.PORTFOLIO_MEDIA_TEST_DIR || 'src/content/media', mediaRoot = process.cwd()} = {}) {
  const ids = new Set(), files = new Set();
  return fs.readdirSync(directory).filter(file=>file.endsWith('.json')).map(filename=>{
    const m=JSON.parse(fs.readFileSync(path.join(directory,filename),'utf8'));
    assert(typeof m.uid==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(m.uid),`Invalid media UUID ${filename}`);
    assert.equal(filename,`${m.uid}.json`,`Media UUID/filename mismatch ${filename}`);
    assert(!ids.has(m.uid),`Duplicate media UUID ${m.uid}`);ids.add(m.uid);
    assert(/^\/assets\/portfolio\/[a-zA-Z0-9._-]+\.(?:png|jpe?g)$/i.test(m.file),`Invalid registry media path ${m.file}`);
    assert(!files.has(m.file),`Duplicate metadata for image ${m.file}`);files.add(m.file);
    assert(m.archived==null || typeof m.archived==='boolean',`Invalid media archive flag ${m.file}`);
    assert(m.title==null || (typeof m.title==='string' && !/[<>]/.test(m.title)),`Invalid media title ${m.file}`);
    const full=path.join(mediaRoot,m.file.slice(1));
    assert(fs.existsSync(full),`Registered image physically missing: ${m.file}; archiving must not delete files`);
    const bytes=fs.readFileSync(full);
    assert(m.file.toLowerCase().endsWith('.png') ? bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a' : bytes.subarray(0,3).toString('hex')==='ffd8ff',`Invalid registry image bytes ${m.file}`);
    return m;
  });
}
