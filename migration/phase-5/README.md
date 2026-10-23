# Portfolyo CMS tamamlama ve gelecek altyapı hazırlığı

## Sonuç ve kapsam

Portfolyonun UUID uyumluluğu, kategori arşivi, medya metadata arşivi ve kalıcı doğrulamaları uygulandı. Yerel testler başarılı. Gerçek hosted Pages CMS'de yeni kayıt/Save ve yeni alanların kabul testi **açık**: bu çalışmanın tarayıcısı giriş ekranında kaldı; hesap yetkisi verilmedi, kullanıcı adına kayıt oluşturulmadı.

Başlangıç commit'i `fb091da8e3b7a41e3e50322c9e3e402e557f1bae`. Uzak geliştirme dalı `13f0fc4` idi; fetch ve fast-forward denetimi yeni CMS commit'i olmadığını gösterdi. Çalışma alanı başlangıçta temizdi. Mevcut 21 proje dosyası ve yedi kategori dosyası değiştirilmedi. Özgün 67 görselin SHA-256 kontrolü geçti. Sekiz URL, tasarım, iki dilde içerik ve SEO bilgileri korundu.

Yeni bağımlılık, blog, İngilizce site, yayın workflow'u, DNS/Pages ayarı veya main değişikliği yok. Push yalnızca ayrı son güvenlik kontrolünden sonra geliştirme dalına yapılabilir; gerçek aktarım sonucu son kullanıcı raporunda verilir.

## Son dosya mimarisi

```text
.pages.yml                             # Projeler / Kategoriler / Görsel arşivi
src/content/projects/1.json..21.json    # eski kayıtlar aynı dosya ve içerikle
src/content/projects/<uuid>.json       # yeni kayıtların desteklenen biçimi; bu revizyonda gerçek yeni proje eklenmedi
src/content/categories/<key>.json      # archived isteğe bağlı, varsayılan false
src/content/media/<uuid>.json          # 67 özgün görsel için yeni metadata kaydı
assets/portfolio/                      # özgün dosyalar, aynı yollar ve baytlar
lib/portfolio.mjs                      # hibrit kimlik, sıralama, referans doğrulaması
lib/portfolio-media.mjs                # arşiv metadata ve fiziksel dosya kontrolü
src/_includes/portfolio/card.njk       # sayı/UUID için güvenli dataset tabanlı modal çağrısı
scripts/test-portfolio-runtime.mjs     # günlük veri/SEO/URL kontrolleri
scripts/test-portfolio-completion.mjs  # izole UUID/kategori/medya testleri
scripts/check-project-media.mjs        # salt okunur referans/arşiv denetimi
migration/phase-5/                     # rapor, test kanıtları ve resmî UUID kaynak örneği
migration/phase-5/FUTURE-ARCHITECTURE.md # yalnızca blog/i18n planı
```

CMS/sunucu kaynakları çıktı klasörüne kopyalanmaz. Eleventy kategori/proje/medya kayıtlarını izler. Yayın URL'si özel domain köküdür; `/mysite/` eklenmez.

## Otomatik proje kimliği

Yeni alan `uid`, resmî Pages CMS `uuid` alanıdır. `default` verilmediği için Pages CMS'nin `crypto.randomUUID()` varsayılanı kullanılır. Alan gizli ve readonly; yeniden üretme düğmesi kapalı (`editable: false`, `generate: false`). Yeni dosya adı `{fields.uid}.json`; dosya adı girişi gizli, rename kapalı. Kullanıcı kimlik/sıra hesabı yapmaz.

Eski `id` alanı sayı olarak saklanır, gizli/readonly olur ve yeni kayıt için zorunlu değildir. Eski kaydı CMS'de kaydederken otomatik `uid` eklense bile görünürlük/modal kimliği eski `id` olarak kalır. Örneğin `modal-tr-1` ve `modal-en-1` değişmez. Yeni kayıt `uid` kullanır. Loader şablona tek bir çözülmüş kimlik verir; `openProject(this.dataset.pid)` iki biçimi de güvenle taşır. UUID inline JS sayısı olarak yorumlanmaz.

Dosya adı kimlikle eşleşmeli; eski sayı ve yeni UUID biçimi doğrulanır. İki kayıtta aynı UUID, UID biçim hatası, legacy kimlik değişikliği veya dosya adı uyuşmazlığı hata verir. Sıralama kimlikten bağımsızdır: küçük sıra önce, boş/null/boş string sonda; eşit sırada sayısal kimlikler kendi aralarında sayısal, UUID'ler sabit alfabetik sıra ile dizilir. Sayısal eski kimlikler eşit sırada UUID'lerden önce gelir.

