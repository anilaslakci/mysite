# Kasım 2026 editoryal yayın paketi

## Kapsam ve takvim

Mevcut dört yazı, görselleri ve 21 proje değiştirilmeden dört Türkçe kayıt eklenmiştir. `calendar.json` başlık, SEO başlığı, slug, UUID, kelime sayısı, kaynaklar, hizmet bağlantıları ve kapak boyutlarını içerir. Metin kelime sayımı HTML etiketleri, URL ve alt nitelikleri hariç; başlıklar ve tablo değerleri dahil yapılmıştır.

| Makale | Europe/Istanbul | UTC | Kelime |
|---|---|---|---:|
| Trendyol mu, Kendi E-Ticaret Siten mi? | 2 Kasım 2026 10.00 | 07.00 | 1700 |
| Google Ads mi Meta Ads mi? | 9 Kasım 2026 10.00 | 07.00 | 1632 |
| Al-Sat Yaparak Para Kazanılır mı? | 16 Kasım 2026 10.00 | 07.00 | 1681 |
| Türkiye’den Yurt Dışına E-Ticaret Nasıl Yapılır? | 23 Kasım 2026 10.00 | 07.00 | 1688 |

`status: published` yayın için onaylı anlamındadır; görünürlük için ayrıca `publishAt <= build time` gerekir. `draft` tarihi gelse de görünmez. Dört kaydın tarihleri açık `+03:00` içerir. İngilizce çeviri veya çeviri referansı eklenmemiştir.

## Zamanlama

Mevcut günlük 06.00 UTC / 09.00 TR kontrolü korunur. Günlük 07.00 UTC / 10.00 TR hedef kontrolü ve pazartesi 07.17, 07.37 UTC ek kontrolleri eklenmiştir. Son ikisi önceki bir çalışmanın gecikmesini veya başarısızlığını garanti olarak telafi etmez; yeni deneme fırsatlarıdır. Sonraki başarılı main derlemesi, o anda uygun bütün içerikleri yayımlar.

GitHub cron varsayılan dalda çalışır; yoğunlukta gecikebilir veya çalışmayabilir. 10.00 kesin yayın garantisi yoktur. Yayın saatinde Actions takibi, sorun varsa düzeltme ve main üzerinde manuel workflow çalıştırma gerekir. CMS kaydı kaydetmek tarih filtresini geçersiz kılamaz. PR/geliştirme dalı üretime dağıtamaz. Main/repository/onay kapıları, artifact ve concurrency korumaları değiştirilmemiştir.

Kaynak: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule

## Test ve kanıt

`npm run test:november` bu teslimata özel **tarihsel kabul testidir**. Normal build veya CI zincirine bağlanmamıştır: ileride CMS üzerinden bilinçli içerik/tarih değişiklikleri yapılması eski bir editoryal anlık görüntü nedeniyle günlük build'i bozmamalıdır. Günlük blog doğrulamaları dinamik veri ve yayın durumunu kontrol etmeye devam eder.

Test ayrı `.migration-preview/november-boundaries/site` klasörüne dokuz sahte saatle gerçek Eleventy çıktısı üretir. Üretim `_site` klasörüne geleceği simüle eden çıktı yazmaz. Her aşamada doğrudan HTML, sitemap, iki RSS, ilgili yazılar, tüm HTML/XML içindeki erken kayıt sızıntısı, SEO ve dahili bağlantıları kontrol eder. Ayrıca tarihi geçmiş taslak ve erken CMS düzenlemesini test eder. Son koşu çıktısı bu klasörde `results.json` olarak saklanır.

`preserved-files.json`, başlangıç main `84d4307fc9fa87b69dd354a5861cc496afebbab5` içindeki 109 eski yazı/görsel/proje dosyasının SHA-256 kaydıdır. Metinlerde yalnızca Git'in platformlar arası CRLF/LF farkı normalize edilir; görseller bayt düzeyinde karşılaştırılır. Eski tarihsel manifestler değiştirilmemiştir.

