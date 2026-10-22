# TR/EN dönüşümü ve yayın öncesi kalite raporu

## Başlangıç ve güvenli senkronizasyon

Başlangıç dalı `refactor/eleventy-cms-migration`, temiz yerel commit `ff8b90f`. Uzak CMS commit'i `d120e7030496b8c4c5c9449a7168f7a0692cea9b` geçmiş değiştirilmeden fast-forward alındı. Depo fetch ayarı yalnızca main izlediğinden fetch sonrası `FETCH_HEAD` kullanıldı; bu ayar değiştirilmedi.

Bağımsız başlangıç arşivi `.migration-backups/phase-7/baseline-d120e70.zip`, SHA-256 `690d1f0bf6b94bfbee908edc8ef23c82fb26614fddcf0f9c6dd1fdec9309f992`. Tam Git geçmişi `.migration-backups/phase-7/before-i18n.bundle` içinde, bundle verify başarılı. Önceki yedekler ve migration manifestleri korundu. Aynı diskteki kopyalar cihaz dışı yedek yerine geçmez.

## Gerçek CMS deneme kaydı

`src/content/posts/1d202b18-6746-4ff1-92d1-47c90bb9750c.md` CMS kaynaklı commit'ten alındı. UUID v4 ile dosya adı eşleşiyor; ayrı translationKey saklanmış. `locale: tr`, başlık `CMS Deneme Yazısı`, slug `cms-deneme-yazisi`, kategori `teknik-rehberler`, durum `draft`, özet `sasasasa`. Gövde ve tarih alanları boş; dolu Markdown gövdesinin gerçek editör round-trip'i bu kayıtla kanıtlanamaz.

Mevcut kayıtla build ve çıktı doğrulaması geçti; taslak HTML, liste, RSS ve sitemap'te yoktu. Açıkça belirtilen bu deneme dosyası, tam arşive ek olarak `.migration-backups/phase-7/cms-deneme-yazisi.md` adıyla bağımsız kopyalandıktan sonra silindi. Başka blog kaydı yoktu; başka bir yazı/proje/görsel silinmedi.

Bu oturumun Pages CMS tarayıcısı yine `/sign-in` ekranına yönlendi. Hesap izni verilmedi, form gönderilmedi, kullanıcı adına CMS kaydı düzenlenmedi. Kullanıcının önceki gerçek Save işlemi ve Git kaydı, UUID'nin depoya kaydedildiğinin kanıtıdır; yeni EN seçicisi, çeviri eşleştirme alanı ve güncellenen editörün gerçek Save akışı ayrıca kullanıcı kabulü gerektirir.

## İki dilli mimari

```text
lib/i18n.mjs                         açık TR/EN sayfa eşleştirmeleri, build-time yerelleştirme
src/i18n/en.json                     elle hazırlanmış İngilizce metin sözlüğü
src/i18n/invariant-text.json         çevrilmeyen özel ad, ürün ve teknik terimler
src/_includes/pages/*.njk            ortak ana sayfa, portfolyo ve altı hizmet kaynağı
src/_includes/layouts/service.njk    ortak hizmet düzeni
src/index.njk, src/<tr-yol>/...       mevcut URL'lerde küçük kaynak sarmalayıcıları
src/en/pages.njk                     aynı şablonlardan sekiz EN çıktısı
src/_data/pagePairs.mjs              İngilizce sayfa üretim listesi
src/content/projects/*.json          aynı 21 iki dilli proje; dosyaları değiştirilmedi
src/content/posts/<uuid>.md          bağımsız TR/EN blog kayıtları
src/content/blog-categories/*.json   mevcut TR ad + yeni EN ad
src/assets/css/i18n.css              dil seçimi ve dar kapsamlı erişilebilirlik düzeltmeleri
scripts/test-i18n.mjs                izole iki dilli blog ve SEO senaryoları
scripts/test-translation-coverage.mjs yeni statik metinde sessiz çeviri kaybını engeller
```

Çeviri build sırasında yalnızca depoda tutulan, elle hazırlanmış sözlükten yapılır. Widget, çalışma anı çeviri servisi veya otomatik metin üretimi yoktur. Ortak HTML ve mevcut CSS korunur; İngilizce için ayrı kopyalanmış tasarım tutulmaz. Türkçe metin değiştiğinde sözlük eşleştirmesi gözden geçirilmeli; günlük test yeni tanımsız statik metni reddeder. Sözlük bir kelime bazlı otomatik çevirici değildir. Statik ana sayfa ve hizmet metinleri bu aşamada yeni CMS sayfa koleksiyonuna taşınmadı; kod/sözlük dosyalarından yönetilir. Portfolyo, kategori, medya ve blog CMS yönetimi devam eder.

