# Üçüncü aşama: Pages CMS için kayıpsız proje verileri

Dal: `refactor/eleventy-cms-migration`. Başlangıç: `324a1d5`.
Başlangıç dalı ve temiz çalışma alanı doğrulandı. Yerel uygulama tamamlandı; **gerçek Pages CMS editörü kabul testi açık**. Push, merge, yayın veya GitHub yetkisi değişikliği yapılmadı. Blog/Actions eklenmedi.

## Dosya yapısı

```text
.pages.yml                         Projeler koleksiyonu + medya yapılandırması
src/content/projects/1.json        Proje 1; tr/en aynı kayıt
src/content/projects/...           Mevcut 21 ayrı JSON kaydı
src/content/projects/21.json
src/_data/portfolio.mjs            Eleventy global veri yükleyicisi
src/_includes/portfolio/card.njk    Ortak kart şablonu
src/_includes/portfolio/modal.njk   Ortak detay ve galeri şablonu
src/portfolyo/index.njk             Veri döngüleri, filtreler ve dinamik sayaç
lib/portfolio.mjs                  Sabit kategori anahtarları ve veri/medya doğrulama
src/assets/js/portfolio-1.js       Dil değişiminde kayıt sayısından hesaplanan sayaç
scripts/                          Dönüşüm, şema ve regresyon kontrolleri
migration/phase-3/                 Pilot, dönüşüm, test ve tarayıcı kanıtları
```

Kök HTML dosyaları, önceki aşamaların manifestleri, görseller ve diğer yedi Eleventy sayfası korunmuştur. Portfolyonun düzenlenebilir içerik kaynağı artık `src/content/projects/` dizinidir; `src/portfolyo/index.njk` içine yeni kart/metin elle eklenmez. JSON kayıtları yayın paketine kopyalanmaz.

## Veri alanları ve CMS

| Alan | CMS alan türü | Kullanım |
|---|---|---|
| `id` | number | Sayısal kimlik; `{fields.id}.json` dosya adını üretir |
| `order` | number | Sıra; ilk 21 projenin sırası korunur |
| `category` | select | Sabit anahtar; çevrilmiş etiket ve renk koddan gelir |
| `tr`, `en` | object | İki dildeki içerik aynı dosyada |
| `title` | string | Kart ve detay başlığı |
| `summary`, `intro` | text | Kart özeti ve ayrı detay giriş metni |
| `problem`, `solution`, `impact` | text | Mevcut açıklamalar ve satır içi HTML vurguları |
| `technologies` | string list | Kart etiketleri |
| `detailTechnologies` | string list | Detay etiketleri; mevcut bazı projelerde farklıdır |
| `galleryTitle`, `galleryIntro` | string | Mevcut galeri başlığı ve tekil/çoğul açıklaması |
| `gallery[]` | object list | Sıralı görsel listesi; ortak dosya + `altTR`/`altEN` |
| `gallery[].file` | image | Seçme veya yükleme; PNG/JPG/JPEG |
| `links[]` | optional object list | `url`, `labelTR`, `labelEN`; mevcut projelerde boş |

Kimlik alanı oluşturma sırasında doldurulabilsin diye salt okunur yapılmadı. Bunun yerine kayıt dosya adı/kimlik eşitliği, kimlik tekilliği, sıra tekilliği, 1–21 kimliklerinin varlığı ve eski sıraları derlemede zorunlu doğrulanır. CMS'de mevcut kayıt yeniden adlandırma/silme kapalı, yeni kayıt oluşturma açıktır. Kimlik veya eski sıra değişikliği sessizce kabul edilmez; derleme hata verir. Yeni projede kullanılmayan yeni kimlik/sıra gerekir (ilk yeni kayıt için 22).

Kategoriler: `data-analysis`, `operations`, `marketplace`, `finance`, `entertainment`, `mobile`, `other`. Görünen TR/EN etiketler ve mevcut renkler aynı kalmıştır. Filtreler kullanılan kayıt kategorilerinden üretilir; çevirilerin metnine bağlı değildir. Proje sayacı hem HTML'de hem dil değişiminde kayıt/kart sayısından hesaplanır; JavaScript'teki iki sabit `21` kaldırıldı.