Resmî UUID varsayılanının dört paralel worker'da 2.500'er örneği test edildi: toplam 10.000 UUID, gözlenen çakışma yok. Bu, çakışmanın matematiksel olarak imkânsız olduğu veya gerçek CMS'de eşzamanlı iki Save yapıldığı anlamına gelmez. Üretim yöntemi merkezi sayaç/son kimlik sorgusu kullanmaz; eşzamanlı editörlerin aynı sırayı seçmesi kimlik üretimini etkilemez. Gerçek formda varsayılan üretim, eski kayıt Save ve yeni dosya adı kabulü ayrıca test edilmeli.

## Proje yönetimi ve veri bütünlüğü

Önceki aşamadaki oluşturma, düzenleme, silme, bağımsız sıra, arşiv/geri yayın, teknoloji listeleri, iki dil, galeri sırası ve bağlantı listeleri korundu. Proje sayısı sabit değil. Proje silinmesi kimlikleri yeniden numaralandırmaz ve görselleri silmez. Arşiv kaydı yayından çıkar; verisi korunur. Git geçmişi geri alma kaynağıdır.

İki dilde başlık ve kart özeti zorunlu; detay açıklamaları, teknoloji listeleri, galeri başlıkları ve bağlantılar isteğe bağlı. Galeriye eklenen her görselde iki dilde alt metin zorunlu. Eski güçlü vurgu ve kart/detay teknolojisi farkları korunur. Desteklenen güvenli inline HTML aynı kaldı; Markdown dönüşümü yapılmadı.

## Kategori arşivleme

Kategori koleksiyonuna `archived` kutusu eklendi. Eksik değer false kabul edilir. Kategori oluşturma, TR/EN adı, sıra ve renk düzenleme devam eder; boş renk güvenli turkuaz varsayılana döner.

Güvenli kural: **yalnızca hiçbir projenin kullanmadığı kategori arşivlenebilir.** Arşiv projeleri de referans sayılır. Önce bütün referansları başka aktif kategoriye taşıyın, sonra arşivleyin. Yeniden etkinleştirmek kutuyu kapatmaktır. Arşivli kategori filtrelere girmez; yeni projeye atanırsa derleme reddedilir. Kullanılan kategori silinir/anahtarı değiştirilirse veri sessizce başka kategoriye taşınmaz; açık referans/filename hatası oluşur. Mevcut projelerin dosyaları silinmez.

Resmî referans belgeleri ve upstream seçici/API kaynakları incelendi: `archived == false` gibi aktif kayıt filtresi bulunmadı. `.pages.yml` içine uydurma `filter` seçeneği konmadı. Seçenek etiketi TR/EN adını ve `arşiv` değerini gösterir; true olan seçilmemelidir. Yerleşik seçicide arşivli kategorinin hâlâ görünebilmesi teknik sınırdır; geçersiz kullanımı build engeller. Kullanılan kategorinin arşivlenmesini de reddetmek, eski/yeni kullanımı ayırt eden kırılgan tarihsel karşılaştırmalar gerektirmez.

## Medya arşivi ve silme güvenliği

Yeni `Görsel arşivi ve kayıtları` koleksiyonu fiziksel dosyadan ayrıdır. 67 dosya için UUID, kaynak yol, kısa ad ve archived metadata'sı oluşturuldu. Proje başına alt metinler metadata'ya taşınmadı; aynı görsel farklı bağlamlarda farklı alt metinle kullanılabilir.

- Arşiv kutusu yalnızca metadata işaretidir. Dosyayı taşımaz, silmez, yayın yolunu değiştirmez veya mevcut galerilerden çıkarmaz.
- Arşivli görsel yeniden kullanılabilir; kutu kapatılarak aktif yapılabilir. Arşivli dosyayı kullanmak kategori arşivindeki gibi bir build hatası değildir.
- Metadata koleksiyonunda silme ve dosya adı değiştirme kapalı. Gizli UUID otomatik üretilir.
- Yeni görsel doğrudan proje galerisinde yüklenebilir; sırf arşiv metadata'sı yok diye kayıt engellenmez. Daha sonra arşivlemek istenirse Görsel arşivi koleksiyonunda aynı dosya seçilerek bir kayıt oluşturulur. İki dosya veya iki arşiv kaydı üretmek gerekmez; aynı yol için çift metadata reddedilir.
- `npm run media:check` yayımlanan/arşiv projelerinin tamamını, kullanılan dosyaları, metadata arşiv durumunu ve henüz metadata kaydı olmayan galeri dosyalarını raporlar. Mevcut durumda 67 kayıt, 66 galeride kullanılan dosya, 0 eksik dosya, 0 kayıtsız galeri dosyası var. Kalan özgün dosya favicon kullanımıdır.
- Kayıtlı bir fiziksel dosya, unused/archived olsa bile kayıpsa build hata verir. Galeri referansı olan kayıtsız dosyanın eksikliği de reddedilir. Dosya imzası, yol geçişi ve uzantı denetlenir.

