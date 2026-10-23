# Header ve Blog navigasyonu revizyonu

Başlangıç main: `8570436e508e66caa66378ba74c3087fbbff8b95`. Dal: `codex/header-blog-navigation`.

## Uygulama

`src/_includes/shared/header.njk` ana sayfa, altı hizmet, portfolyo, blog liste/detay ve 404 için ortak header üretir. Mevcut wrapper dosyaları korunur. Menü sırası Hizmetler / Süreç / Hakkımda / Blog / İletişim; İngilizcesi mevcut çeviri katmanından gelir. Projeler CTA ve dil seçimi ayrı sağ alandadır. Blog ve portfolyonun aktif durumları aria-current ile belirtilir. Blog detayındaki gerçek çeviri eşleştirmesi ve eksik çeviri davranışı aynen kullanılır.

Masaüstü Grid sütunları `minmax(0,1fr) auto minmax(0,1fr)` şeklindedir; eşit dış sütunlar farklı logo/CTA genişliklerinin merkezi kaydırmasını önler. Hizalama için transform veya sabit ofset kullanılmaz. 1200 px altında mevcut menü kontrolü açılır navigasyonu yönetir. 650 px altında marka/menü ile CTA/dil satırları ayrılır. Masaüstü header 85 px; küçük mobilde 129 px ölçüldü. Ana sayfa bölüm bağlantıları aynı belge içindeki anchor davranışını korur.

TR/EN metin bağlantıları şeffaf zeminde, altın aktif dil ve sade ayraçla gösterilir; aria-current, odak görünümü ve en az 44 px dokunma yüksekliği korunur. Yeni JS veya bağımlılık eklenmedi. Blog headerı mevcut sitenin font ailelerini aynı Google Fonts sağlayıcısından yükler; blog içerik tasarımı değiştirilmez.

## Test kanıtları

- `npm test`: Eleventy, veri/SEO/dahili bağlantılar, 10 consent çalışma zamanı grubu, 8 dil/intro UX grubu ve yeni 18 sayfalık header sözleşmesi başarılı.
- `suite-results.json`: 16 mevcut test komutu başarılı; bu liste tarihsel tarayıcı kanıtı doğrulamalarını da içerir.
- `browser-results.json`: 18 sayfa × 1440, 1280, 1024, 768, 390, 360 px = 108 gerçek tarayıcı görünümü. Masaüstü kullanılabilir viewport merkezine en büyük menü sapması 0.0078125 px. Taşma/üst üste binme yok. 54 mobil menü açma/Escape kontrolünde Blog görünür. Mobil Blog tıklama, aktif durum, EN eşdeğer ve Projeler geçişi çalışıyor.
- İlk oturumda intro var; dil değişimi, geri/ileri ve yenilemede yok. Mevcut tek kullanımlık sessionStorage uygulaması değiştirilmedi.
- Yerel tanı sunucusunda ilk ziyaret ve ret sonrası Google isteği/çerezi yok; kabulde tek loader, tekrar kabulde ikinci loader yok; geri çekmede loader ve Analytics çerezleri temizleniyor. Son tarayıcı konsolunda hata/uyarı yok. Tanı sunucusu ve overlay dağıtılmaz.
- `http-results.json`: 118 yerel HTTP kontrolü başarılı. `preflight-results.json`: SEO, JSON-LD, 18 URL, CNAME, robots/RSS/404 ve 67 özgün görsel SHA-256 kontrolü başarılı.
- Blog testleri: Markdown oluşturma/düzenleme, kategori/etiket, ilgili yazılar, SEO/BlogPosting, sitemap/RSS, taslak/gelecek tarih, tam yayın sınırı/İstanbul saati ve TR/EN referans eşleştirme izole kayıtlarda doğrulandı. Gerçek yazı oluşturulmadı; hosted Pages CMS Save bu revizyonda yeniden denenmedi.

İlk çalıştırmada iki kontrol durdu: bilinçli Blog menü eklemesi eski tüm-görünür-metin karşılaştırmasına takıldı; başlık dışındaki gövde/SEO karşılaştırması korunup yeni header sözleşmesi eklendi. Blog kelimesi iki dilde aynı olduğundan açık invariant listesine eklendi. Üretim workflow testi yerel açık onay ortam değişkeni olmadan beklendiği gibi reddetti; kullanıcının yayın onayı kapsamında yerel ENABLE_SITE_DEPLOY=true ile tekrar çalıştırıldı. Uzak workflow veya dağıtım kapısı değiştirilmedi. Son çalışmada başarısız test yok.

## Koruma ve yayın

CMS kayıtları/.pages.yml, 21 proje, 67 görsel, Analytics ve navigasyon JS, consent CSS, bağımlılıklar, URL/SEO model ve üretim workflow değişmedi. Yeni makale yok. Sadece PR ve başarılı CI sonrası normal merge/yayın yapılır. Gerçek deploy ve canlı kontroller yerel sonuçlardan ayrı izlenir. Geri dönüş mevcut RELEASE-PLAN ve normal revert ile yapılır; force reset/push veya yeni harici yedek döngüsü yok.

Lighthouse/saha Core Web Vitals, gerçek ekran okuyucu ve GA4 DebugView veri teslimi ölçülmedi. Canlı tarayıcı ağ/çerez ayrıntı erişimi sınırlıysa yerel gerçek ağ kanıtı ile canlı dosya SHA doğrulaması ayrı raporlanır.