Rich-text/Markdown dönüşümü uygulanmadı: açıklamalar `text` alanında mevcut HTML ile saklanır. `<strong>`, `<em>`, `<b>`, `<i>`, `<br>` desteklenir; desteklenmeyen/eksik etiketler hata verir. Özellikle proje 19'un iki dildeki `<strong>` vurguları ve proje 18/19'un farklı kart/detay teknoloji listeleri korunmuştur. Metinlerin yazımı veya anlamı değiştirilmemiştir.

Eski HTML'de bazı modal sınırlarında fazladan kapanış etiketleri bulundu. Bunları bu aşamada temizleyip DOM yapısını değiştirmek yerine iki dilde gizli `legacyModalTail` uyumluluk alanında koruduk. Alan editörde gösterilmez; yeni kayıt için boş varsayılanlıdır. Dil modal kapsayıcıları da yerlerinde tutuldu. Bu teknik uyumluluk alanı içerik değildir ve elle düzenlenmemelidir.

## Kayıpsız dönüşüm kanıtı

1. Önce proje 1 dönüştürüldü; TR/EN kart ve detay için dört geri üretim karşılaştırması geçti (`pilot-result.json`).
2. Ardından 21 kayıt üretildi; 84 kart/modal karşılaştırması geçti (`conversion-result.json`, `record-test-results.json`).
3. Kartlar ve modallar birinci aşamanın tam HTML manifestiyle karşılaştırılır. Yalnızca etiketler arasındaki görünmez boşluklar ve eski kategori metninin yeni sabit anahtarı normalize edilir; metin içi boşluklar ve biçimlendirme korunur.
4. Portfolyo dışındaki yedi HTML çıktı, CSS/JS tekrar yerleştirildiğinde eskiyle birebir eşleşir. Portfolyonun tüm HTML'i de aynı normalizasyonla eşleşir. Sayaç JavaScript'indeki değişiklik yalnızca açıkça beklenen iki dönüşümle sınırlandırılmıştır.
5. Mevcut 67 dosyanın tamamının SHA-256 değerleri korunur. Bunların 66'sı galerilerde, biri favicon olarak kullanılır; hiçbir dosya kaldırılmadı/dönüştürülmedi. Galeride 132 TR/EN kullanımının sırası, alternatif metinleri ve dosya eşleşmeleri korundu.

## Pages CMS belgeleri ve gerçek şema doğrulaması

