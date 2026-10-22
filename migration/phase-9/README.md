# Canlıya geçiş öncesi doğrulama — 22 Ekim 2026

## Sonuç

Yerel hazırlık tamamlandı. Nihai geliştirme commit'inin GitHub CI sonucu ayrıca teslim raporunda verilir. Bu çalışma üretim dağıtımı değildir: main, Pages kaynağı, domain, DNS ve yayın bayrağı değiştirilmedi.

## Kaynak ve yedekler

Uzak CMS değişiklikleri geçmiş yeniden yazılmadan 573a434a69c1ebf4cfd19581db024156a84d60ab commit'ine kadar alındı. Canlı/main commit'i 63c3f30b2d1af4fc178ccac295aaf0ae89adaabf. Başlangıç karşılaştırması geliştirme için 0 geride, 18 ileride.

Bağımsız main ve geliştirme ZIP + tam geçmiş bundle dosyaları C:/Users/Asus/Desktop/mysite/.migration-backups/phase-9-exact/ içinde. backups.json SHA-256 değerlerini içerir. ZIP dosyalarında sırasıyla 18 ve 562 dosya Git blob baytlarıyla karşılaştırıldı; iki bundle bütünlük kontrolünü geçti. İlk CRLF dönüştüren arşiv denemesi doğrulanmış yedek sayılmadı; exact dizini kullanılmalıdır. Aynı disk fiziksel cihaz kaybına karşı yedek değildir; geçiş öncesinde ikinci ortama kopyalanmalıdır.

## İzinli test temizliği

CMS Türkçe Test Yazısı2 ve CMS English Test Article kayıtları draft durumları, test metinleri, boş Markdown gövdeleri ve kullanıcı bildirimiyle doğrulandı. İlgili test PNG'si önceki kabul testi hash'iyle eşleşti, başka içerikte referansı bulunmadı. Her üç dosya ayrı test-records yedeğine SHA-256 doğrulamasıyla kopyalandı ve yalnızca bunlar kaldırıldı. cleanup.json dosya listesini içerir. Gerçek blog yazısı bulunmuyor; boş liste tasarımı çalışıyor. Kategoriler, 21 proje ve 67 özgün görsel değiştirilmedi.

## Testler

- Temiz npm ci: proje içi cache ile 114 paket kuruldu, 0 güvenlik açığı bildirildi. İlk deneme ortamın global cache erişim izni nedeniyle başarısızdı; proje cache'iyle tamamen yeniden kurularak giderildi. Bağımlılık sürümü değiştirilmedi.
- Production build ve günlük veri doğrulamaları başarılı.
- Mevcut 16 test grubu başarılı: tarihsel geçiş, proje/CMS, esneklik, UUID/arşiv, blog, TR/EN, çeviri referansı, resmî Pages CMS şeması ve workflow güvenliği. Beklenen geçersiz veri senaryoları reddedildi. suite-results.json ayrıntıları içerir.
- Önceki altı browser-evidence testi tarihsel kayıtları doğrular; yeni tarayıcı çalıştırması yerine sunulmaz.
- Bu aşamada yeni tarayıcı kontrolü: 1440, 768 ve 390 pikselde 18 rotanın toplam 54 görünümü; 42 modal, filtre, galeri büyütme/Escape, odak tuzağı/odağın geri dönmesi, mobil menü, dil geçişi. Yatay taşma ve yakalanan konsol hatası yok. browser-results.json ve screenshots/ kanıttır.
- Hizmet yan menüsünde eksik side-link sınıfı düzeltildi. Mevcut CSS kullanıldı; metin veya tasarım dili değiştirilmedi. Düzeltme sonrası 36 hizmet görünümü yeniden alındı; altı bağlantının blok düzeni doğrulandı. İlgili build/veri/tarihsel testler tekrar başarılı.
- Önceki ekran görüntüleriyle dosya hash'leri aynı değil (54/54 farklı). Yakalama kalitesi/font rasterizasyonu farklı; piksel eşitliği iddiası yok. visual-comparison.json düzeltme öncesi ikili karşılaştırmayı korur, geçiş kriteri olarak kullanılmaz. Ekran/taşma/davranış kontrolü ayrıca yapıldı.
- 115 yerel HTTP/bağlantı/özel dosya erişim kontrolü başarılı. http-results.json.
- Altı ek release-preflight grubu başarılı: 18 karşılıklı dil rotası, canonical/hreflang, her HTML'de tek GA4 loader/config, JSON-LD parse/context/type, domain/robots/RSS/404, izinli silmeler, 67 kaynak+çıktı görsel hash'i ve proje/kategori/medya kaydı değişmezliği.

## İçerik, SEO ve erişilebilirlik

20 HTML çıktı: 9 Türkçe + 9 İngilizce indekslenebilir sayfa ve iki noindex 404. Mevcut sekiz Türkçe URL korunuyor. İki dilde toplam 42 kart ve 42 detay, 21 proje, 67 özgün PNG. İki RSS ve iki dili kapsayan sitemap var. Taslak/gelecek içeriklerin görünmezliği, tam yayın sınırı, bağımsız dil durumları ve eşleştirme çakışmaları otomatik test edildi. Mevcut İngilizce metinlere yeni deneyim/başarı eklenmedi.

Klavye/modal odak ve mobil menü kontrolleri başarılı; bu tam WCAG veya ekran okuyucu sertifikası değildir. JSON-LD yerel yapısal doğrulamadan geçti; Google Rich Results canlı testi yapılmadı. GA4 tek yükleme statik olarak doğrulandı; yerel CSP analytics ağını engeller, gerçek event teslimi canlı sonrası DebugView ile kontrol edilmelidir. İletişim bağlantıları kontrol edildi, mesaj gönderilmedi.

Gerçek CMS oluşturma/düzenleme/yükleme/TR referans seçimi kabulü kullanıcı tarafından tamamlandı; uzak CMS commit'i çeviri referansını doğruluyor. Bu aşamada kullanıcı adına CMS kaydı oluşturulmadı veya gerçek editör Save testi tekrarlanmadı.

## Yayın güvenliği ve kalan işlemler

Üretim workflow'u yalnızca ops/github-actions/publish.yml.example konumunda; etkin değil. main + repository + ENABLE_SITE_DEPLOY kapısı, kısıtlı izinler, needs/environment/concurrency, 7 günlük github-pages artifact'i doğrulandı. Günlük 06.00 UTC = 09.00 Türkiye; gecikme ve sonraki başarılı build sınırı geçerlidir. CMS üretimde main'i seçmelidir.

Ayrı onay sonrası adımlar ve manuel geri dönüş ops/github-actions/RELEASE-PLAN.md içinde. Özellikle legacy kaynakla main'e önce merge edilmemeli; onaylı Source geçişi ve workflow aktivasyonu planlı sırada yapılmalı. Source değişiminde kesintisizlik garanti edilemez. GitHub Pages'in bilinmeyen İngilizce yol için kök Türkçe 404 sunması olasıdır; yerel İngilizce fallback canlı kanıtı değildir. Otomatik rollback yok: çalışan işleri iptal etme, bayrağı kapatma, normal revert veya yedekten eski ağacı yeni commit ile kurtarma ve gerekirse legacy main/ kaynağına manuel dönüş gerekir.
