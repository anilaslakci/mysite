# Canlı site UX ve İngilizce revizyonu

Başlangıç: `782e82e574661c71778f9a045d07b9ac71b2eb56` (main). Revizyon dalı: `codex/site-ux-cohesion`.

## Değişiklikler

- Çerez bildirimi belge akışından çıkarılıp ekranın alt ortasına alındı. Masaüstünde en fazla 850 px; mobilde kenar ve güvenli alan boşlukları korunur. Kabul ve ret aynı görünürlükte. İlk intro açıkken bildirim gizlidir, Keşfet sonrasında görünür. Native ResizeObserver yalnızca belge sonunda panel yüksekliğine uygun alan ayırır; hero aşağı itilmez.
- Analytics izin/depoma mantığı ve 180 günlük süre korunur. Yalnızca TR/EN bildirim metinleri ve ölçüm yapmayan yerleşim gözlemcisi değişti. Yeni takip servisi veya bağımlılık yok.
- Dil bağlantısı aynı sekmede 15 saniyelik, hedef yola bağlı tek kullanımlık bir sessionStorage işareti bırakır. Hedef belge bu işareti hemen tüketir. Ayrı bir oturum kaydı, Keşfet ile tamamlanmış girişin yenileme ve geri/ileri işlemlerinde tekrarlanmasını önler. Yeni oturumun ilk giriş deneyimi korunur. Depolama engellendiğinde ana sayfa bağlantısına mevcut skipIntro parametresiyle güvenli geri dönüş uygulanır. SEO dil bağlantılarının kaynak adresleri değişmez.
- Ortak renk, font, köşe ve boşluk değişkenleri `site.css` içinde tanımlandı. Ana sayfanın mevcut değerleri korunur. Portfolyo ortak marka bileşeni, ana site bölüm bağlantıları, aktif Projeler durumu ve erişilebilir mobil menü kullanır. Kartlar, filtreler, istatistikler ve modallar aynı renk/kenar diliyle sadeleştirildi. CMS veri ve davranış katmanları değiştirilmedi.
- İngilizce sözlükteki 320 statik giriş incelendi; 50 giriş düzeltildi. E-commerce, ERP Integration, Operations Automation ve ROAS kullanımları tutarlı hale getirildi; American English yazımı uygulandı. Sayısal deneyim/başarı ifadeleri değişmedi. Ayrıntılı önce/sonra listesi `english-changes.json` içindedir. Proje ve blog kayıtları yeniden yazılmadı.
- Dil URL yardımcısındaki query ile fragment birlikte kullanıldığında fragmenti düşüren hata düzeltildi. Hizmet bölümüne ana sayfadan dönüş artık iki dilde de bölümü korur.

## Kanıtlar ve testler

- `npm test`: Eleventy, geçerli veri, dahili bağlantı, SEO, blog çıktı kontrolleri; 10 consent çalışma zamanı ve 8 yeni UX test grubu geçti.
- `suite-results.json`: mevcut 16 test komutunun tamamı başarılı. Tarihsel testler geçmiş geçiş kanıtlarını doğrular; yeni arayüz için sıfır görsel fark iddiası değildir.
- `preflight-results.json`: 6 yayın öncesi grup; 18 genel sayfa / 20 HTML, 21 proje, 42 iki dilli kart, 67 özgün görselin kaynak/çıktı SHA-256 kontrolü.
- `http-results.json`: yerel HTTP üzerinden 118 kontrol başarılı; özel kaynaklar çıktıdan erişilemiyor.
- `browser-results.json`: gerçek tarayıcıda 18 sayfa × 1440/768/390/320 genişlik = 72 görünüm. Yatay taşma yok; panel alt konumda ve ekran içinde. Ek 844×390 kontrolü yapıldı. 42 proje penceresi açıldı, odak kontrolleri yapıldı. İki dilde filtre, görsel büyütme, Escape, odağın geri gelmesi, mobil menü ve eşdeğer sayfa geçişleri denendi.
- Gerçek Google kütüphanesiyle yerel tanı sunucusunda izin yokken/ret sonrasında sıfır Google isteği ve sıfır Analytics çerezi; kabul sonrası bir loader ve page_view; tekrar kabulde ikinci loader yok; geri çekme sonrası yeni olay engellendi ve çerezler temizlendi. Tanı sunucusu ve düğmeleri yalnızca git dışındaki yerel araçlardır, dağıtılmaz.
- Panel gizlenmeden önce ve sonra hero üst konumu aynı kaldı. Kaydedilen kısa oturum CLS değerleri yaklaşık 0.0004 veya altında; bunlar Lighthouse puanı veya saha Core Web Vitals sonucu değildir.
- `browser-validation.json`: yeni tarayıcı kanıtları için 5 doğrulama grubu. Son kontrol oturumunda konsol hata/uyarısı yok.
- `screenshots/`: önce/sonra masaüstü ve mobil örnekleri. Tasarım revizyonu olduğundan piksel eşitliği beklenmez.

## Korunan alanlar ve yayın kapısı

`src/content`, 67 görsel, `.pages.yml`, bağımlılık dosyaları ve üretim `publish.yml` bu revizyonda değiştirilmedi. URL, canonical/hreflang, sitemap/RSS ve günlük 06.00 UTC zamanlaması korunur. Doğrulama workflow'una yalnızca revizyon dalı eklendi; üretim main koşulu gevşetilmedi.

Yerel kontroller sonrası revizyon dalı push edilir; başarılı CI ardından PR açılır, farklar ve PR CI incelenir, normal merge uygulanır. Gerçek Pages deploy sonucu ayrıca izlenir. Canlı HTTP, SEO, görsel SHA ve arayüz kontrolleri dağıtım sonrasında yapılır; yerel sonuçlar canlı sonucu yerine geçmez.

Geri dönüş gerekirse `ops/github-actions/RELEASE-PLAN.md` esas alınır: yeni dağıtımlar durdurulur, hatalı run iptal edilir, revizyonun merge commit'i sonraki CMS değişiklikleri gözetilerek normal revert ile geri alınır ve doğrulanmış sürüm dağıtılır. Force push/reset kullanılmaz. Mevcut release yedekleri korunur; yeni harici yedek döngüsü başlatılmaz.

## Açık sınırlar

GA4 DebugView veri teslimi, gerçek ekran okuyucu ve saha performans ölçümü bu çalışmada doğrulanmadı. Hosted Pages CMS içerik düzenleme testi yeniden yapılmadı; yapılandırma ve kayıtlar değişmedi. Canlı tarayıcı ağ/çerez incelemesi mevcut arayüzde sınırlı olduğundan canlıda kod bütünlüğü ve görünür davranış ayrıca kontrol edilir; yerel gerçek ağ kanıtı ayrı tutulur.
