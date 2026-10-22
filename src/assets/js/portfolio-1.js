
const STRINGS = {"tr":{"nav_brand":"Mustafa Anıl Aşlakcı","nav_sub":"Proje Portfolyosu","nav_tag":"E-ticaret • Otomasyon • Veri Analizi","home_link":"Ana Siteye Dön","kicker":"Proje Portfolyosu","h1":"Seçili Çalışmalar","hero_p":"Bu portfolyo; e-ticaret operasyonları, pazaryeri süreçleri, stok takibi, veri analizi ve yazılım geliştirme alanlarında ürettiğim seçili projeleri gösterir. Odak noktam, tekrar eden işleri azaltan, hataları önleyen ve karar almayı hızlandıran pratik çözümler geliştirmek.","stat1_lbl":"Tamamlanan Proje","stat2_num":"PyQt5 · Flask · JS","stat2_lbl":"Kullanılan Teknolojiler","stat3_num":"Uçtan Uca","stat3_lbl":"Geliştirme","section_title":"Projeler","section_sub":"Kartlara tıklayınca detay açılır. Görseller büyütülebilir.","filter_all":"Tümü","detail_problem":"Sorun","detail_solution":"Çözüm","detail_impact":"Etki","gallery_head":"Uygulama İçi Görseller","gallery_sub":"Görsellere tıklayarak büyütebilirsiniz.","zoom_btn":"Büyüt","zoom_note":"Kapatmak için görsele ya da boş alana tıkla • ESC","footer_text":"Mustafa Anıl Aşlakcı — Proje Portfolyosu. Görseller uygulama içi ekran görüntülerinden oluşur.","detail_link":"Detayı gör","page_title":"Mustafa Anıl Aşlakcı — Proje Portfolyosu"},"en":{"nav_brand":"Mustafa Anıl Aşlakcı","nav_sub":"Project Portfolio","nav_tag":"E-Commerce • Automation • Data Analysis","home_link":"Back to Main Site","kicker":"Project Portfolio","h1":"Selected Work","hero_p":"This portfolio showcases projects built across e-commerce operations, marketplace workflows, inventory tracking, data analysis, and personal software experiments. The focus throughout has been practical tools that cut repetitive work and speed up decisions, not polished presentation for its own sake.","stat1_lbl":"Completed Projects","stat2_num":"PyQt5 · Flask · JS","stat2_lbl":"Core Technologies","stat3_num":"End-to-End","stat3_lbl":"Development","section_title":"Projects","section_sub":"Click a card to open its detail view. Click any image to zoom.","filter_all":"All","detail_problem":"Problem","detail_solution":"Solution","detail_impact":"Impact","gallery_head":"In-App Screenshots","gallery_sub":"Click any image to enlarge it.","zoom_btn":"Zoom","zoom_note":"Click image or background to close • ESC","footer_text":"Mustafa Anıl Aşlakcı — Project Portfolio. Screenshots are taken directly from working applications.","detail_link":"View details","page_title":"Mustafa Anıl Aşlakcı — Project Portfolio"}};
let currentLang = 'tr';
function setLang(lang) {
  if (lang === currentLang) return;
  currentLang = lang;
  const s = STRINGS[lang];
  document.getElementById('html-root').setAttribute('lang', lang);
  document.title = s.page_title;
  document.getElementById('page-title').textContent = s.page_title;
  document.getElementById('brand-name').textContent = s.nav_brand;
  document.getElementById('brand-sub').textContent = '/ ' + s.nav_sub;
  document.getElementById('nav-tag').textContent = s.nav_tag;
  document.getElementById('home-link-text').textContent = s.home_link;
  document.getElementById('home-link').setAttribute('aria-label', s.home_link);
  document.getElementById('kicker').textContent = s.kicker;
  document.getElementById('h1').textContent = s.h1;
  document.getElementById('hero-p').textContent = s.hero_p;
  document.getElementById('stat1-num').textContent = document.querySelectorAll('#grid-' + lang + ' .project-card').length;
  document.getElementById('stat1-lbl').textContent = s.stat1_lbl;
  document.getElementById('stat2-num').textContent = s.stat2_num;
  document.getElementById('stat2-lbl').textContent = s.stat2_lbl;
  document.getElementById('stat3-num').textContent = s.stat3_num;
  document.getElementById('stat3-lbl').textContent = s.stat3_lbl;
  document.getElementById('section-title').textContent = s.section_title;
  document.getElementById('section-sub').textContent = s.section_sub;
  document.getElementById('zoom-note').textContent = s.zoom_note;
  document.getElementById('footer-text').textContent = s.footer_text;
  document.getElementById('lang-btn-tr').classList.toggle('active', lang==='tr');
  document.getElementById('lang-btn-en').classList.toggle('active', lang==='en');
  document.getElementById('filters-tr').style.display = lang==='tr' ? 'flex' : 'none';
  document.getElementById('filters-en').style.display = lang==='en' ? 'flex' : 'none';
  document.getElementById('grid-tr').style.display = lang==='tr' ? 'grid' : 'none';
  document.getElementById('grid-en').style.display = lang==='en' ? 'grid' : 'none';
  document.querySelectorAll('#filters-'+lang+' .filter-btn').forEach((b,i) => {
    b.style.display = 'inline-flex';
    b.classList.toggle('active', i===0);
  });
  document.querySelectorAll('#grid-'+lang+' .project-card').forEach(c => c.style.display='flex');
  closeModal();
}
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
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  document.querySelectorAll('.modal.open').forEach(m => m.classList.remove('open'));
  document.body.style.overflow = '';
}
document.querySelectorAll('.modal').forEach(m => m.addEventListener('click', e => { if(e.target===m) closeModal(); }));
document.querySelectorAll('.project-card').forEach(c => c.addEventListener('keydown', e => { if(e.key==='Enter'||e.key===' '){e.preventDefault();c.click();} }));
function zoomImage(img) {
  document.getElementById('zoom-img').src = img.src;
  document.getElementById('zoom').classList.add('open');
}
function closeZoom() { document.getElementById('zoom').classList.remove('open'); }
document.addEventListener('keydown', e => { if(e.key==='Escape'){closeZoom();closeModal();} });
