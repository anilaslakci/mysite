# Portfolyo kabul denetimi, blog ve SEO altyapısı

## Kapsam ve mevcut içerik

Başlangıç `aaccc05e4465cab6b5dec6a11338384d657cdd4e`, dal `refactor/eleventy-cms-migration`. Çalışma alanı temizdi; uzak dal fetch/fast-forward kontrolünde yeni CMS değişikliği yoktu.

21 proje, 42 TR/EN içerik, 67 özgün görsel ve sekiz URL korundu. Proje JSON'ları, kategori/medya arşivi ve portfolyo JS/CSS/şablonları değiştirilmedi. Portfolyo masaüstü ve mobil karşılaştırmaları birebir aynı. Ana sayfanın footer'ına yalnızca bir Blog bağlantısı eklendi; intro/animasyonlar korunuyor. Tarihsel HTML karşılaştırması yalnızca bu açıkça belirtilen bağlantı eklemesini istisna tutar; diğer içerik eşitliği devam eder.

Gerçek kullanıcı yazısı veya örnek yayın makalesi eklenmedi. `src/content/posts/` yalnızca `.gitkeep` içerir; gerçek blog doğru boş durumla açılır. Yerel QA örnekleri ignored `.migration-preview/` dizininde ve açıkça QA olarak işaretlidir.

## Mimari

```text
.pages.yml                              # portfolyo + Blog Yazıları + Blog Kategorileri
src/content/posts/<uuid>.md             # YAML front matter + Markdown gövde
src/content/blog-categories/<key>.json   # kullanıcının verdiği 7 uzmanlık kategorisi
assets/blog/                            # CMS yükleme hedefi, dosya geldikçe oluşur
lib/blog.mjs                            # veri, tarih, doğrulama, tek yayın filtresi
lib/blog-feeds.mjs                      # aynı koleksiyondan sitemap/RSS
lib/site.mjs                            # domain, yazar, saat dilimi ve mevcut URL kaynakları
src/_data/blog.mjs                      # Eleventy global veri yükleyici
src/_includes/blog/{base,card}.njk
src/blog/{index,post}.njk               # /blog/ ve /blog/<slug>/
src/{sitemap,feed,robots,404}.njk
src/assets/css/blog.css                 # lacivert/altın/serif başlıklar
src/assets/js/blog.js                   # hafif kategori filtresi, JS olmadan tüm yazılar okunur
scripts/validate-site.mjs               # build + test boyunca tek saat
scripts/test-blog{,-output,-browser-evidence}.mjs
scripts/test-workflow-safety.mjs
.github/workflows/validate.yml          # yalnızca read-only CI, deploy yok
ops/github-actions/publish.yml.example  # ETKİN DEĞİL, sonraki canlı geçiş taslağı
```

Yeni framework yok. Kilitte zaten bulunan `js-yaml` ve `markdown-it`, doğrudan kullanılan API'lerini sürdürülebilir kılmak için mevcut sürümleriyle açık bağımlılık olarak tanımlandı; paket kümesine yeni bir kütüphane eklenmedi. Kilit dosyası güncellendi.

## Pages CMS alanları

Blog Yazıları `yaml-frontmatter` formatında Markdown dosyaları kullanır. Dosya adı gizli, salt okunur, resmî UUID varsayılanıyla üretilen `uid` üzerinden `{fields.uid}.md` olur. Başlık veya slug dosya adını değiştirmez.

| Alan | Davranış |
| --- | --- |
| `uid` | Otomatik UUID; manuel değişim/yeniden üretme kapalı |
| `title` | Sayfadaki gerçek H1 başlığı |
| `slug` | İlk oluştururken elle belirlenen kalıcı URL; başlık değişince değişmez |
| `seoTitle`, `description` | İsteğe bağlı; boşsa başlık/kısa özet |
| `summary` | Liste ve paylaşım özeti |
| `body` | Markdown rich-text/source editörü; H2/H3, listeler, tablo, kod, görsel |
| `cover`, `coverAlt` | Kapak isteğe bağlı; varsa alt metin zorunlu |
| `category` | Ayrı CMS kategori koleksiyonuna referans |
| `tags` | Düzenlenebilir etiket listesi |
| `status` | Varsayılan draft; published, yayın tarihine göre yayına uygunluk belirtir |
| `publishAt` | Türkiye saatiyle tarih+saat; published için gerekli |
| `updatedAt` | İsteğe bağlı gerçek içerik düzenleme tarihi; her build'de bugüne çevrilmez |
| `featured` | Listede öne çıkan rozeti; tarih sırası korunur |
| `related` | UUID referansları; yalnızca yayındaki hedefler gösterilir, boşsa aynı kategoriden en fazla 3 öneri |
| `locale`, `translationKey` | Şimdilik gizli TR değeri ve gelecekteki eşdeğer dil kaydı için UUID |

