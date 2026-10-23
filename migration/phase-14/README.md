# Gerçek sürüklenebilir giriş perdesi — yayın kanıtları

## Neden ve değişiklik
Eski sürümde pointermove/pointer capture yoktu; touch hareketi yalnızca kapanmayı tetikliyordu. Geç boyama kontrolü temiz ilk ziyareti de atlayabiliyordu. Cursor halkasının RAF döngüsü directEntry ile durduruluyor, halka görünür kalıyordu. Cursor doğrudan body altındadır; tespit edilen neden dönüştürülmüş ebeveyn değildir.

Tek TR/EN bileşeni korunur. Temiz / ve /en/ intro açar; aynı sekmede tamamlanmış giriş ve dil geçişi atlar. Pointer capture ile perde gerçek piksel hareketini takip eder; bırakıldığında gerçek yüksekliğin %36 eşiği uygulanır. Kısa hareket 300 ms geri döner; açılış 600 ms. Etkileşim 10 s sayacı iptal eder; görünmez sekmede sayaç durur. Ana içerik inert, bitişte odak hero üzerindedir; JS olmadan site açıktır.

Marka 650 ms, gösterge 180 ms gecikme +650 ms ile belirir. Altı deterministik CSS altın noktası transform/opacity kullanır. Hareket azaltma desteği korunur. Bunlar yükleme beklemesi değildir.

## Güncel doğrulama
- npm test: build, 21 proje, SEO/blog, TR/EN, consent (10 grup), navigation (8 grup), 18 header, intro (18 grup) geçti.
- suite-results.json: 16 paket geçti. Tarihsel browser-evidence paketleri geçmiş kanıt doğrulamasıdır; yeni fiziksel test sayılmaz.
- http-results.json: 119 kontrol; çıktı dosyaları bayt eşitliği ve özel dosya erişim engeli.
- preflight-results.json: 18 eşleşmiş URL, 20 HTML, 42 kart, 67 SHA-256, canonical/hreflang/JSON-LD/RSS.
- browser-results.json: kurulu Chrome headless, ayrı BrowserContext oturumları, gerçek tarayıcı otomasyon mouse girdileri (isTrusted=true), DOM dispatchEvent kullanılmadı. TR/EN basılı 100 px => -100 px, 400 px => -400 px; bırakmadan ölçüldü. Geri dönüş ve tamamlanma geçti. Cursor üç koordinatta 1 px altı hatayla takip etti. Otomatik kapanma başlangıcı 10032 ms.
- 1440/1280/768/390/360 px ekran görüntüleri. Mobil CDP touch emülasyonu, kısa -100 px, geri dönüş, uzun sürükleme ve doğal scroll geçti.
- Gerçek gösterge tıklaması, wheel, Enter, no-JS, reduced-motion ve onay öncesi Google isteği olmaması geçti.

## Sınırlar
Fiziksel telefon, iOS Safari ve gerçek trackpad donanımı test edilmedi. Headless Chrome emülasyonu fiziksel test değildir. Field LCP/CLS/INP ve GA DebugView ölçülmedi; performans skoru iddiası yoktur. Yeni bağımlılık, içerik kaydı, workflow veya domain değişikliği yoktur.

## Tekrar çalıştırma
scripts/test-drag-browser.mjs kurulu Playwright gerektirir; projeye bağımlılık eklenmez. PLAYWRIGHT_MODULE isteğe bağlı kurulu modül yoludur; TEST_BASE_URL varsayılan http://127.0.0.1:4180; TEST_EVIDENCE_DIR kanıt dizinidir. Yerel sunucu instrumentation içerebilir fakat etkileşim üretmez. Canlı test TEST_BASE_URL ile aynı senaryoları gerçek üretim belgesinde yürütür.

## Geri dönüş
Kritik hata halinde mevcut RELEASE-PLAN uygulanır; normal revert ile PR merge commit'i geri alınır. Force push/reset yapılmaz. Önceki üretim: 75919489a50d4b165a87a50cff94fbcf296a2c2a.