## CMS ve görseller

Mevcut `Blog Yazıları` koleksiyonu `src/content/posts` içindeki dört yeni Markdown dosyasını okur. Kayıtlar mevcut UUID dosya adı, kategori, yayın alanları ve Markdown biçimine uygundur. `Blog görselleri` medya alanı `assets/blog` içindeki PNG kapaklarını okuyabilir; SVG'ler düzenlenebilir kaynak olarak aynı klasördedir. CMS'nin mevcut PNG/JPEG medya kısıtları değiştirilmemiştir. Gerçek oturum açılmış editörde kayıt açma/kaydetme bu çalışma kapsamında doğrulanmış sayılmaz.

Kapaklar 1200×675; büyük metin, slogan, site imzası içermez. PNG'ler 27.623 / 31.698 / 42.588 / 45.290 bayttır. Mevcut şablondaki kapak en-boy oranı ve alt metin kullanılır. Makale içi tablolar ve süreç listeleri gerçek HTML'dir; raster tablo üretilmemiştir.

## Editoryal araştırma

Araştırma tarihi 26 Ekim 2026. Arama sonuçları konu kapsamını incelemek için kullanılmıştır; kişiselleştirilmiş Google sıralaması veya anahtar kelime hacmi ölçülmemiştir. Keyword Planner ve Search Console verisine erişilmedi; hacim, sıralama ve trafik tahmini üretilmedi. Rakip metinler kopyalanmadı, oran/istatistik kanıtı olarak kullanılmadı.

| Konu | İncelenen kapsam örnekleri | Yeni yazının katkısı / ayrımı |
|---|---|---|
| Kanal seçimi | CMRSoft, CEA, Cuma Bozkurt, Protan: komisyon, kontrol, başlangıç aşamaları | Sabit ciro eşiği yerine kanıt sütunlu karar matrisi, katkı farkı ve ek sabit gider hesabı; mevcut Trendyol yazısındaki maliyet dökümünü tekrar etmez |
| Google / Meta | GreatAds, Studio Gria, Narvals: talep, hedefleme, bütçe | Ürün niyeti matrisi, farklı ürün karmasında ROAS/katkı karşı örneği, test hipotezi; mevcut ROAS formül rehberi ve Meta başlangıç kurulumunun tekrarı değildir |
| Al-sat | Eleman.net: ürün fikirleri ve model açıklaması | Kâr, kasadaki para ve kalan stok ayrımı; 30 günlük sermaye/devir hesabı; garanti ürün veya marj listesi yok |
| E-ihracat | ikas rehberi ve destek dokümanı: başlangıç, platform kurulumu | Ülke bazında sorumluluk matrisi, tek pazar pilotu, kapanmış sipariş ve iade kontrolü; destek gelirini garantili nakit saymaz |

İncelenen sayfalar:

- https://www.cmrsoft.com/kobiler-icin-e-ticaret-kendi-siteniz-mi-trendyol-mu/
- https://cea.net.tr/blog/pazaryeri-mi-kendi-siteniz-mi-karsilastirma
- https://cumabozkurt.com.tr/pazaryeri-mi-kendi-siten-mi-trendyol-hepsiburada-ile-e-ticaret-sitesi-karsilastirmasi/
- https://www.protan.com.tr/karsilastirma/pazaryeri-vs-kendi-e-ticaret-siteniz
- https://www.greatads.com.tr/rehber/reklam/google-ads-mi-meta-ads-mi
- https://www.studiogria.com/blog/google-ads-mi-meta-ads-mi
- https://narvals.com/blog/google-ads-mi-meta-reklamlari-mi/
- https://www.eleman.net/is-rehberi/pratik-bilgiler/al-sat-yaparak-nasil-para-kazanilir-h7926
- https://ikas.com/tr/blog/e-ihracat-nasil-yapilir
- https://support.ikas.com/tr/e-ihracata-baslarken

Birincil kaynaklar:

