# Swipe-up giriş ve minimal footer çerez kontrolü

Başlangıç main: `2398025afd5a7880f428193c39aa413149a59d12`. Dal: `codex/swipe-intro-footer`.

## Davranış

- Eski Keşfet/Explore butonu ve yatay perde yerine marka, ince çizgi ve altın yukarı ok / Yukarı Kaydır (Swipe Up) göstergesi kullanılır. İntro parçacıkları ve mouse glow kaldırıldı; ana site tasarımı korunur. Çıkış yalnızca transform/opacity ile 600 ms sürer; 650 ms emniyet zamanlayıcısı scroll/odağın kilitli kalmasını önler.
- Mobil yukarı hareket eşiği 60 px ve dikey yön üstünlüğüdür. Wheel/trackpad aşağı delta toplamı 200 ms pencerede 48 px olunca açılır. Zoom/multi-touch giriş sayılmaz. ArrowUp/Down, PageDown, Space, Enter ve Escape ile; ayrıca göstergeye tıklayarak girilebilir.
- Etkileşimsiz görünür süre 10 saniyedir. Her gerçek etkileşim otomatik sayacı kalıcı iptal eder; küçük hareketten sonra beklenmedik otomatik açılma olmaz. Sekme gizlenince süre ve ok animasyonu durur; görünür olunca kalan süre devam eder. Aynı anda ikinci kapanış başlayamaz.
- İlk odak açıklamalı dialog üzerindedir, Tab dialog içinde dolaşır; alttaki site geçici inert olur. Geçiş sonunda odak hero bölümüne aktarılır, tüm kilit ve dinleyiciler kaldırılır. Reduced motion doğrudan giriş sağlar. Mevcut sessionStorage/dil geçişi korunur; pagehide/bfcache temizliği vardır.
- JS olmadan intro varsayılan gizli, ana içerik/reveal alanları görünür ve normal imleç kullanılabilir. JS geç gelip sayfa zaten boyanmışsa 1.5 saniyeden sonra içeriğin üstüne intro bindirilmez. Intro scripti önceden yüklenir. Ana içerik gerçek HTML içinde kalır; no-JS veya script yükleme hatası erişimi kapatmaz.

## Footer önce / sonra

| Önce | Sonra |
|---|---|
| Altın çerçeveli, dolgu ve dış boşluk taşıyan çerez düğmesi | Şeffaf, çerçevesiz, diğer linklerle aynı font/satır yüksekliğinde metin kontrolü |
| Blog footerında farklı dikey hizalama | RSS, ana siteye dönüş ve çerez kontrolü ortak footer-links grubunda |
| Ana sayfada Blog copyright paragrafının içinde | Marka / copyright / Blog ve Çerez Tercihleri olarak ayrılan düzen |

Kontrol semantik button olarak kalır; bağlantı görünümündedir ve mevcut dialogu açar. Klavye focus halkası korunur. Analytics izin/yükleme kodu, kimlik, 180 günlük saklama ve alt bildirim panelinin yerleşim kuralları değiştirilmedi. consentHTML yalnızca footer içindeki yer tutucunun konumunu kullanır.

## Doğrulama

- npm test: Eleventy, çalışma zamanı veri/SEO, 10 consent, 8 dil UX ve 18 sayfalık header kontrollerine ek olarak yeni 15 intro/footer test grubu.
- 16 mevcut test komutu başarılı (tarihsel tarayıcı kanıtı doğrulayıcıları dahil). Eski intro metni ve çalışma zamanı yılı, onaylı UI değişiklikleri olduğundan tarihsel gövde karşılaştırmasında ayrı tutuldu; SEO, gövde ve özgün dosya/görsel bütünlük kontrolleri korunur.
- Gerçek Chromium tarayıcısında 18 TR/EN sayfa × 1440/1280/1024/768/390/360 = 108 görünüm; 108 footer dialog açma/Escape/odak dönüşü başarılı. Taşma yok. 1280 ve 1440 px footer linklerinin dikey merkez farkı 0 px.
- Son tarayıcı zaman ölçümü: kapanış başlangıcı 10011.4 ms; tamamlanması 631.8 ms. Odak hero, scroll kilidi ve inert kapalı. Gerçek klavye tuşları ve gösterge tıklaması denendi. Touch/wheel/trackpad yolları gerçek tarayıcı içinde sentetik olay akışlarıyla sınandı; fiziksel cihaz testi değildir.
- TR/EN, geri/ileri ve yenilemede tekrar intro yok. Yeni oturum intro gösteriyor. Uygulama scriptleri tamamen çıkarılmış tarayıcı önizlemesinde intro yok, site/reveal görünür, normal imleç ve scroll mevcut.
- Yerel gerçek Google ağı: kabul öncesinde 0 istek/çerez; kabulde ve tekrar kabulde 1 loader; geri çekmede 0 loader/çerez/istek. Son konsolda hata/uyarı yok.
- Son temiz production çıktı HTTP kontrolü: 119 başarılı. Geçici QA upload dosyası yok. Altı preflight grubu: 18 URL, JSON-LD, canonical/hreflang, CNAME/robots/RSS/404, 21 proje/42 iki dilli kart ve 67 görsel SHA-256 başarılı.

Kayıtlar: intro-tests.json, browser-results.json, browser-validation.json, suite-results.json, preflight-results.json, http-results.json ve screenshots/.

## Koruma, yayın ve sınırlar

CMS kayıtları, 67 kaynak görsel, .pages.yml, bağımlılıklar, header bileşeni/navigasyon JS ve üretim workflow değişmedi. Yeni blog yazısı yok. Yalnızca başarılı dal CI, PR CI ve fark incelemesi sonrası normal merge yapılır; gerçek Pages deploy ve canlı kontroller ayrıca izlenir. Mevcut RELEASE-PLAN ve normal revert kullanılabilir; force reset/push veya yeni harici yedek döngüsü yok.

Fiziksel telefon, Safari ve fiziksel trackpad test edilmedi. Reduced motion/arka plan/bozuk storage kontrolleri zamanlayıcılı çalışma zamanı testleriyle doğrulandı; işletim sistemi tercihi değiştirilmedi. No-JS kontrolü, tarayıcı motoru kapatılarak değil tüm uygulama scriptleri engellenerek yapıldı. Hosted CMS Save, GA4 DebugView ve saha Core Web Vitals bu revizyonda test edilmedi.
