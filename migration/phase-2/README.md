# İkinci aşama: Eleventy altyapısı ve kayıpsız şablon geçişi

Dal: `refactor/eleventy-cms-migration`. Başlangıç commit'i: `870bfc5`.
Çalışma başlangıcında dal doğrulandı ve çalışma alanı temizdi.
Eleventy'nin npm `latest` etiketi ve [resmî belgeleri](https://www.11ty.dev/docs/) 3.1.7 sürümünü gösterdi; tam sürüm ve bağımlılık ağacı kilitlendi. Alpha sürüm kullanılmadı.

## Kaynak ve çıktı sözleşmesi

```text
eleventy.config.mjs            src → _site, alan adı kökünden yayın
package.json / package-lock.json
src/
  index.njk                   Ana sayfa, mevcut HTML içerikleri
  portfolyo/index.njk          21 projenin mevcut TR/EN HTML'i
  <altı-hizmet>/index.njk      Hizmete özel head/hero/article/related blokları
  _includes/
    layouts/service.njk       Ortak hizmet belge ve yerleşim iskeleti
    services/header.njk       Ortak navigasyon
    services/sidebar.njk      Ortak hizmet bağlantıları
    services/cta.njk           Ortak iletişim çağrısı
    services/footer.njk        Ortak alt bilgi
  assets/
    css/home-1.css             Ana sayfanın ilk stil bloğu
    css/home-2.css             Ana sayfanın ikinci normal stil bloğu
    css/home-3.css             Ana sayfanın üçüncü normal stil bloğu
    css/portfolio-1.css        Portfolyo stilleri
    css/services.css           Altı hizmetin birebir ortak stilleri
    js/analytics.js            Ana sayfa/portfolyo ölçüm başlangıcı
    js/analytics-service.js    Hizmetlerdeki mevcut ölçüm başlangıcı
    js/home-1.js               Ana sayfanın mevcut etkileşim kodu
    js/portfolio-1.js          Portfolyonun mevcut etkileşim kodu
assets/                       Mevcut, değişmeyen medya dosyaları
_site/                        Üretilen ve Git'te izlenmeyen yayın paketi
scripts/                      Derleme temizliği ve regresyon kontrolleri
migration/phase-1/            Önceki aşamanın değişmeyen koruma kayıtları
migration/phase-2/            Bu aşamanın karşılaştırma ve test kanıtları
```

Kaynak sayfalar bundan sonra `src/` altında düzenlenir. Kök dizindeki sekiz özgün HTML dosyası bu aşamada bilerek değiştirilmedi/silinmedi; yerel regresyon tabanıdır, Eleventy bunları sayfa kaynağı olarak kullanmaz. Mevcut yayın yapısına dokunulmadığı için bu ayrım özellikle önemlidir. Aynı içeriği iki yerde güncellemeyin.

Görseller mevcut `assets/` yolunda tek kaynak olarak kalır. Bu klasör ve `src/assets/` içindeki yeni CSS/JS, çıktıdaki `/assets/` yoluna açık passthrough kurallarıyla kopyalanır. `CNAME`, robots, sitemap ve dört favicon dosyası kökten çıktıya bayt düzeyinde aynı kopyalanır. Migration kayıtları, yedekler, kaynak şablonları ve node_modules çıktıya alınmaz.

Sekiz sayfa açık permalink kullanır: `/`, `/portfolyo/`, `/pazaryeri-yonetimi/`, `/erp-entegrasyonu/`, `/reklam-kampanya-yonetimi/`, `/e-ticaret-sitesi-yonetimi/`, `/veri-analizi-raporlama/`, `/operasyon-otomasyon/`. Hiçbirine `/mysite/` öneki eklenmez.

## Kurulum ve kullanım

Node.js 22 veya üzeri gerekir; bu çalışma Node.js 24.16.0 ile doğrulandı. Tek doğrudan geliştirme bağımlılığı `@11ty/eleventy@3.1.7`'dir. Tarayıcı framework'ü, CMS, blog veya görsel dönüştürme bağımlılığı eklenmedi.

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run build
npm.cmd run dev
```

`build`, önce yalnızca doğrulanan `_site/` klasörünü temizler, sonra Eleventy'yi çalıştırır. `dev`, Eleventy'nin izleme ve yerel sunucusunu `http://localhost:8080/` üzerinde başlatır. `_site/` elle düzenlenmez, commit edilmez. `node_modules/` da izlenmez. GitHub'a dağıtım otomasyonu eklenmedi.