Blog Kategorileri: E-Ticaret, Pazaryeri Yönetimi, T-Soft, ERP ve Entegrasyon, Python ve Otomasyon, Veri Analizi, Teknik Rehberler. Ad, kalıcı kod, sıra ve arşiv durumu CMS'de düzenlenebilir. Bilinmeyen referans reddedilir; yayımlanan yazının arşivli kategoriye bağlanması reddedilir. Kullanılan kodu değiştirmeden/silmeden önce referanslar taşınmalıdır. Yerleşik aktif kategori seçici filtresi varmış gibi bir seçenek eklenmedi.

Manuel slug değişikliği mümkündür ama mevcut dış bağlantılar için otomatik redirect oluşturulmaz. Yayımlanmış slug yönlendirme planı olmadan değiştirilmemelidir. Çift/geçersiz slug ve UUID/dosya adı uyuşmazlığı build hatası verir. CMS'de kayıt öncesi global uniqueness kilidi olduğu iddia edilmez.

## Yayın kuralı ve zaman

Tek koşul: `status === 'published' && publishAt <= buildTime`. Aynı sonuç HTML sayfalarını, liste/kategori filtrelerini, ilgili yazıları, sitemap ve RSS'i besler. Taslak/gelecek yazı yalnızca listede gizlenmez; kendi HTML dosyası da üretilmez. Durumu draft yapılan yazının eski çıktısı temiz build'de kaldırılır.

`SITE_BUILD_TIME` açık UTC/offset içeren ISO tarihtir. `npm test` tek saati dondurup build ve çıktı testlerine aktarır. Eleventy bir build'de blog veri kümesini tek saatte değerlendirir. CMS'nin saat dilimsiz `yyyy-MM-dd'T'HH:mm` değeri açıkça Europe/Istanbul olarak çözülür; tarayıcı/işletim sistemi saat dilimine bırakılmaz. Örnek `2027-01-15T09:00` ve `2027-01-15T06:00:00Z` aynı andır. Açık ofsetler ve milisaniyeli ISO değerler de desteklenir; takvim dışı tarihler reddedilir.

Günlük kontrol taslağı UTC 06.00 = güncel Türkiye saati 09.00. GitHub cron gecikebilir. Günlük kontrol, her olası yayın dakikasında build garantisi vermez; tarih geldikten sonraki ilk başarılı build yayımlar. Zamanlanmış workflow varsayılan dalda olmalıdır; geliştirme dalında günlük yayın çalıştığı iddia edilmez.

Şu anda etkin tek yeni workflow read-only doğrulamadır. Yayın dosyası `ops/` altında `.example` olarak durur. Main/domain kapısı ve ayrıca `ENABLE_SITE_DEPLOY=true` onayı gerektirir. Pages kaynağı değiştirilmedi. Ayrıntılı aktivasyon/geri dönüş adımları [ops rehberinde](../../ops/github-actions/README.md).

## Teknik SEO ve arayüz

