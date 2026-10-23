let currentLang = document.documentElement.lang === 'en' ? 'en' : 'tr';
let returnFocus,zoomReturnFocus;
const focusables = el => [...el.querySelectorAll('button,a[href],[tabindex="0"]')].filter(e=>e.getClientRects().length);
function setLang(lang) { if(lang!==currentLang) location.href=lang==='en'?'/en/portfolio/':'/portfolyo/'; }
function filterProjects(cat, btn) {
  btn.closest('.filters').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('grid-'+currentLang).querySelectorAll('.project-card').forEach(card => {
    card.style.display = (cat==='all' || card.dataset.category===cat) ? 'flex' : 'none';
  });
}
function openProject(id) {
  const modal = document.getElementById('modal-'+currentLang+'-'+id);
  if (!modal) return;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  returnFocus=document.activeElement;
  document.querySelector('main')?.setAttribute('inert','');
  document.querySelector('header')?.setAttribute('inert','');
  modal.querySelector('.close').focus();
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const wasOpen=!!document.querySelector('.modal.open');
  document.querySelectorAll('.modal.open').forEach(m => { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); });
  document.querySelector('main')?.removeAttribute('inert');document.querySelector('header')?.removeAttribute('inert');
  document.body.style.overflow = '';
  if(wasOpen&&returnFocus?.isConnected)returnFocus.focus();
}
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if(e.target===m) closeModal(); }));
document.querySelectorAll('.project-card').forEach(c => c.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();c.click();} }));
function zoomImage(img) {
  zoomReturnFocus=document.activeElement;
  document.getElementById('zoom-img').src = img.src;
  document.getElementById('zoom-img').alt = img.alt;
  document.getElementById('zoom').classList.add('open');
  document.getElementById('zoom').setAttribute('aria-hidden','false');
  document.getElementById('zoom-close').focus();
}
function closeZoom() {const z=document.getElementById('zoom'),opened=z.classList.contains('open');z.classList.remove('open');z.setAttribute('aria-hidden','true');if(opened&&zoomReturnFocus?.isConnected)zoomReturnFocus.focus();}
document.querySelectorAll('.shot').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',(currentLang==='en'?'Enlarge: ':'Büyüt: ')+el.querySelector('img').alt);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});});
document.addEventListener('keydown',e=>{
 const zoom=document.getElementById('zoom'),active=zoom.classList.contains('open')?zoom:document.querySelector('.modal.open');
 if(e.key==='Escape'){if(zoom.classList.contains('open'))closeZoom();else closeModal();}
 if(e.key==='Tab'&&active){const items=focusables(active),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