**Yerleşik Pages CMS Dosyalar ekranındaki fiziksel silme düğmesi bu yapılandırmayla kilitlenemez.** Medya `operations.delete` gibi desteklenmeyen seçenek eklenmedi. Kullanıcı fiziksel dosyayı silerse Git commit'i oluşabilir; sonraki build hatası bu commit'i geri almaz. Arşiv koleksiyonu güvenli günlük yol, referans denetimi hasarı yakalayan ikinci katmandır. Hiçbir özgün görsel silinmedi. Fiziksel temizlik komutu veya otomatik silme geliştirilmedi; yanlış silmede ilgili Git commit'i geri alınmalı.

## Test sonuçları

| Test | Sonuç |
| --- | --- |
| Günlük `npm test` | 21 proje, 7 aktif kullanılan kategori, sekiz URL, dinamik kart/modal/sayaç, SEO ve dahili referanslar başarılı |
| `test:completion` | 12 senaryo grubu başarılı; 4 paralel worker/10.000 UUID; 2 UUID projeyle 23 kayıt; legacy Save uyumluluk simülasyonu, sıra/arşiv/silme, kategori, medya metadata, upload baytları, iki dil ve bağlantılar |
| Olumsuz gerçek derlemeler | 8'i beklendiği gibi reddedildi: kimlik değişimi, arşivli kategori seçimi, kullanılan kategoriyi arşivleme/silme, kategori anahtarı değişimi, eksik kayıtlı görsel, çift medya metadata, güvensiz medya yolu |
| Önceki `test:flexibility` | 14 senaryo grubu başarılı; bu aşamada sayısal uyumluluğu da korur |
| `test:cms-edits` | 6 yerel düzenleme/upload kopyası/build/geri alma kontrolü başarılı |
| `test:migration` | 24 tarihsel çıktı + 9 kayıt kontrolü; 84 kayıpsız kart/modal karşılaştırması ve 67 SHA-256 başarılı |
| `test:cms-schema` | Resmî upstream ConfigSchema kabul etti; 2 geçersiz yapılandırma reddedildi |
| HTTP | 97 kontrol başarılı |
| Yeni tarayıcı oturumu | Masaüstü 1440×1000 ve mobil 390×844 görüntüleri eskiyle birebir aynı; 42 eski + 4 UUID modal, Enter/Escape, dil, 23 proje sayacı, yeni kategori filtresi, zoom ve yeni upload görseli başarılı; konsol hata/uyarı yok |

Görseller `loading=lazy` kullandığı için modalın açıldığı ilk anda alınan bazı gözlemlerde görseller henüz yüklenmemişti. Galeri görünür hale getirilip yükleme tamamlandıktan sonra bütün UUID galeri kontrolleri geçti; ilk gözlemler kanıtta ayrıca tutuldu. Bu, silinen/eksik dosya hatası olarak gizlenmedi. Yardımcı bir sonraki ekran görüntüsü alma denemesi başarısız oldu; önce alınmış ve doğrulanmış karşılaştırma dosyaları ile tarayıcı DOM/galeri kanıtları korunuyor. Resmî şema testindeki Node TypeScript uyarısı test başarısızlığı değildir.

`npm test` tarihsel 21 sayı/metin sabitlemesi yapmaz. `test:migration` ayrı ve bilinçli içerik değişiminden sonra tarihsel fark verebilir. Önceki manifestler ve phase-1..4 kanıtları değiştirilmedi; bu aşamanın yeni raporları phase-5 altındadır. Sentetik projeler gerçek projenin izole kopyalarıdır, üretim JSON'una yeni proje veya uydurma açıklama eklenmedi.

## Gerçek CMS kabul durumu ve kullanıcı adımları