- Blog listesi/detayında dinamik title, description, canonical, OG ve Twitter etiketleri. Kapak varsa paylaşım alt metni ve büyük kart; yoksa mevcut favicon ile küçük kart.
- Yalnızca gerçekten gösterilen yazı bilgileriyle BlogPosting ve BreadcrumbList. Başlık, tarih, yazar, kategori, kapak ve etiketler aynı kaynaktan gelir. Güvenli JSON serileştirme kullanılır.
- `/sitemap.xml` mevcut sekiz URL, blog listesi ve yalnızca yayımlanmış yazılardan oluşur. 404 sitemap'te yoktur.
- `/feed.xml` RSS 2.0, kararlı UUID guid ve gerçek yayın tarihleri kullanır; taslak/gelecek kayıtları içermez.
- `lastmod` yayın/düzenleme tarihi ve ilgili kaynakların son Git commit tarihinden gelir. Build saati lastmod yapılmaz. Tam Git geçmişi CI checkout'unda alınır. Uncommitted yerel editin Git zamanı henüz yoksa açık `updatedAt` kullanılabilir; commit sonrası gerçek kaynak zamanı hesaba katılır.
- `lastmod`, sitemap veya RSS yalnızca build saati ilerledi diye güncellenmez. Blog kaynak koleksiyonuna gerçek bir Git değişikliği gelmesi liste güncelleme tarihine yansıyabilir; bu periyodik saat damgası değildir.
- Mevcut sekiz sayfanın title/description/canonical/OG/Twitter/JSON-LD bilgileri korunur; mevcut geçerli başlıkları gereksiz yere yeniden yazılmadı.
- 404 sayfası `noindex, follow`; yerel HTTP'de eksik rota 404 durumuyla bu içeriği gösterir. Gerçek GitHub Pages 404 yayını bu görevde canlı ortamda denenmedi.
- Robots sitemap'i doğru özel domaine bağlar. CMS kaynakları ve testler web çıktısına alınmaz. Açık GitHub deposundaki taslak kaynakların gizli olduğu iddia edilmez.
- Masaüstü/tablet/mobil 3/2/1 sütun; dar okunabilir yazı genişliği, tek H1, H2/H3 içeriği, skip link, klavye erişimi, filtre durum bildirimi, yatay taşmayan kod/tablo ve görsel alt metinleri. Ağır JS/animasyon yok.
- Ham HTML/script Markdown'da çalıştırılmaz; metin olarak kaçırılır. Yerel görsellerin yolu, varlığı, imzası ve alt metni kontrol edilir. Tam H1 gövdesi yerine H2/H3 kullanılmalıdır.

## Test sonuçları

| Grup | Sonuç |
| --- | --- |
| `npm test` | Temiz Eleventy build; portfolyo ve tüm blog çıktı/SEO/dahili bağlantı testleri başarılı |
| Blog senaryoları | 14 grup geçti; yeni kayıt/düzenleme, önce/tam an/sonra yayın, taslak, ileri tarih, yayından kaldırma, temiz çıktı, saat dilimi, kararlı lastmod/RSS, kategori/etiket/görsel/SEO |
| Olumsuz blog testleri | 16 geçersiz durum beklendiği gibi reddedildi: slug/UUID, tarih/durum, görsel/alt metin, kategori/related, H1, yanlış locale ve yayımlanmayan dahili bağlantı |
| Portfolyo esneklik | 14 grup başarılı |
| Portfolyo UUID/arşiv/medya | 12 grup + 8 beklenen hatalı build; 4 paralel worker/10.000 UUID, gözlenen çakışma yok |
| Yerel CMS benzeri düzenleme | 6 düzenleme/build/geri alma kontrolü başarılı; gerçek Save testi değildir |
| Tarihsel kontroller | 24 çıktı + 9 kayıt kontrolü; 84 kayıpsız kart/modal ve 67 özgün görsel hash'i başarılı |
| Pages CMS yapılandırma | Resmî upstream ConfigSchema kabul etti, 2 bozuk seçenek/tür reddedildi |
| HTTP | 103 kontrol; yeni uçlar, eski URL'ler, medya ve eksik sayfa 404 başarılı |
| Gerçek yerel tarayıcı | Masaüstü/tablet/mobil liste/detay, 2→1 kategori filtresi, ilgili yazılar, yüklenen kapak/gövde görseli, JSON-LD, boş durum ve home Blog bağlantısı başarılı; konsolda hata/uyarı yok |
| Portfolyo görsel regresyonu | Masaüstü/mobil iki çift birebir eşit; 42 TR/EN modal açma/kapama başarılı |
| Workflow güvenliği | Aktif CI read-only; deploy şablonu aktif klasör dışında ve main/onay bayrağı kapılı |

QA yazıları yerel test başlıklarıyla açıkça ayırt edilir. Üretim koleksiyonuna kopyalanmadı. Test komutları gerçek mevcut içerikleri sabit tarihsel metne zorlamaz; tarihsel karşılaştırmalar ayrı `test:migration` komutundadır. Önceki manifest ve kanıtlar korundu; yeni sonuçlar phase-6 altında.

Şema doğrulayıcısının Node TypeScript uyarısı test başarısızlığı değildir. İlk tarayıcı denemesinde navigasyon tamamlanmadan JSON-LD okunmuştu; detay sayfası görünürlük kontrolü ve klavye navigasyonuyla tekrar test edildi, bütün kayıtlı sonuçlar başarılıdır. Çözülmemiş yerel ürün testi hatası yoktur. Harici SEO hizmetinden rich result kabulü veya gerçek CMS Save doğrulaması yapılmış sayılmaz.