Yapılandırma [koleksiyon/JSON formatı](https://pagescms.org/docs/configuration/content/), [dosya adı](https://pagescms.org/docs/configuration/content/filename/), [alanlar](https://pagescms.org/docs/configuration/content/fields/), [nesne/listeler](https://pagescms.org/docs/configuration/fields/object/), [select](https://pagescms.org/docs/configuration/fields/select/) ve [medya](https://pagescms.org/docs/configuration/media/) belgeleriyle karşılaştırıldı.

Yalnızca YAML parse edilmedi: Pages CMS'nin [resmî ConfigSchema kaynağı](https://github.com/hunvreus/pagescms/blob/main/lib/config-schema.ts) indirildi ve kendi Zod doğrulayıcısı çalıştırıldı. Registry alan adları resmî registry'den çıkarıldı; yalnızca uygulama içi import bu eşdeğer ad kümesiyle değiştirildi ve Node ile TypeScript türleri silindi. Şema kuralları değiştirilmedi. Geçerli `.pages.yml` kabul edildi; bilinmeyen alan türü/anahtar eklenen iki negatif örnek reddedildi. JSON kayıtlardaki tüm anahtarların CMS alanlarında tanımlı olduğu ayrıca doğrulandı.

İndirilen upstream package sürümü 2.1.8 ve doğrulayıcı Zod 3.25.76 idi. Bu, oturum açılmamış hosted editörün sürümünün doğrulandığı anlamına gelmez. Kaynak hash'leri ve URL `upstream-schema-results.json` içindedir. Şema denemesinde primitive `list: {min:1}` biçiminin doğrulayıcıyla uyumsuz olduğu yakalandı; belgelenen `list: true` biçimine geçildi. Minimum liste uzunluğu yerel veri doğrulayıcısında da korunur.

Zod yalnızca ignore edilen `.migration-preview/pagescms-schema/` test klasörüne kuruldu; sitenin package/lock bağımlılıkları değişmedi. Çalışma zamanı bağımlılığı veya ayrı CMS sunucusu kurulmadı. Pages CMS, GitHub üzerindeki `.pages.yml` ve JSON dosyalarını okuyarak çalışacaktır.

## Gerçek CMS editörü: TEST EDİLMEDİ

`https://app.pagescms.org/` salt okunur açıldı ve `Sign in to Pages CMS` ekranına yönlendi. Kullanılabilir kimliği doğrulanmış oturum yoktu. Giriş düğmesine basılmadı, izin verilmedi, medya yüklenmedi veya GitHub'a kayıt gönderilmedi. Ayrıca yeni yapılandırma yalnızca yereldedir; push yasağı nedeniyle hosted editör bu sürümü okuyamaz.

Mevcut kaydı açma, TR/EN düzenleme, gerçek görsel yükleme, yeni kayıt oluşturma, kategori/etiket seçme ve GitHub'a kaydetme işlemlerinin tümü gerçek editörde **test edilmedi** olarak işaretlendi (`editor-test-status.json`, giriş ekranı kanıtı). Başarılı yerel testler gerçek editör testi diye sunulmaz.

İleride bu kabul testi için yetkili bir Pages CMS/GitHub oturumu ve `.pages.yml` içeren geliştirme dalını GitHub'a göndermek üzere ayrıca onay gerekir. Main veya canlı yayın gerekli değildir; ancak bu görevde hiçbir push yapılmaz.

## Yerel testler

```powershell
npm.cmd test
npm.cmd run test:cms-edits
npm.cmd run preview:migration
# Önizleme açıkken başka terminalde:
npm.cmd run test:http
npm.cmd run test:project-browser-evidence
npm.cmd run test:browser-evidence
npm.cmd run media:check
```

- 24 Eleventy koruma/regresyon kontrolü geçti.
- 9 veri/CMS kontrolü geçti; içinde 84 kayıpsız kart/modal karşılaştırması vardır.
- 6 izole düzenleme/derleme/geri alma kontrolü geçti. Testte yeni proje uydurulmadı: mevcut proje 1 yalnızca ignore edilen geçici klasörde 22 kimliğiyle kopyalandı; değiştirilen başlık/açıklama/etiketler mevcut gerçek kayıtlardan alındı. Üretim kaynakları hiçbir zaman 22 kayıt olmadı.
- Galeri ekleme denemesinde mevcut PNG baytları geçici, benzersiz bir dosyaya kopyalandı; gerçek upload yapılmadı. Dosya test sonunda kaldırıldı, orijinal dosyalara dokunulmadı.
- Geri alma, önceki portfolyo HTML'inin SHA-256 değerini birebir geri getirdi; üretim kayıtlarının hash'leri değişmedi.
- 97 yerel HTTP kontrolü tekrar geçti: sekiz URL ve tüm çıktı varlıkları doğru baytlarla sunuldu; özel kaynaklar 404 verdi.
- Birinci aşamanın 77 HTTP/görüntü kontrolü de tekrar geçti. Gerçek Eleventy geliştirme sunucusunda sekiz sayfa ve dokuz CSS/JS için 17 kontrol yeniden geçti (`dev-server-results.json`).
- Birinci aşamanın 12 koruma kontrolü ve ikinci aşamanın kayıtlı tarayıcı kanıt kontrolü tekrar çalıştırıldı. Eski manifest ve raporlar korunur; yeni koruma sonucu `eleventy-regression-results.json` içine yazılır.
- Sekiz sayfada 1440×1000 / 390×844 için 16 yeni ekran görüntüsü çifti birebir aynı. Ana sayfada önceki aşamayla aynı, yalnızca test önizlemesine ait hareket/sayaç sabitlemesi kullanıldı; ilk ekran karşılaştırılır, tüm sayfanın piksel eşitliği iddia edilmez.
- Mevcut 42 modalın tamamı gerçek tarayıcıda açıldı/kapatıldı. TR/EN, veri analizi filtresi, zoom, Escape, mobil galeri ve ana sayfaya dönüş/menü/Eğitim sekmesi geçti. Yeni JavaScript konsol hatası gözlenmedi.
- İzole 22 kayıtlık çıktı gerçek tarayıcıda ayrıca açıldı: 44 kart/modal, dil değişiminden sonra sayaç 22, Finans filtresinde eski 10 + test 22, test modalı, isteğe bağlı bağlantı ve eklenen PNG yüklenmesi doğrulandı. Bu çıktı yalnızca `.migration-preview/` altında bulunur; `_site/` hâlâ 21 projedir.

`test:project-browser-evidence` kaydedilen gerçek tarayıcı bulgularını ve PNG dosyalarını kontrol eder; kendisi yeni bir tarayıcı oturumu başlatmaz. `npm test` bu geçişin dondurulmuş başlangıç içeriğini koruma testidir; ileride onaylı CMS içerik değişikliğinde eski manifestten fark beklenir ve yeniden kabul gerekir. Normal `npm run build` ise güncel verinin yapısal/geçerli olmasını kontrol eder, eski başlıkların aynı kalmasını zorlamaz.

Resmî şema testini tekrarlamak için ignored test klasörüne resmî `lib/config-schema.ts`, `fields/registry.ts`, `package.json` ve `LICENSE` dosyalarını indirin (kayıtlı kaynak hash'lerini karşılaştırın); orada `npm.cmd install --prefix .migration-preview/pagescms-schema --no-save --package-lock=false --ignore-scripts zod@3.25.76` çalıştırın. Ardından `npm.cmd run test:cms-schema` kullanın. Bu test ağ/cache hazırlığı gerektirir; normal derleme gerektirmez.

## Medya güvenliği ve açık sınırlar

CMS medya girdisi `assets/portfolio`, yayın yolu `/assets/portfolio` olarak eşleşir; yükleme adı `rename: random` ile mevcut hash adlarını ezmeyecek biçimde üretilir. Aynı dosya birçok projede kullanılabilir. `media:check` salt okunur referans listesi üretir. Eksik görsel derlemeyi durdurur; hiçbir otomatik çöp toplama veya görsel silme kodu eklenmedi.

Yerel `assertMediaUnused` koruması, birden fazla kayıt tarafından kullanılan dosyayı silmeye izin vermediğini negatif testle kanıtlar. **Bu fonksiyon hosted Pages CMS medya ekranına müdahale etmez.** Resmî medya yapılandırmasında doğrulanmış bir dosyalar arası silme kilidi bulunmadığından böyle bir ayar uydurulmadı. CMS'nin yerleşik silme davranışı ve yetki sınırları gerçek oturumla ayrıca test edilmelidir. O zamana kadar referans verilen dosyalar CMS'den silinmemelidir. Yanlış silme durumunda Git geçmişinden geri yükleme gerekir; derleme koruması silme işleminin kendisini engellemiş sayılmaz.

Gerçek telefon donanımı ve canlı SEO/performans ölçümü yapılmadı. Mevcut modal `aria-hidden` erişilebilirlik kusuru, tasarım ve davranış koruma kapsamı nedeniyle değiştirilmedi.

## Geri dönüş ve sonraki adım

`.migration-backups/phase-3/baseline-324a1d5.zip` ve `.migration-backups/phase-3/before-cms.bundle` oluşturuldu. Bundle ayrı bare depoya klonlandı ve `git fsck --full` geçti. Önceki yedekler de korunur; bunlar aynı disktedir. Kaynak içerik root HTML ve önceki Git commit'lerinde durur. Geri dönüş için yeni boş klasöre bundle'dan klonlayıp `324a1d5` seçilebilir; mevcut kullanıcı dosyalarının üzerine zorlayıcı reset yapılmaz. CMS veri dosyasındaki bir düzenlemeyi geri almak, önceki JSON sürümünü geri getirip yeniden derlemektir; yerel denemede birebir doğrulandı.

Sonraki adım **gerçek CMS kabul testi** olmalıdır: ayrıca yetkilendirilmiş geliştirme dalı aktarımı ve mevcut kullanıcı oturumu ile sekiz editör adımı sınanmalıdır. Bu açık kontrol kapanmadan “CMS editöründe uçtan uca doğrulandı” denemez. Blog, otomatik yayın ve canlı dağıtım bu aşamada yoktur.
