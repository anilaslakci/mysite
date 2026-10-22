# Portfolyo CMS esneklik incelemesi ve uygulama raporu

## Başlangıç ve kapsam

- Dal: `refactor/eleventy-cms-migration`.
- Başlangıç yerel commit: `7723f49`. Çalışma alanı temizdi.
- Uzak CMS commit'leri `e3a0362` ve `13f0fc4`, `git pull --ff-only` ile alındı; reset/rebase yapılmadı.
- Esas alınan sürüm: `13f0fc4`. Proje 1 başlığı `Pazaryeri Satış Analiz Aracı`; TEST yok.
- CMS boş `legacyModalTail` ve `links` alanlarını çıkarmış; kullanıcı değişikliği aynen korundu.
- Bu revizyonda mevcut 21 proje JSON dosyası hiç değiştirilmedi. Kaynak görseller, açıklamalar ve çeviriler korunuyor.
- Push, merge, GitHub Pages/DNS ayarı veya yayın işlemi yapılmadı. Yeni bağımlılık, blog veya workflow eklenmedi.

## Bulunan ve giderilen sabit kısıtlar

| Önce | Şimdi |
| --- | --- |
| Derlemede 1–21 kimlikleri bulunmalıydı | Herhangi bir sayıda kayıt, sıfır kayıt dahil, geçerli |
| İlk 21 projede sıra kimliğe eşit olmalıydı | Kimlikten bağımsız değiştirilebilir sıra |
| Aynı sıra numarası reddediliyordu | Kayıp olmadan eşit sıra; ikincil sıralama kimlik |
| Sıra zorunluydu | Boş/null sıra en sonda; eşitlikte küçük kimlik önce |
| Silme CMS'de kapalıydı | Proje ve kategori koleksiyonunda silme açık |
| Arşivleme yoktu | `archived: true` kaydı saklar, iki dilde yayından çıkarır |
| Yedi kategori hem JS modülünde hem CMS seçeneklerinde sabitti | Yedi başlangıç kaydı ayrı koleksiyonda; yeni kategori kod düzenlemeden eklenir |
| Detay açıklamaları, teknoloji listeleri ve galeri zorunluydu | Yalnızca iki dilde başlık/özet, kimlik ve kategori zorunlu; eklenen görsellerin iki alt metni zorunlu |
| Günlük test eski 21 proje metnini donduruyordu | `npm test` geçerli güncel modeli/çıktıyı doğrular; tarihsel eşitlik `test:migration` altında |
| Medya denetimi sadece yayımlananları görebilirdi | Arşiv kayıtları da medya kullanım kontrolüne dahil |

Proje sayacı, dil değiştirme ve filtreler önceki aşamada zaten veri odaklıydı; sabit sayı eklenmedi. Başlangıç kategorilerinin tarihsel listesi yalnızca eski HTML karşılaştırma yardımcısında tutuldu; günlük kategori kaynağı değildir.

## Güncel veri yapısı

```text
.pages.yml
src/content/projects/<id>.json         # mevcut 21 dosya aynen korundu
src/content/categories/<key>.json      # yeni, başlangıçta 7 kategori
assets/portfolio/                      # ortak medya havuzu; mevcut 67 dosya korunur
lib/portfolio.mjs                      # doğrulama, sıralama, yayın seçimi
src/_data/portfolio.mjs                # Eleventy veri yükleme
src/_includes/portfolio/{card,modal}.njk
scripts/test-portfolio-runtime.mjs     # günlük doğrulamalar
scripts/test-portfolio-flexibility.mjs # izole gerçek Eleventy derlemeleri
migration/phase-1..3/                  # tarihsel manifestler ve kanıtlar korunur
migration/phase-4/                     # bu revizyonun raporu ve test kanıtları
```

### Kimlik ve sıralama

`id` pozitif güvenli tam sayıdır ve `<id>.json` adıyla eşleşmek zorundadır. Gösterim sırasından ve başlıktan bağımsızdır. Mevcut kimliği değiştirmek normal bir editoryal işlem değildir: dosya adı değişmeden değiştirilirse derleme açık hata verir. Kart, modal ve galeri eşleşmeleri aynı kalıcı kimliği kullanır. Proje silinince diğer kimlikler yeniden numaralanmaz.