- Google Search Central people-first: https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=tr
- Google kampanya türleri: https://support.google.com/google-ads/answer/2567043?hl=tr
- Performance Max: https://support.google.com/google-ads/answer/10724817?hl=tr
- Shopping: https://support.google.com/google-ads/answer/3455481?hl=tr
- Meta Blueprint Advantage+ sales eğitimi: https://www.facebookblueprint.com/student/activity/604017?sid=9acea202-0152-411b-a932-297ef3b4c46d&sid_i=1
- GİB güncel rehber dizini: https://www.gib.gov.tr/yardim-ve-kaynaklar/rehberler-ve-brosurler/gelir-vergisi-kanunu (Nisan 2026 ticari kazanç mükellefi hak ve ödevleri broşürü)
- ETBİS SSS: https://etbis.ticaret.gov.tr/tr/SSS
- Bakanlık kılavuz dizini: https://www.ticaret.gov.tr/destekler/e-ihracat-destekleri/kilavuzlar
- Gümrük uygulama kılavuzları: https://ggm.ticaret.gov.tr/yayinlar/gumruk-uygulamalarina-iliskin-kilavuzlar

Meta Business ana ürün sayfası oturum engeline takılmıştır; güncel arayüz adımları test edilmiş gibi anlatılmaz. Erişilebilir resmî Blueprint içeriğiyle otomasyon ve kreatif yaklaşımı doğrulanmıştır.

Bakanlık dizininde 6 Ekim 2026 tarihi görünür; bağlı destek PDF'sinin iç tarihi Mayıs 2026, pazar/gümrük raporununki Haziran 2026'dır. Sayfa tarihi yeni mevzuat tarihi gibi sunulmaz. PDF'lerin ilgili tanım, destek başvurusu ve ülke kapsamı bölümleri incelenmiştir; bütün ülkelerin mevzuatı hukuki olarak doğrulanmış sayılmaz. Makale bu yüzden oran ve parasal/gönderi limiti vermez; ürün, ülke ve işlem için güncel yetkili teyidine yönlendirir.

Tüm finansal tablolar açıkça varsayımsaldır. Al-sat örneğindeki 1.400 TL sonuç vergi öncesidir; 12.400 TL kasa + 4.000 TL stok, başlangıç 15.000 TL ile tutarlıdır. Reklam karşılaştırması farklı ürün karmasını eşit test gibi sunmaz. Sahte müşteri vakası, kişisel satış deneyimi veya kazanç garantisi yoktur.

Henüz yayımlanmamış yeni yazılara gövde içinde link verilmez. Mevcut dört makaleye doğal bağlantılar vardır; yeni kayıtların manuel ilgili yazı referansları ortak yayın filtresinden geçer. Karşılık bulunmadığı için İngilizce hreflang uydurulmaz.

## Yerel kabul sonucu

- Dokuz gerçek Eleventy saat simülasyonu; çıktı, XML, SEO ve bağlantı denetimleri başarılı.
- 390 / 768 / 1440 px Chrome: 12 makale görünümü, yüklenen kapaklar, üç ilgili yazı, doğru canonical ve yatay taşma kontrolü başarılı. Onay öncesi Google Analytics isteği ve yeni sayfa hatası yok. Fiziksel cihaz testi değildir.
- Production `npm test`, 14 blog senaryo grubu / 16 olumsuz veri kontrolü, 10 çok dil ve 11 çeviri referans grubu, workflow güvenliği ve resmî CMS şema kontrolü başarılı.
- Portfolyo medya denetimi: 21 proje, kayıtlı 67 özgün görsel, eksik dosya 0. 66 görsel projelerce referanslı; diğer özgün dosya da korunur.
- 12 portfolyo tamamlama senaryosu, 8 olumsuz derleme ve 10.000 UUID örneği kontrolü başarılı.
- Ekran görüntüleri ve tarayıcı sonuçları `browser/`; saat sonuçları `date-results.json`. GitHub CI/deploy sonuçları PR ve Actions kayıtlarından ayrıca doğrulanır.