| TR | EN |
|---|---|
| `/` | `/en/` |
| `/portfolyo/` | `/en/portfolio/` |
| `/pazaryeri-yonetimi/` | `/en/marketplace-management/` |
| `/erp-entegrasyonu/` | `/en/erp-integration/` |
| `/reklam-kampanya-yonetimi/` | `/en/advertising-campaign-management/` |
| `/e-ticaret-sitesi-yonetimi/` | `/en/ecommerce-website-management/` |
| `/veri-analizi-raporlama/` | `/en/data-analysis-reporting/` |
| `/operasyon-otomasyon/` | `/en/operations-automation/` |
| `/blog/` | `/en/blog/` |

Ana sayfa açılışı, hero, navigasyon, kariyer/eğitim/yetkinlik/hobi içerikleri, altı hizmet sayfasının bütün açıklamaları, CTA, footer, SEO ve erişilebilirlik metinleri çevrildi. Şirket, tarih, eğitim, deneyim ve sayısal bilgiler korunur. Mevcut proje EN metinleri incelendi; içerik dosyalarında yeniden yazım yapılmadı. Oyun/ürün özel adlarındaki Türkçe ifadeler isim oldukları için korundu.

Portfolyoda her URL yalnızca kendi dilindeki 21 kart ve modalı üretir; toplam 42 kart/42 modal. Kimlik, sıra, kategori, galeri ve 67 görsel değişmedi. `setLang()` eski çağrılar için eşdeğer URL'ye yönlendirir; arayüz gerçek bağlantılar kullanır. İngilizce derin yollarda görsellerin kırılmaması için yayın yolları `/assets/...` oldu; dosya baytları değişmedi.

## Dil geçişi ve blog modeli

Sayfa eşleştirmeleri slug metninden tahmin edilmez; `pagePairs` tablosunda açıktır. Dil bağlantıları native linktir, klavyeyle çalışır. Cookie/localStorage, tarayıcı diliyle zorunlu yönlendirme yoktur. URL yenilenince dil korunur; kök varsayılan Türkçedir. Açılış ekranında da TR/EN bulunur.

Blogda `uid` her kaydın değişmeyen UUID'sidir. `locale` seçimi TR veya EN; `translationKey` aynı makalenin iki sürümünü bağlar. Bağımsız yazıda boş bırakılabilir (uid kullanılır); çeviride asıl kaydın translationKey/uid değeri kopyalanır. Bu alan UUID düğmesiyle rastgele yeniden üretilmez; açık açıklamalı string alanıdır ve build UUID doğrulaması yapar. Otomatik çeviri eşleştirmesi varmış gibi davranılmaz.

Slug benzersizliği dil içinde denetlenir, farklı diller aynı slug'ı kullanabilir. Her kaydın taslak/yayın durumu ve tarihi bağımsızdır. Yalnızca yayımlanan eşdeğerler hreflang ve dil bağlantısına girer. Çeviri yoksa diğer dil seçeneği pasif, hedef makale bağlantısı yoktur. İlgili yazılar, kategori adları ve RSS dile göre ayrılır. Eksik EN kategori adıyla İngilizce yayın reddedilir.

## CMS kullanılabilirliği

Kategori referanslarında teknik `(arşiv: false)` eki kaldırıldı; kategori adı gösterilir. Arşiv durumu ayrı koleksiyonda `Arşivlendi` alanında korunur. Resmî reference alanında koşullu etiket veya aktif kayıt filtresi belgelenmediğinden sahte ayar eklenmedi; arşivli seçeneklerin seçicide hiç görünmeyeceği iddia edilmez. Kullanım/referans kontrolleri build'de korunur.

Teknik proje UUID ve dosya adı gizli/salt okunur; eski sayısal kimlik korunur. Kart ve detay teknolojileri farklıysa ayrı saklanır; detay listesi boşsa kart etiketleri kullanılır. Galerilerde iki dil alt metin, sıralama ve paylaşılan dosya kullanımı korunur. Görsel arşivleme dosya silmez; metadata silme kapalıdır, medya ekranındaki fiziksel silmeyi engelleyen bir servis özelliği eklenmedi. Referans takibi ve eksik dosya build hataları devam eder.

## SEO ve yayın sınırı

Her dil kendi canonical URL'sine sahiptir; statik eşdeğerler karşılıklı `tr`, `en`, Türkçe `x-default` kullanır. Blog makaleleri yalnızca yayımlanan eşdeğerleri bildirir. `<html lang>`, OG locale, title, description, sosyal metadata ve yapılandırılmış veri dili uyumludur. BlogPosting/BreadcrumbList gerçek görünen kaydı kullanır; mevcut Person/Service/ProfilePage bilgileri korunarak EN metinleri yerelleştirilir.