Yeni kimlik manuel girilir; örneğin mevcut en büyük kimlik + 1. Pages CMS yerleşik UUID alanıyla UUID üretebilir, fakat mevcut sayısal kayıtları ve kart/modal sözleşmesini değiştirmemek için bu revizyonda kimlik türü değiştirilmedi. Pages CMS'de atomik otomatik artan sayı tahsisi varsayılmadı. Aynı anda birden fazla editörün aynı sayıyı seçmesini CMS formu seviyesinde engellediğimiz iddia edilmiyor. İki ayrı kayıtta tekrar eden kimlik ve dosya/kimlik uyuşmazlığı derlemede reddedilir. Mevcut dosya adıyla yeni kayıt açıldığında CMS'nin verdiği çakışma uyarısı gerçek editörde ayrıca denenmeli; derleme, kayıt aşamasındaki yanlış bir dosya üzerine yazma işlemini geri alamaz. Bu nedenle yeni projede kullanılmayan kimlik seçilmeli; geri alma için Git geçmişi korunmalı.

`order` pozitif tam sayı veya boş/null olabilir. Önce küçük sayılar, sonra sırası boş olanlar gelir. Eşitlikte sayısal kimlik artan sıralanır; kaynak klasör sırası belirleyici değildir. Aynı sıra numarası veri silmez. Koleksiyon seviyesinde sürükle-bırak sıralaması eklenmedi; CMS'deki sayı alanı kullanılır. CMS liste görünümünün boş sıraları yerleştirmesi, sitedeki sıralamayı belirlemez; Eleventy kuralı kesin kaynaktır.

### Yayın ve silme

`archived` yoksa veya false ise proje yayımlanır. True ise JSON ve görseller korunur; kart, detay, sayaç ve kategori filtrelerine katılmaz. İşareti kaldırmak yeniden yayımlar. Arşiv kaydı da içerik ve medya açısından doğrulanır. Arşivleme açık GitHub deposunda gizlilik sağlamaz.

Silme JSON kaydını kaldırır; görseller otomatik silinmez. Geri alma ilgili CMS commit'inin Git üzerinden geri alınmasıyla yapılabilir. Tercih edilen günlük işlem arşivlemedir; kalıcı kaldırma gerektiğinde silme kullanılabilir.

### Kategoriler

Her kategori `key`, `tr`, `en`, isteğe bağlı `order` ve `color` alanları içerir. Kalıcı anahtar küçük Latin harf/rakam/tire içerir; `all` filtre için ayrılmıştır. Dosya adı anahtarla eşleşmelidir. Türkçe/İngilizce adlar anahtarı değiştirmeden düzenlenebilir.

Projenin `category` alanı artık Pages CMS `reference` türünde; `categories` koleksiyonundan seçer, `{fields.key}` saklar ve iki dilde adı gösterir. Yalnızca yayımlanan projelerin kullandığı kategoriler filtre olur. Kategoriler kendi sırasına, eşitlikte anahtara göre sıralanır.

Kullanılan kategori silinirse veya anahtar değişirse (arşiv projeleri dahil) derleme proje kimliğini içeren eksik referans hatası verir. Hiçbir proje silinmez veya başka kategoriye sessizce taşınmaz. Önce projeler başka kategoriye atanmalı, sonra eski kategori silinmelidir. Kullanılmayan kategori silinebilir. CMS'nin referanslı kategori silmeyi kendi arayüzünde önceden engellediği iddia edilmez.

Boş renk mevcut turkuaz `#48C9B0` olur; verilen renk yalnızca altı haneli hexadecimal kabul edilir. Etiketler şablonda HTML olarak kaçırılır. Böylece renk veya kategori adı üzerinden CSS/HTML eklenemez.

### Dil, teknoloji, detay, medya ve bağlantılar

