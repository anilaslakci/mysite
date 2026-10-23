# Mobil tek satır header ve intro sonrası yerleşim

Kök neden: site.css max-width1199 kuralı site-nav-actions için grid-row2 tanımlıyor, yalnızca min-width650 kuralı bunu birinci satıra alıyordu. 390 ve 412 dar viewport ölçümünde header129px, hero kategori başlangıcı120px; ilk9px kesiliyordu. Intro sonrası scroll0, transformnone ve kilitsiz durum ölçüldü; neden intro/yaldız değildir.

Düzeltme: mobil/tablet üç grid sütunu (esnek marka, dil,44px hamburger), tek satır. Altın üst CTA1199 altında gizli, mevcut Projeler/Projects bağlantısı menüde altıncı öğe. Masaüstü aynı üç eşit dış sütun, merkeznav ve altın CTA korunur. Logo dar ekrana uygun clamp ile ölçeklenir; TR/EN hedefleri44x44. Menü nav altından100% konumlanır, viewport yüksekliğine sınırlandırılır ve gerekirse kendi içinde kayar. Negatif margin/ofset veya hero padding değişikliği yoktur.

Kaynak değişiklikleri: src/assets/css/site.css ve src/_includes/shared/header.njk. scripts/test-header.mjs menü sözleşmesi altıncı bağlantıyla güncellendi; scripts/test-mobile-header-browser.mjs yeni gerçek Chrome ölçümleridir.

Yerel doğrulama: npm test (build,21 proje,blog/SEO,TR/EN,10consent,8navigation,18header,18intro grubu); blog14senaryo/16geçersiz veri, i18n10ve çeviri11grup, workflow güvenliği geçti. after/results.json16ana sayfa görünümü ve32ek TR/EN route kontrolünü içerir. Genişlikler320,360,390,412,430,768,1024,1440. Mobile touch CDP ile gerçek tarayıcı girdisi; fiziksel telefon testi değildir. Header73px, hero120px veya daha aşağıda; scroll0, kilitfalse, site transformnone. Masaüstü1440 header85px, marka x71.25/w194.59375, aksiyon x1147.5625/w206.1875 değerleri önceki canlıyla aynıdır. MenüdeTab ilkbağlantıya,Escape hamburgera döner; Projeler doğru route ve dil karşılığına gider. Açık menü viewportta kalır; yatay taşma ve konsol hatası yoktur.

Önce canlı6e3167f ekran görüntüleri before/, sonra yerel ölçüm ve390/412intro-sonrası/menü görüntüleri after/ içindedir. decor-regression/ mevcut yaşayan yaldız regresyon testidir. Intro controller,cursor,GA/consent,kullanıcı içerikleri67görsel ve workflow değiştirilmedi. Gerçek fiziksel telefon/Safari ve fieldCWV doğrulanmadı.

Tekrar çalıştırma: kurulu Playwright modülünü PLAYWRIGHT_MODULE ile belirtin (yeni bağımlılık eklenmez); TEST_BASE_URL yerel/üretim kökü, TEST_EVIDENCE_DIR çıktı dizini. Varsayılan http://127.0.0.1:4174.