Tek sitemap iki dilde 18 temel URL ve yalnızca yayımlanan yazıları içerir. `/feed.xml` TR, `/en/feed.xml` EN'dir. 404'ler noindex, sitemap dışında; `/en/404.html` İngilizce hazırlanmıştır. Önizleme bilinmeyen EN yollarına EN 404 verir. GitHub Pages'in bilinmeyen yollar için kök `404.html` kullanma davranışı canlıya geçişte ayrıca kontrol edilmelidir; geliştirme önizlemesi canlı davranış kanıtı değildir.

Tek yayın koşulu her dil için `published && publishAt <= buildTime`. Europe/Istanbul, tam an sınırları, taslak/gelecek/yayından kaldırma filtreleri korunur. Lastmod gerçek kaynak commit'i ve içerik tarihlerine bağlıdır, build saati değildir.

Aktif workflow yalnızca test yapar; çok dilli senaryo adımı eklendi. Yayın örneğinde aynı doğrulama adımı hazırlanmış olup dosya hâlâ `ops/` altında `.example` durumundadır. Cron `0 6 * * *` (güncel Türkiye 09.00), main ve `ENABLE_SITE_DEPLOY` kapıları değişmedi; etkinleştirilmedi. Günlük kontrolden hemen sonraki bir yayın, başka build olmazsa ertesi kontrolü bekler; GitHub gecikmeleri olabilir. Daha sık kontrol gerekirse üretim onayında ayrıca değerlendirilmelidir.

## QA ve açık sınırlar

- Günlük build: mevcut URL'ler, iki portfolyo çıktısı, SEO, bağlantılar, medya, sitemap, iki RSS ve çeviri kapsamı başarılı.
- Tarihsel koruma: 19 kontrol + 9 kayıt kontrolü; 84 kart/modal içerik karşılaştırması ve 67 SHA-256 başarılı. Önceki tek URL'deki çift dil DOM'u yerine iki URL toplamı karşılaştırılır; erişilebilirlik nitelikleri ve kök medya yolları açık istisnadır.
- Portfolyo esneklik: 14 grup; UUID/arşiv/medya: 12 grup + 8 beklenen hata, 10.000 UUID örneğinde gözlenen çakışma yok.
- Blog: 14 grup + 16 beklenen bozuk kayıt reddi; yeni çok dilli senaryolar: 10 grup.
- Yerel CMS benzeri edit/build/undo: 6 kontrol. Resmî ConfigSchema: geçerli, iki hatalı şema reddedildi.
- HTTP: 115 kontrol; iki dilde dosyalar ve özel dosyalara erişim engeli.
- Gerçek tarayıcı: 54 sayfa görünümü (1440/768/390), taşma yok; 42 modal, iki dil filtre/zoom/odak tuzağı/Escape/odak geri dönüşü; altı izole TR/EN blog detay görünümü; mobil menü ve kariyer sekmeleri başarılı. 24 önceki TR ekranı aynı ölçülerde kaydedildi. Piksel düzeyinde sıfır fark iddia edilmez: dil bağlantıları ve mobil menü kasıtlı farktır.
- Reduced-motion ve coarse-pointer koşullarına CSS/JS desteği eklendi; işletim sistemi tercihi gerçek cihazda değiştirilerek test edilmedi. Tam ekran okuyucu denetimi yapılmadı.
- GA4 kimliği ve mevcut analytics dosyaları korunur; EN sayfalar ve blog aynı kimliği kullanır. Önizleme harici analytics isteklerini engeller; GA4 paneline canlı olay ulaştığı iddia edilmez.
- Gerçek CMS EN oluşturma/Save ve tam görsel yükleme akışı giriş gerektirir; bu oturumda yapılmadı. Harici Rich Results/Search Console kabulü ve canlı 404 kontrolü yapılmadı.

GitHub CI/push sonucu teslim raporunda ve yerel GitHub güvenlik kaydında belirtilir. Temiz runner kurulumu son GitHub doğrulamasında ayrıca doğrulanmalıdır. Kullanıcıya ait gerçek yayın makalesi bırakılmadı; QA yazıları ignored klasörde.

## Geri dönüş ve üretim öncesi

Bu aşamanın commit'lerini `git revert` ile geri alın; force reset/push kullanmayın. Böylece CMS deneme kaydı dahil önceki sürüme geri dönülebilir. Tek dosya için bağımsız kopya veya `git show d120e70:<yol>` kullanılabilir. Main ve yayın ayarları bu işlemle değiştirilmez.

Canlıdan önce kullanıcı oturumunda yeni CMS formu kabulü, profesyonel EN metinlerin son editoryal onayı, gerçek yazı kontrolü, üretim 404/GA4/SEO kontrolleri ve ayrı main/Pages/otomasyon geçiş onayı gerekir. Canlıya alınmadı.

Resmî kaynaklar: [Pages CMS reference](https://pagescms.org/docs/configuration/fields/reference/), [UUID](https://pagescms.org/docs/configuration/fields/uuid/), [Google çok dilli sürümler](https://developers.google.com/search/docs/specialty/international/localized-versions), [GitHub schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