Önceki başlık düzenleme/Save/geri alma kullanıcı tarafından yapılmış ve `13f0fc4` ile yerelde mevcut. Yeni arayüz için bu oturumda Pages CMS giriş istiyor; GitHub uygulama izni genişletilmedi ve giriş/Save yapılmadı. Şema ve yerel testler gerçek editör kabulünün yerine sayılmadı.

Geliştirme dalı gönderildikten sonra kullanıcı:
1. Pages CMS'ye giriş yapar; `anilaslakci/mysite` ve `refactor/eleventy-cms-migration` seçer.
2. Eski projeyi açıp kaydeder; eski dosya adı ve sayısal id'nin korunduğunu doğrular.
3. Yeni projede kimlik veya dosya adı girmeden iki dilde başlık/özet ve aktif kategori seçip kaydeder; UUID dosya adını doğrular. İki sekmede yeni kayıt testi ayrıca yapılır.
4. Boş/eşit sıra, arşiv/geri yayın, teknoloji/bağlantı ve proje silme/geri alma işlemlerini dener.
5. Kullanılmayan kategoriyi arşivler/geri açar. Arşivli kategori seçilmesinin yerel build'de reddedildiğini doğrular; bu testte main kullanılmaz.
6. Görsel yükler, iki alt metin girer, galeri sırasını değiştirir; görsel arşivi kaydı oluşturup arşivler/geri açar. Fiziksel silme düğmesini kullanmaz.
7. CMS commit'leri güvenli şekilde alınır, yerelde `npm test`, `test:completion` ve `media:check` çalıştırılır; test kayıtları uygun Git geri alma ile temizlenir.

Bu liste açık kabul testidir; yapılmış olarak işaretlenmedi. Test için canlı yayın veya main ile birleştirme gerekmez.

## Yedekler ve GitHub güvenliği

- `.migration-backups/phase-5/baseline-fb091da.zip`: bağımsız Git arşivi, SHA-256 `2a1d0fa91f9b79b8f8a129223ff5563e78acd3876ef4a8fba124a51eb3f720a4`.
- `.migration-backups/phase-5/projects/`: 21 proje için çalışma kopyası bayt yedeği.
- `.migration-backups/phase-5/before-completion.bundle`: `fb091da` dahil tam Git geçmişi; `git bundle verify` başarılı.
- Önceki yedekler silinmedi. Aynı disk yedeği olduğu, ayrı cihaz güvencesi olmadığı unutulmamalı.
- Yeni revizyon commit'ini `git revert <commit>` ile geri almak eski CMS kayıtlarını ve fb091da aşamasını korur. Force reset/push gerekmez.

Yetkili salt okunur API kontrolü: main `63c3f30`, Pages `legacy / main / /`, domain `anilaslakci.com.tr`, HTTPS zorunlu, repository webhook 0, yalnızca GitHub'ın `dynamic/pages/pages-build-deployment` workflow'u mevcut. Son dağıtım main `63c3f30` (2026-08-26). Geliştirme dalında özel workflow/deploy komutu yok. Push öncesinde uzak dal ve aynı güvenlik koşulları tekrar kontrol edilmeli; beklenmeyen değişiklikte push durmalıdır.

## Gelecek aşamalar

Blog ve İngilizce site **uygulanmadı**. Ayrı [mimari belge](FUTURE-ARCHITECTURE.md) Markdown/CMS yazı modeli, yayın durumu/tarih, tek build zamanı, İstanbul/UTC sınırları, sitemap/RSS/BlogPosting, `/en/`, eşdeğer sayfa anahtarı, canonical/hreflang ve eksik çeviri kurallarını tanımlar. Kaynaklardaki sabit metin bağımlılıkları dosya bazında listelendi.

Portfolyo veri modeli sonraki aşamalar için uygun; gerçek yeni CMS kabul testi tamamlanmadan portfolyonun tüm editör işlemleri ticari/üretim kabulünden geçmiş sayılmaz. Tek sayfada tüm kart/modal üretimi çok büyük portfolyolarda DOM maliyeti yaratır; sabit sayısal sınır kaldırılmış olması sınırsız performans garantisi değildir.

Resmî kaynaklar: [UUID](https://pagescms.org/docs/configuration/fields/uuid/), [dosya adı](https://pagescms.org/docs/configuration/content/filename/), [referans](https://pagescms.org/docs/configuration/fields/reference/), [medya](https://pagescms.org/docs/configuration/media/). Kaynak kod hash'leri `upstream-review.json` içinde.
