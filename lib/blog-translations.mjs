import assert from 'node:assert/strict';
import {isUUID} from './portfolio.mjs';
// References store source UID. No CMS cross-field writes or source-file rewrites.
export function resolveTranslations(posts){
 const byUID=new Map(posts.map(p=>[p.uid,p])),seen=new Set();
 for(const p of posts){
  if(p.translationKey)assert(isUUID(p.translationKey),'translationKey must be a UUID');
  const ref=p.translationOf;
  assert(ref==null||typeof ref==='string','Invalid translation reference');
  if(ref){
   assert(isUUID(ref),'Invalid translation reference UUID');
   assert(ref!==p.uid,'A post cannot translate itself');
   assert(p.locale==='en','Only English posts can select a Turkish original');
   const original=byUID.get(ref);assert(original,'Unknown Turkish original');
   assert(original.locale==='tr','Translation original must be Turkish');
   p.translationKey=original.translationKey||original.uid;
  }else p.translationKey=p.translationKey||p.uid;
  const scoped=p.locale+':'+p.translationKey;
  assert(!seen.has(scoped),'Duplicate translationKey/locale: a Turkish article can have only one English translation');seen.add(scoped);
 }
 return posts;
}
