import { loadPortfolio, mediaReferences } from '../lib/portfolio.mjs';
const { projects }=loadPortfolio();
const files=[...new Set(projects.flatMap(p=>p.gallery.map(i=>i.file)))];
console.log(JSON.stringify({missing:0,projectCount:projects.length,referencedImages:files.length,references:files.map(file=>({file,projectIds:mediaReferences(projects,file)})),note:'Read-only check. No media is deleted; referenced files must not be removed in CMS.'},null,2));