- İki dilde başlık ve kart özeti gerekir. Eksik İngilizceyi Türkçe ile dolduran otomatik bir davranış yoktur.
- Giriş, sorun, çözüm, etki, teknoloji listeleri ve galeri isteğe bağlıdır. Boş detay bölümleri/galeri başlıkları render edilmez.
- Mevcut `strong`, `em`, `b`, `i`, `br` biçimlendirmesi korunur. Markdown veya genel HTML editörü eklenmedi; izin verilmeyen/bozuk HTML derlemeyi durdurur.
- Kart ve detay teknoloji listeleri iki dilde ayrı kalır. Yeni kayıtta detay listesi hiç yoksa kart listesi kullanılır; açıkça boş liste boş kalır. Eski farklı listelere dokunulmadı.
- Galeri liste sırası dosyada neyse çıktıda da odur. Her kullanılan görsel için TR/EN alt metin zorunlu.
- Medya yolu `/assets/portfolio/<dosya>.png|jpg|jpeg` biçiminde olmalı. Yol geçişi, eksik dosya ve uzantıya uymayan dosya imzası reddedilir. Yeni alt klasör/format desteği bu revizyonda eklenmedi.
- Aynı medya birden fazla projede/galeride kullanılabilir. `media:check` ve `assertMediaUnused` arşivdekiler dahil kullanımı denetler. **Pages CMS medya silme ekranında otomatik çapraz referans kilidi yoktur**; ortak medya silinmemeli. Eksik görsel sonraki derlemede yakalanır. Otomatik temizleme yapılmaz.
- Bağlantı listesi isteğe bağlıdır. Eklenen her bağlantıda güvenli HTTPS/site içi yol ve iki dilde etiket gerekir. Dahili yollar ve fragmentler günlük çıktı testinde kontrol edilir. Harici sitelerin erişilebilirliği ağ üzerinden garanti edilmez.
- Modal açma/kapamada `aria-hidden` güncellenir; büyütülen görsel alt metni taşınır. Mevcut klavye Enter/Space/Escape davranışları korunur. Tam ekran okuyucu/fokus tuzağı erişilebilirlik denetimi yapılmış sayılmaz.
- Mevcut title, description, canonical, JSON-LD ve sekiz URL korundu. Proje başına yeni URL/SEO sayfası oluşturulmadı.

## Testler ve kanıtlar

| Kontrol | Sonuç |
| --- | --- |
| `npm test` | Güncel 21 yayımlanan proje, 7 kullanılan kategori, 8 URL; SEO, sayaç, kart/modal eşleşmeleri, dahili dosyalar/fragmentler geçti |
| `npm run test:flexibility` | 14 senaryo grubu, izole gerçek derlemeler: 22/23 ekleme, sıra değiştirme/eşit sıra, arşiv/geri yayın, silme, kategori ekleme/ad değiştirme/referanslı silme, teknoloji/iki dil/galeri/ortak medya, bağlantı ekle/kaldır, minimal 24. kayıt, sıfır kayıt, olumsuz veri kontrolleri, kaynak bayt koruması |
| `npm run test:cms-edits` | 6 izole düzenleme/PNG kopyalama/derleme/geri alma kontrolü geçti; bu bir gerçek CMS upload testi değildir |
| `npm run test:migration` | 24 tarihsel çıktı kontrolü + 9 kayıt kontrolü; 84 kart/modal karşılaştırması, 67 özgün görsel SHA-256 geçti |
| `npm run test:cms-schema` | Önbellekteki resmî upstream ConfigSchema kabul etti; 2 geçersiz seçenek/tür testi reddedildi. Kanıtta kaynak hash'i ve sürümü var; barındırılan uygulamanın sürüm garantisi değildir |
| `npm run test:http` | 97 HTTP kontrolü geçti |
| `node scripts/test-portfolio-browser-evidence.mjs` | Bu revizyonda alınan iki ekran görüntüsü çifti birebir eşit (1440×1000 ve 390×844); 42 TR/EN modal, dil, filtre, zoom/Escape, 23 kayıtlı fixture, minimal kayıt ve mobil galeri geçti; konsol hata/uyarı listesi boş |
| Eski tarayıcı kanıtları | Phase-2/3 kanıt denetleyicileri geçti; bunlar yeni bir eski-sürüm tarayıcı oturumu değildir |
| CMS sonrası kaynak koruması | 21 JSON dosyası senkronize edilen sürüm ve bağımsız çalışma kopyası yedeğiyle bayt düzeyinde aynı |