CSS bloklarının içerikleri ve belge içindeki yükleme sırası korundu. Betikler klasik, eşzamanlı script olarak aynı konumlarda yüklenir; `defer`, modül kapsamı veya minification eklenmedi. Böylece mevcut inline onclick fonksiyonları global kapsamda kalır. JSON-LD, üçüncü taraf async ölçüm yükleyicisi ve `noscript` içindeki görünürlük düzeltmesi yerinde bırakıldı. Ana sayfadaki gövde içi CSS blokları da aynı konumdaki harici stylesheet bağlantılarıyla değiştirildi; sıralama yeniden tasarlanmadı.

Portfolyo JSON/Markdown proje kayıtlarına dönüştürülmedi. Kart, detay, galeri ve dil yapıları HTML olarak korundu.

## Karşılaştırma

| Sayfa | Önceki HTML baytı | Eleventy çıktısı HTML baytı |
|---|---:|---:|
| Ana sayfa | 63.153 | 30.115 |
| Portfolyo | 156.450 | 139.502 |
| Pazaryeri | 15.026 | 9.907 |
| ERP | 14.766 | 9.647 |
| Reklam | 14.430 | 9.311 |
| E-ticaret sitesi | 14.542 | 9.423 |
| Veri analizi | 14.367 | 9.248 |
| Operasyon | 14.658 | 9.539 |

Boyut farkı CSS/JS'nin ayrı, tekrar kullanılabilir dosyalara taşınmasından kaynaklanır; içerik azaltılmadı. Harici dosyalar ayrıca indirilir; bu tablo ağ hızı veya Core Web Vitals ölçümü değildir.

## Testler ve kanıtlar

```powershell
npm.cmd test
npm.cmd run preview:migration
# Ayrı terminalde, karşılaştırma sunucusu çalışırken:
npm.cmd run test:http
npm.cmd run test:browser-evidence
```

- 24 koruma kontrolü: mevcut 102 izlenen dosyanın çıkarım anındaki hash'leri; sekiz doğru HTML yolu; tersine CSS/JS yerleştirmesiyle tam HTML eşitliği (yalnızca CRLF/LF normalize edilir); title/description/canonical/JSON-LD; 67 görselin hash'i; 21 proje, 42 kart ve 42 modal; tüm kart/modal HTML'lerinin birinci aşama içerik manifestiyle eşleşmesi; tüm yerel bağlantı ve fragment'ler; ortak hizmet şablonları; yayın paketinin kapsamı.
- 97 yerel HTTP kontrolü: 93 çıktı dosyasının tamamının doğru baytlarla sunulması ve dört özel kaynak/rapor yolunun 404 vermesi.
- Gerçek Eleventy geliştirme sunucusunda 17 kontrol: sekiz sayfa ve dokuz CSS/JS dosyası başarıyla sunuldu.
- Portfolyo + altı hizmette 14 masaüstü/mobil karşılaştırma: 1440×1000 ve 390×844 ekran görüntüleri PNG baytı düzeyinde aynı; sayfanın tamamındaki başlık, paragraf, kart ve yerleşim ölçüleri de aynı.
- Ana sayfada iki aynı boyutlu karşılaştırma daha: yalnızca karşılaştırma sunucusundaki `visual=1` seçeneğiyle zamanla değişen animasyonlar/sayaçlar sabitlendi. Her iki görüntü çifti birebir aynı. Bu CSS kaynak veya çıktıya yazılmaz. Ekran görüntüleri ilk ekranı kapsar; tüm sayfanın piksel eşitliği iddia edilmez.
- Gerçek, sabitlenmemiş ana sayfada: açılış ekranı, Keşfet, kilit açılması, menü/hakkımda bağlantısı, Eğitim sekmesi, 91 parçacık/dekoratif öğe, `pUp` CSS animasyonu ve IntersectionObserver görünürlük işaretleri doğrulandı.
- Portfolyoda 42 pencerenin tamamı açıldı/kapatıldı. TR/EN, İngilizce veri analizi filtresi (5 sonuç), görsel büyütme/yüklenme, Escape kapatma ve mobil proje 21 galerisi doğrulandı. Ana siteye dönüşte `skipIntro=1` davranışı ve sorgunun temizlenmesi korundu.
- Tarayıcıdan alınan uyarı/hata kayıtları boştu; yeni bir JavaScript konsol hatası gözlenmedi.

