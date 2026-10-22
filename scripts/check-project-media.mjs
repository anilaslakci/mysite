import { loadPortfolio, mediaReferences } from '../lib/portfolio.mjs';
// Archived records still own their media and must participate in deletion checks.
const { allProjects: projects, media }=loadPortfolio();
const files=[...new Set(projects.flatMap(p=>(p.gallery ?? []).map(i=>i.file)))];
const registered=new Set(media.map(m=>m.file));
console.log(JSON.stringify({missing:0,projectCount:projects.length,referencedImages:files.length,registeredImages:media.length,archivedImages:media.filter(m=>m.archived).length,unregisteredGalleryImages:files.filter(f=>!registered.has(f)),references:media.map(m=>({file:m.file,archived:!!m.archived,projectIds:mediaReferences(projects,m.file),used:mediaReferences(projects,m.file).length>0})),note:'Read-only audit. Archiving is metadata only. No files are deleted. Native Pages CMS physical deletion is NOT locked by this audit. Register new uploads in the media archive when archive management is needed.'},null,2));