Testlerin eklediği kayıtlar gerçek proje 1'in izole kopyalarıdır; üretim içeriğine uydurma proje eklenmedi. Fixture ve yerel upload çıktıları `.migration-preview/` altında izole edilir; upload testinin oluşturduğu dosya test bitiminde kaldırılır.

`npm test` tarihsel metin/sayı eşitliği aramaz. Bilinçli editoryal değişiklikten sonra `test:migration` eski kayıpsız dönüşüm karşılaştırmasında farklılık gösterebilir; bu beklenen tarihsel farktır, günlük build engeli değildir. Eski manifestler değiştirilmedi. Yeni test sonuçları phase-4 altında tutuldu.

## Gerçek Pages CMS kabul durumu

Kullanıcının yaptığı Türkçe başlık düzenleme/Save/geri alma testi, uzaktan alınan iki CMS commit'i ile doğrulandı. Bu revizyon henüz push edilmediği için yeni kategori referans seçicisi, boş sıra alanının kaydı, arşiv kutusu, silme, yeni proje/kimlik çakışması ve galeri sıralama/yükleme **yeni yapılandırmayla gerçek hosted editörde denenmedi**. Yerel derleme ve upstream şema kabulü bunların yerine geçirilmedi.

Sonraki onaylı adım: yalnızca geliştirme dalına bu revizyonu gönderme; ardından kullanıcıyla gerçek CMS'de kategori ekleme/seçme, sıralama boş/eşit değer, arşiv/geri yayın, proje oluşturma/silme, medya yükleme ve kayıtları geri alma kabul testi. Canlı yayın ayrı onay gerektirir.

## Yedek ve geri dönüş

- `.migration-backups/phase-4/baseline-13f0fc4.zip`: Git arşivi, SHA-256 `49c3615f81c93d3ce7ce4355e8639a3568d0aec05f56969eeaec13547373c131`.
- `.migration-backups/phase-4/projects/`: senkronize çalışma kopyasının 21 kayıt için bayt düzeyinde yedeği; birebir karşılaştırıldı.
- ZIP içindeki 21 kayıt çalışma kopyasıyla satır sonu normalleştirilerek karşılaştırıldı (Git LF / Windows CRLF farkı). İçerik aynı.
- Önceki ZIP/bundle/snapshot yedekleri silinmedi. Yerel yedekler aynı disktedir; başka cihaz yedeği olduğu iddia edilmez.
- Yeni yerel commit `git revert <revizyon-commit>` ile geri alınabilir; bu CMS'nin önceki `13f0fc4` değişikliklerini silmez. ZIP ayrı klasöre açılarak bağımsız incelenebilir. Zorla reset/force push gerekmez.

## Açık teknik sınırlar

Kimlik seçimi manuel, kategori referanslı silme ve medya kullanım koruması build seviyesinde; CMS'de işlem öncesi atomik kısıtlar değildir. Bozuk bir içerik commit'inin kaydedilmesini engelleyen GitHub kontrol workflow'u bu kapsamda eklenmedi. Yeni yayın altyapısı oluşturulmadı.

Sabit proje sayısı sınırı yoktur; mevcut mimari bütün kart/modal HTML'ini tek portfolyo sayfasında üretir. Çok büyük kayıt sayılarında HTML/DOM ve medya kopyalama maliyeti büyür. Bu revizyon sonsuz ölçek performansı garantisi vermez; ölçüm gerektirirse sonraki onaylı aşamada sayfalama/ayrı proje sayfası ele alınabilir. Şimdiki tasarım/URL/etkileşimler değiştirilmedi.

Resmî başvurular:
- https://pagescms.org/docs/configuration/fields/reference/
- https://pagescms.org/docs/configuration/fields/uuid/
- https://pagescms.org/docs/configuration/content/filename/
- https://pagescms.org/docs/configuration/fields/number/
