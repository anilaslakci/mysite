# Altı konu, iki dil: Kasım 2026 – Ocak 2027 yayın paketi

## Yayın takvimi

Her satır bir Türkçe/İngilizce çiftidir. Toplam 12 bağımsız Markdown kaydı, kalıcı UUID ve slug bulunur. Saatler Europe/Istanbul, UTC+03:00; UTC karşılığı 07.00'dır.

| Tarih | Konu | TR kelime | EN kelime |
|---|---|---:|---:|
| 30 Kasım 2026 10.00 | Trafik var, satış yok: teşhis | 1272 | 1597 |
| 7 Aralık 2026 10.00 | Fiyatlandırma ve indirim | 1235 | 1566 |
| 14 Aralık 2026 10.00 | Merchant Center ürün sorunları | 1231 | 1498 |
| 21 Aralık 2026 10.00 | Stok senkronizasyonu | 1197 | 1422 |
| 28 Aralık 2026 10.00 | KPI ve yönetim paneli | 1268 | 1516 |
| 4 Ocak 2027 10.00 | Excel/Python/ERP otomasyon seçimi | 1337 | 1596 |

Kelime sayımı render edilmiş gövde, başlıklar, tablolar ve görsel açıklamaları üzerindendir; HTML, URL ve alt nitelikleri hariçtir. Toplam 16.735 kelimedir. Metinler kelime sayısını doldurmak için uzatılmamıştır. Türkçenin yapısı nedeniyle sözcük sayısı İngilizceyle eşitlenmemiştir; hesap ve ana kapsam aynı tutulmuştur.

2026 sonuna kadar haftalık düzen, 2027 için ayın ilk pazartesisi yaklaşımı uygulanır. Bu paket ocak yazısını içerir; şubat için yeni içerik üretilmez. Sonraki aylık hedef 1 Şubat 2027'dir. Günlük build kontrolünü aylığa çevirmek gerekmez: mevcut kontrol yalnızca zamanı gelen kayıtları üretir. Hiçbir workflow veya cron değiştirilmemiştir. GitHub cron kesin dakika garantisi sunmaz; ilk uygun başarılı derlemede görünürlük oluşur.

## CMS ve çeviri ilişkisi

- Kayıtlar mevcut `src/content/posts` koleksiyonunda; medya `assets/blog` içinde.
- `status: published` yayın onayı, `publishAt` ise zaman kapısıdır. Gelecek kayıt HTML/listeler/sitemap/RSS/ilgili yazılara girmez.
- Mevcut `yyyy-MM-dd'T'HH:mm:ss'+03:00'` CMS sözleşmesi korunur.
- İngilizce kayıt `translationOf` ile Türkçe kaydın UUID'sine bağlanır; gizli `translationKey` elle doldurulmaz.
- Her iki kaydın durum ve tarih alanı bağımsız düzenlenebilir. Karşılıklı hreflang yalnızca iki taraf da yayımlandığında üretilir.
- İngilizce gövdelerde İngilizce hizmet hedefleri kullanılır. Eski Türkçe yazıların hayali İngilizce karşılıkları yaratılmaz.
- Gövde içi makale linkleri sadece daha önce yayımlanacak içeriklere gider. İlgili yazı UUID'leri ortak görünürlük filtresine tabidir.
- Oturum açılmış Pages CMS'de bu kayıtları açma/kaydetme testi yapılmış sayılmaz. Koleksiyon, şema, UUID ve tarih uyumluluğu yerel olarak doğrulanır.

Tam başlıklar, SEO başlıkları, açıklamalar, slug'lar, UUID'ler, kaynaklar ve dosya boyutları `editorial-manifest.json` içindedir.

## Editoryal yaklaşım ve kaynaklar

Araştırma 3 Kasım 2026'da yapıldı. Keyword Planner/Search Console hacmi veya yerel Google sıralaması ölçülmedi; hacim ve trafik tahmini üretilmedi. Arama sonuçları kapsam karşılaştırması için kullanıldı. Rakiplerden metin, müşteri vakası veya doğrulanmamış istatistik alınmadı. Her yazıda en az dört SSS, somut bir hesap/karşılaştırma, sınırları belirtilmiş örnek ve ölçülü hizmet yönlendirmesi vardır.

| Konu | Özellikle eklenen değer | Birincil kaynak |
|---|---|---|
| Satış teşhisi | Ölçüm farkı ile satın alma engelini ayıran akış; 1.000/120/60/18 oturum örneği | Google GA4 e-ticaret ölçümü; Baymard ödeme araştırmaları |
| Fiyatlandırma | Markup/marj ayrımı, üç fiyat senaryosu ve katkı tabanı; net kâr iddiası yok | Shopify fiyatlandırma dokümanı |
| Merchant Center | Kaynak/sayfa/şema farkı; varyant, erişim ve işlenen sonuç ayrımı | Google ürün şartnamesi, uyuşmazlık ve Merchant API belgeleri |
| Stok | Aynı siparişte rezervasyon/sevk çift düşümünü gösteren tablo; tekrar ve kısmi işlem testleri | Shopify stok durumları |
| KPI | Sipariş anı ve iadeler sonrası gelir; farklı iade paydaları; gösterge sahibi ve karar | GA4 metrik ve e-ticaret olay belgeleri |
| Otomasyon | Bakım ve istisna dahil süre hesabı; önizleme/onay/uzlaştırma; Excel'i peşinen değersizleştirmez | Python CSV ve OWASP CSV Injection |

Resmî/araştırmacı kaynaklar:

