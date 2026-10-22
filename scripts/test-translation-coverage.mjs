import fs from 'node:fs';import assert from 'node:assert/strict';import {pagePairs,translate} from '../lib/i18n.mjs';
const invariant=new Set(JSON.parse(fs.readFileSync('src/i18n/invariant-text.json','utf8')));
let checked=0;for(const pair of pagePairs.filter(p=>p.source&&p.key!=='portfolio')){const source=fs.readFileSync('_site/'+pair.tr.slice(1)+'index.html','utf8').replace(/<script[^]*?<\/script>|<style[^]*?<\/style>/g,'');for(const m of source.matchAll(/>([^<>]+)</g)){const text=m[1].trim();if(!text||invariant.has(text))continue;assert.notEqual(translate(text),text,'Missing deliberate EN translation: '+text);checked++;}}
console.log(checked+' Turkish text segments have deliberate English translations.');
