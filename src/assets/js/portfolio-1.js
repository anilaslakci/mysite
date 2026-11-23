let currentLang = document.documentElement.lang === 'en' ? 'en' : 'tr';
let returnFocus, zoomViewer;
const zoom = document.getElementById('zoom');
const zoomFull = document.getElementById('zoom-img');
const zoomNavigation = document.getElementById('zoom-navigation');
const zoomPosition = document.getElementById('zoom-position');
const zoomStatus = document.getElementById('zoom-status');
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
  window.gtag?.('event', 'portfolio_modal_open', {project_id: id});
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const wasOpen=!!document.querySelector('.modal.open');
  document.querySelectorAll('.modal.open').forEach(m => { m.classList.remove('open'); m.setAttribute('aria-hidden', 'true'); });
  document.querySelector('main')?.removeAttribute('inert');document.querySelector('header')?.removeAttribute('inert');
  document.body.style.overflow = '';
  if(wasOpen&&returnFocus?.isConnected)returnFocus.focus();
}
document.querySelectorAll('[data-close-project]').forEach(link => link.addEventListener('click', closeModal));
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if(e.target===m) closeModal(); }));
document.querySelectorAll('.project-card').forEach(c => c.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();c.click();} }));
function zoomImage(img) {
  const gallery = img.closest('.gallery');
  const modal = gallery?.closest('.modal.open');
  if (!modal || zoomViewer) return;
  const images = [...gallery.querySelectorAll('.shot img')];
  zoomViewer = { images, index: images.indexOf(img), modal, trigger: img.closest('.shot') };
  zoomNavigation.hidden = images.length < 2;
  zoom.classList.add('open');
  zoom.setAttribute('aria-hidden', 'false');
  renderZoomImage();
  document.getElementById('zoom-close').focus();
  modal.inert = true;
}

function renderZoomImage() {
  const { images, index } = zoomViewer;
  const img = images[index];
  zoomFull.width = Number(img.getAttribute('width')) || img.naturalWidth;
  zoomFull.height = Number(img.getAttribute('height')) || img.naturalHeight;
  zoomFull.alt = img.alt;
  zoomFull.src = img.dataset.full || img.src;
  zoomFull.hidden = false;
  zoomPosition.textContent = `${index + 1} / ${images.length}`;
  zoomStatus.textContent = `${currentLang === 'en' ? 'Image' : 'Görsel'} ${zoomPosition.textContent}: ${img.alt}`;
}

function moveZoom(step) {
  if (!zoomViewer || zoomViewer.images.length < 2) return;
  const length = zoomViewer.images.length;
  zoomViewer.index = (zoomViewer.index + step + length) % length;
  renderZoomImage();
}

function closeZoom() {
  if (!zoomViewer) return;
  const { modal, trigger } = zoomViewer;
  zoomViewer = null;
  zoom.classList.remove('open');
  zoomFull.hidden = true;
  zoomStatus.textContent = '';
  zoom.setAttribute('aria-hidden', 'true');
  modal.inert = false;
  trigger?.focus({ preventScroll: true });
}

zoom.addEventListener('click', event => {
  const step = event.target.closest('[data-zoom-step]');
  if (step) moveZoom(Number(step.dataset.zoomStep));
  else if (!event.target.closest('.zoom-navigation')) closeZoom();
});

document.querySelectorAll('.shot').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.setAttribute('aria-label',(currentLang==='en'?'Enlarge: ':'Büyüt: ')+el.querySelector('img').alt);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click();}});});
document.addEventListener('keydown',e=>{
 const active=zoomViewer?zoom:document.querySelector('.modal.open');
 if(e.key==='Escape'){if(zoomViewer)closeZoom();else closeModal();}
 if(zoomViewer&&(e.key==='ArrowLeft'||e.key==='ArrowRight')){
   e.preventDefault();
   moveZoom(e.key==='ArrowLeft'?-1:1);
 }
 if(e.key==='Tab'&&active){const items=focusables(active),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