- https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
- https://support.google.com/analytics/answer/13428834?hl=en
- https://support.google.com/analytics/answer/12313109?hl=en
- https://baymard.com/blog/reduce-cart-abandonment
- https://baymard.com/blog/checkout-flow-ux-optimization
- https://help.shopify.com/en/manual/products/details/product-pricing/determine-pricing
- https://support.google.com/merchants/answer/7052112?hl=en
- https://support.google.com/merchants/answer/9773429?hl=en
- https://developers.google.com/merchant/api/latest-updates
- https://help.shopify.com/en/manual/inventory-and-locations/fundamentals/inventory-states
- https://docs.python.org/3/library/csv.html
- https://community.owasp.org/attacks/CSV_Injection

Bazı Google yardım metinlerinde eski Content API tavsiyeleri hâlâ bulunuyor. Güncel resmî değişiklik günlüğü 18 Ağustos 2026 kullanım sonunu doğruladığı için yeni yazıda Merchant API esas alındı. Hesap onayı, görünürlük süresi ve kusursuz stok tutarlılığı için garanti verilmedi. Söz konusu kontrollerin yöntemi anlatıldı; gerçek bir müşteri hesabı denetlenmiş gibi sunulmadı.

Arama sonucu kapsam örnekleri (sıralama/otorite iddiası yok): Flatinium ve Adapte Dijital satış eksikliği rehberleri; KMK ve Startonal fiyat/indirim araçları. Genel neden listelerine karşılık bu pakette tekrar edilebilir hata tarifi, tutarlı payda, indirim-katkı farkı ve işletim sorumluluğu öne çıkarıldı. Mevcut sekiz makalenin formül/model anlatımı tekrar edilmek yerine ilgili yerlerde bağlandı.

## Görseller ve performans

Altı farklı, metinsiz kavramsal kapak (1200×675) ve TR/EN olarak 12 açıklayıcı şema/grafik (800×550) üretildi. 18 PNG'nin toplamı 494.376 bayt, en büyük PNG 39.113 bayttır. Her birinin düzenlenebilir SVG kaynağı vardır. Ticari logo, stok fotoğraf, slogan veya site imzası eklenmedi. Sayısal grafikteki değerler metin/tablolarda da bulunur. Yerelleştirilmiş alt metinler ve kısa açıklamalar eklendi.

Gövde PNG'lerinin gerçek width/height değerleri Markdown renderer'ından verilir. Böylece lazy yükleme öncesinde doğru oran ayrılır. Bu dar değişiklik görsel dosyalarını veya tasarımı değiştirmez; mevcut inline PNG'lere de gerçek boyut niteliği ekler. Yeni bağımlılık yoktur. Kapakların mevcut 16:9 CSS yerleşimi korunur.

## Koruma ve QA

Başlangıç main `486d163a18bd8b066fc8221206154c041274869c`. `preserved-files.json`, eski sekiz yazı dahil içerik/asset ağacındaki 205 dosyanın SHA-256 kaydını tutar. Metinde yalnızca CRLF/LF normalize edilir; görseller bayt düzeyindedir. Var olan hiçbir yazı, slug, yayın zamanı, proje veya görsel yeniden oluşturulmaz.

`npm run test:winter` bu pakete ait tarihsel kabul testidir; ileride bilinçli CMS düzenlemesini engellemek için günlük build zincirine bağlanmaz. Günlük dinamik blog, tarih ve çeviri testleri korunur. Testler sahte saatle yalnızca `.migration-preview` altına çıktı yazar; üretim `_site` klasörüne geleceği simüle eden dosya yazılmaz.

Test kapsamı: her çiftin 09.59.59/10.00 sınırı, 3 Kasım erken görünmezlik, 11 Ocak'ta yeni kayıt uydurulmaması; HTML/listeler/sitemap/RSS/ilgili yazılar; canonical/hreflang/x-default; JSON-LD; kaynak/görsel bütünlüğü; hesaplar; görsel boyutları; taslak çeviri. Canlı yazıya gövdeden link varken onu yayından kaldırma girişimi mevcut bozuk bağlantı korumasınca reddedilir; referanslar temizlenmeden sessizce 404 yayımlanmaz.

Chrome'da 390/768/1440 px için 36 makale görünümü, gerçek dil bağlantısı tıklamaları, kapak/inline yükleme, taşma ve konsol kontrolü yapılır. Kanıtlar `browser/` altında; bu fiziksel cihaz veya Safari testi değildir. Gerçek Pages CMS Save ve gelecekteki cron çalışması test edilmiş gibi raporlanmaz.

## Tamamlanan yerel sonuçlar

- `npm test`, `test:blog`, `test:i18n`, `test:cms-schema`, `test:workflow` başarılı. CMS tarih sözleşmesi 20 kayıtla geçerli.
- `test:winter`: 14 saat senaryosu ve taslak çeviri çıktısı dahil 15 izole Eleventy derlemesi; erken HTML/XML/link yok. Geçersiz yayından kaldırma mevcut bağlantı korumasıyla reddedildi.
- Önceki `test:november`: dokuz saat senaryosu da yeniden başarılı.
- 36 Chrome makale görünümü ve karşılıklı dil bağlantısı tıklaması başarılı; yatay taşma, yeni sayfa hatası ve onay öncesi Google isteği yok. Görsel ve SEO kontrolleri başarılı.
- 205 korunan dosya aynı; 21 proje, kayıtlı 67 özgün görsel, eksik dosya 0.
- Üretim `_site` derlemesi bugünün beş Türkçe yazısını içeriyor; yeni 12 kayıt yok. Gelecek simülasyonları yalnızca özel test klasörlerinde.
- GitHub CI ve gerçek Pages dağıtımı PR/Actions kayıtlarından, canlı sonuç ise dağıtım sonrasında ayrıca doğrulanır.