## Gerçek Pages CMS kabul durumu

Bu oturumda Pages CMS `/sign-in` ekranında kaldı. Yeni yetki verilmedi; kullanıcı adına gerçek yazı/proje oluşturulmadı, kaydedilmedi veya silinmedi. Önceki kullanıcı başlık Save/geri alma testi geçmişte doğrulanmıştı. Yeni UUID ve yeni Blog Yazıları editörünün create/open/update/save işlemleri bu oturumda **doğrulanmadı**.

Kullanıcı kabulü için: geliştirme dalını seçin, eski projeyi açın; yeni blog yazısını taslak olarak oluşturup UID/dosya adını kontrol edin; Markdown gövde, iki tarih, kategori/etiket, kapak/alt metin ve related alanlarını kaydedip tekrar açın. Sonra Git commit'lerini yerelde güvenle alıp `npm test`, `npm run test:blog` ve portfolyo kontrollerini çalıştırın. Bu görev kapsamında kullanıcı adına kayıt yapılmayacaktır.

## Yedek ve yayın sınırı

`.migration-backups/phase-6/baseline-aaccc05.zip` SHA-256: `6dc35ae7658fb69c4152bc86489db788fff46ea14a760497052ffeeffab303dc`. `.migration-backups/phase-6/before-blog.bundle` tam geçmişi içerir; bundle verify geçti. Önceki yedekler korunur. Aynı disk yedekleri ayrı cihaz yedeği yerine geçmez.

Push öncesi API kaydı: main `63c3f30`, Pages `legacy/main/`, domain `anilaslakci.com.tr`, HTTPS açık; webhook yok, mevcut tek workflow GitHub Pages yerleşik workflow'u. Yeni CI yalnızca geliştirme dalında build/test yapar. Son push/CI sonucu final kullanıcı raporunda ve yerel post-push doğrulama kaydında belirtilir. Main, DNS veya Pages kaynağını değiştirmek bu görevin parçası değildir.

Geri dönüş yeni geliştirme commit'ini `git revert <commit>` ile geri almaktır; force reset gerekmez. Bu geri dönüş canlı ayar değiştirmez. Üretim aktivasyonu için ayrıca onay gereklidir.

## TR/EN hazırlığı ve açık sınırlar

Bugünkü blog yalnızca Türkçe üretir. `locale` ve kararlı `translationKey`, ileride `/en/blog/` eşleşmesi içindir; İngilizce içerik otomatik çevrilmez. İngilizce locale yanlışlıkla bu koleksiyonda yayımlanmak istenirse açık hata alınır. Sonraki aşamada dil başına URL, bağımsız profesyonel metin, karşılıklı hreflang, kendi URL'sine canonical ve yalnızca mevcut eşdeğere dil geçişi eklenecek. Portfolyonun mevcut TR/EN davranışı değişmedi; tüm site çevrilmedi.

Canlıya geçmeden önce gerçek CMS kabulü, gerçek ilk yazının editoryal incelemesi, tam yayın çıktısı ve link kontrolü, main/Pages geçiş onayı, gate/cron aktivasyonu ve canlı 404/SEO kontrolü gerekir. Örnek QA içeriği yayımlanmayacak. Görsel optimizasyonu, sayfalama ve kapsamlı ekran okuyucu denetimi bu görevde yapılmış sayılmaz; içerik hacmi büyürse ölçümle ele alınabilir.

Resmî kaynaklar: [Pages CMS rich-text](https://pagescms.org/docs/configuration/fields/rich-text/), [date](https://pagescms.org/docs/configuration/fields/date/), [editors](https://pagescms.org/docs/configuration/content/editors/), [GitHub schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule), [Google Article](https://developers.google.com/search/docs/appearance/structured-data/article), [Google sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

## Temiz GitHub çalışma ortamı düzeltmesi

İlk GitHub CI çalışmasında npm test geçti; blog senaryo testi, Git tarafından izlenmeyen .migration-preview üst klasörü temiz runner üzerinde bulunmadığından ENOENT ile durdu. Test başlangıcına üst klasörü güvenli oluşturma adımı eklendi. Yerelde var olan klasöre örtük bağımlılık kaldırıldı; canlı yayın veya içerik hatası değildi. Sonraki CI sonucu kullanıcı teslimatında belirtilir.
