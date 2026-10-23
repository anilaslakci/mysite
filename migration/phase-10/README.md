# GA4 Basic Consent Mode v2 — 23 Ekim 2026

Bu çalışma yalnızca refactor/eleventy-cms-migration dalındadır. Main, Pages kaynağı, DNS, domain, CMS içerikleri ve canlı site değiştirilmedi.

## Uygulama

GA4 kimliği G-NFEHG270L2 korundu. Dokuz kaynak şablondaki doğrudan Google etiketi ortak consent-head include ile değiştirildi. Bütün HTML çıktıları tek yerel analytics.js ve consent.css alır; footer tercihi localize dönüşümünden sonra doğru dilde eklenir. Eski analytics-service.js bağımsız ölçüm başlatmaz; yalnızca eski varlık yolu korunur.

Dört Consent Mode v2 izni her dokümanda başlangıçta denied. Google kaynağı, config veya event onaydan önce çalışmaz. Kabulde yalnızca analytics_storage granted; reklam depolaması, reklam kullanıcı verisi ve kişiselleştirme denied kalır. Google signals ve reklam kişiselleştirme sinyalleri ayrıca kapalıdır. Library onload sonrasında config tek kez çalışır; otomatik page_view korunur. Tekrarlanan kabul yeniden etiket/config oluşturmaz.

Reddet ve kabul eşit boyutta/kolay erişilebilir. Bildirim normal sayfa akışındadır, sabit overlay değildir; mobil menüyü örtmez. Kullanıcının açtığı tercihler native dialog, açık Tab döngüsü, Escape ve odağı çağıran düğmeye döndürme kullanır. TR/EN açıklamalar ve tercih içindeki kısa çerez açıklaması aynı uygulamayı anlatır; ayrı politika URL'si veya uydurma veri süreci eklenmedi.

Tercih, aynı origin üzerindeki TR/EN sayfalarda paylaşılan localStorage içinde version/analytics/at alanlarıyla en fazla 180 gün saklanır. Süresi dolmuş, bozuk veya erişilemeyen kayıt varsayılan kapalıya döner. Depolama engellenirse seçim o sayfada uygulanır, ziyaretler arası kalıcılık garanti edilemez. Başka sekmedeki ret ve bfcache dönüşü kontrol edilir.

Onay geri çekildiğinde ga-disable bayrağı hemen true olur, gtag kapısı yeni olayları reddeder, erişilebilir _ga/_gid/_gat çerezleri olası domain ve mevcut yol kapsamlarında silinir. Yüklü Google runtime'ına denied update yollamak consent-only ping doğurabileceğinden runtime sayfa yenilemeyle kaldırılır; yeni doküman dört denied varsayılanını kurar ve Google yüklemez. Geri çekme anından önce başlamış ağ isteği veya Google'a geçmişte ulaşmış veri geri alınamaz. JavaScript erişimi olmayan HttpOnly/başka host/yol çerezlerinin silinmesi garanti edilmez.

## Doğrulama

- Günlük npm test içine 10 gerçek controller-runtime grubu eklendi: ilk ziyaret, dört denied, onay öncesi olay/config engeli, kabul, tek yükleme/config, ret, dönüş/sona erme/bozuk değer, yükleme sırasında geri çekme, çerez temizliği, storage hatası, sekmeler arası ret, bfcache, çift yönlü Tab sınırı.
- Google isteklerinin engellenmediği yerel HTTP ortamında gerçek tarayıcı ve gerçek Google library kullanıldı. QA kodu yalnızca ignored yerel sunucuda çalışır, dağıtım çıktısına girmez.
- Kaynak PerformanceObserver, fetch ve sendBeacon gözlemleri ile DOM'a yazılan teşhis sonuçları incelendi. Kabul öncesi/ret/geri çekme sonrası Google isteği ve GA çerezi yok; kabul sonrası gerçek Google script, g/collect page_view ve _ga çerezleri görüldü. Aynı sayfada yeniden kabul yeni yükleme veya config doğurmadı. Bir fetch'in başlangıcı ve tamamlanması iki teşhis satırı olabilir; iki ayrı istek diye sayılmaz.
- browser-results.json ağ adreslerini yalnızca host/path ve olay adıyla tutar; client ID/çerez değerleri paylaşılmaz. Google arayüzü DebugView veri teslimi kontrol edilmedi; ağ gözlemiyle aynı şey olarak sunulmaz.
- 18 sayfa x 390/768/1440 ekran genişliği: 54 görünüm, tek footer kontrolü, doğru dil ve yatay taşma olmaması kontrol edildi. Mobil portfolyo modal/galeri/filtre ve ana menü ret altında çalıştı.
- İlk klavye denemesinde native dialog sınırında odak dışarı çıkabildi; açık Tab döngüsü eklendi. Yeni tarayıcı testi Shift+Tab → Kapat, Tab → checkbox, Escape → Tercihleri Yönet sonucunu doğruladı. Gerçek ekran okuyucu uygulaması çalıştırılmadı; rol/isim/açıklama erişilebilirlik ağacından doğrulandı.
- Tarihsel metin testleri yalnızca yeni data-cookie-preferences düğmesini görünür eski metin karşılaştırmasından çıkarır; özgün içerik, SEO ve görsel hash kontrolleri korunur. Eski i18n testi ID'yi doğrudan HTML'de arıyordu; artık aynı kimliğin tek consent controller'da olması ve HTML'de Google script bulunmaması doğrulanır. İlk başarısız suite kaydı suite-initial-results.json içinde, düzeltme sonrası suite-results.json ayrı tutulur.
- Güncel yayın öncesi test çıktısı phase-10/preflight-results.json; phase-9 tarihsel kanıtları değiştirilmedi. Son başarılı CI bağlantısı teslim mesajında verilir.

## Değişen katmanlar

Ortak head include, dokuz HTML kaynak şablonu, Eleventy footer dönüşümü (lib/consent.mjs), analytics.js / legacy stub, consent.css, TR/EN sözlüğündeki tek footer etiketi, günlük ve yayın öncesi testler. Portfolyo, blog kayıtları, UUID/çeviri ilişkileri ve medya dosyaları değiştirilmedi. Yeni bağımlılık eklenmedi; workflow veya yayın planı etkinleştirilmedi.

## Sonraki üretim adımı

Bu revizyon geliştirme dalına doğrulama CI'ı için push edilir. Üretim ayrı onaylı geçiştir; yeni commit'in güncel yedeği ve ikinci ortam bütünlük şartı da geçişten önce tekrar sağlanmalıdır. Önceki 5fc383d yedeği yeni değişiklikleri içermez.

Resmî teknik kaynaklar:
- https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic
- https://developers.google.com/tag-platform/security/guides/privacy
- https://developers.google.com/tag-platform/security/guides/consent-debugging