`test:browser-evidence` kaydedilmiş gerçek tarayıcı sonuçlarını ve görüntü dosyalarını doğrular; tarayıcıyı yeniden başlatıp UI testini tekrar çalıştırdığı anlamına gelmez. UI değişikliklerinde tarayıcı kanıtları yeniden alınmalıdır.

`baseline-inventory.json`, `extraction-manifest.json`, `output-inventory.json`, `test-results.json`, `http-results.json`, `dev-server-results.json`, `browser-results.json` ve `screenshots/` ayrıntılı kanıtları içerir. Birinci aşamanın manifestleri değiştirilmedi. Baseline envanterindeki `.gitignore`, bu aşamanın başında eklenen node_modules/_site dışlama satırlarını da içerir; diğer eski kaynaklar 870bfc5 sürümündedir.

## Geri dönüş ve kapsam

İkinci aşamadan önceki commit'i içeren bağımsız `.migration-backups/phase-2/before-eleventy.bundle` oluşturuldu, ayrı bare depoya klonlandı ve `git fsck --full` başarılı oldu. Dosya hash'i `output-inventory.json` içindedir. İlk aşamanın ZIP/snapshot yedeği de korundu. Yedekler aynı disktedir; donanım arızası için harici yedek yerine geçmez.

Gerekirse yeni ve boş bir klasöre bundle'dan klonlayıp `870bfc5` commit'ini seçin; mevcut kullanıcı değişikliklerinin üstüne reset uygulamayın. Kök statik dosyalar da yerinde tutuldu. Yerel geri dönüş canlı dağıtım anlamına gelmez.

GitHub Actions, GitHub Pages ayarları, DNS ve canlı site değiştirilmedi. Push veya merge yapılmadı. Mevcut kök yayın yapısı olduğu gibi kaldı; Eleventy çıktısının canlıda kullanılması ileride ayrıca onay ve dağıtım ayarı gerektirir.

## Açık sınırlar ve sonraki aşama

Gerçek telefon donanımı, Search Console, canlı ölçüm/Analytics, Core Web Vitals ve üretim sunucusu kontrol edilmedi. Karşılaştırma sunucusu yerel testlerin Analytics trafiği üretmemesi için sadece önizleme yanıtlarına CSP ekler. Harici Google Fonts erişimi kullanıldı; fontlar yerelleştirilmedi. Mevcut modal `aria-hidden` kusuru ve mobilde gizlenen masaüstü menü davranışı korunmuştur; bu aşamada erişilebilirlik/tasarım değişikliği yapılmamıştır.

Başlangıçtaki testte 85 değişen dosya sayısı toplam izlenen dosya sayısı sanılmıştı; toplam 102 olduğu doğrulanıp test düzeltildi. Tarayıcı otomasyonunda desteklenmeyen fonts/getAnimations çağrıları DOM okumalarıyla değiştirildi. Bunlar ürün hatası değildi; son kontroller başarılıdır.

`git diff --cached --check`, özgün HTML'den birebir çıkarılan `src/assets/css/home-2.css` dosyasının sonundaki mevcut boşluklu satırı işaretler. Bu biçim uyarısı, CSS baytlarını ve SHA-256 koruma sözleşmesini değiştirmemek için bırakılmıştır; işlevsel test başarısızlığı değildir. Makine tarafından okunabilir tam değişiklik listesi `changed-files.json` içindedir.

Altyapı sonraki Pages CMS aşaması için hazırdır: kaynak/çıktı ayrımı, ortak şablonlar, tek medya kaynağı, URL ve içerik koruma testleri mevcut. Ancak CMS şeması ve proje verisi dönüşümü henüz uygulanmadı. Sonraki aşamada bir proje üzerinde kayıpsız pilot veri dönüşümü ve şema denemesi yapılması önerilir; ayrıca kullanıcı onayı beklenir.
