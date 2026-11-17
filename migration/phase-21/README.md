# Portfolyo proje ekleme ve kategori düzeni — 17 Kasım 2026

Başlangıç main: `7ca2fd58b26cf675f53faa385b28cbe6a4b9635d`.

## İçerik

| Yeni proje | Kategori | Görsel |
|---|---|---:|
| RC700 Heating Monitor | Diğer | 2 |
| MacroLift | Mobil Geliştirme | 4 |
| Fatura Kontrol ve Paraflama | Operasyon Otomasyonu | 2 boş ekran |
| Kişiselleştirilebilir Mobilya Takımı Oluşturucu | Süreç Geliştirme | 0 |

Her proje tek UUID kaydında ayrı TR/EN metinleriyle oluşturuldu. Mevcut 1–21 kimlikleri ve sıraları korunur; yeni kayıtlar 22–25 gösterim sırasıyla eklenir. Sağlanmayan demo/indirme bağlantısı veya sonuç metriği üretilmez. Takım oluşturucuda müşteri markası ve ekran görüntüsü bulunmaz. T-Soft sınırlaması kullanılan kurulumun standart akışı bağlamında anlatılır; tüm platform sürümleri hakkında evrensel iddia üretilmez.

RC700 termostatın ısıtma talebini ölçer; doğrudan brülör süresi, gaz sayacı veya kesin fatura hesabı gibi sunulmaz. Erişilebilir bulut geçmişi ve yerel kayıt birikimi sınırı belirtilir. MacroLift'te geçmiş besin değerlerinin korunması ve kaydetmeden önce düzenlenebilir AI tahminleri açıklanır. Fatura uygulamasında nihai kullanıcı kararı, sözleşme/mutabakat yapmama ve görsel parafın elektronik imza olmaması korunur.

## Kategoriler ve arşiv

- `10`: Finans → Diğer; içerikte başka değişiklik yok.
- `19`, `4`: Veri Analizi → Süreç Geliştirme; içerikte başka değişiklik yok.
- `process-improvement`: Süreç Geliştirme / Process Improvement, `#FF6B6B`, eski Finans sırası 4.
- Finans kategori kaydı arşivlenir. Filtrelerde görünmez, referans kalmaz; geri dönüş için metadata silinmez.
- `9` Sırlar Dünyası arşivlenir; kartı ve iki dilde modalı üretilmez. Kaynak ve eski görseller silinmez. Bu işlem giriş kontrolü olan özel galeri oluşturmaz; eski medya URL'leri fiziksel olarak korunur.

Sonuç: 25 saklanan kayıt, 24 görünür proje, iki sayfada toplam 48 detay penceresi, 7 kullanılan kategori. Eski 67 özgün görsel korunur; 8 ek görselle kayıtlı medya sayısı 75 olur.

## Fatura görsellerinin gizliliği

Kullanıcının izin verdiği veri olmayan ekran alternatifi seçildi. Yalnızca boş analiz ve boş sınıflandırma ekranları alındı. Bu iki ekran görsel olarak incelendi: tutar/fatura numarası, dolu dosya listesi veya paraf yok. Dolu iki ekran ve imza önizlemesi depoya, çıktı klasörüne veya test ekran görüntülerine kopyalanmadı. Bulanıklaştırma yapılmış gibi raporlanmaz: hassas görsel hiç kullanılmaz. Orijinal kullanıcı dosyaları değiştirilmez.

RC700 ve MacroLift için seçilen ekranlar da dahil tüm 8 dosya bayt düzeyinde kopyalandı. MacroLift JPEG metadata incelemesinde GPS veya kullanıcı yorumu alanı bulunmadı. Medya kaynak dosyası adları ve SHA-256 değerleri `change-manifest.json` içindedir.

## Testler

- Production `npm test`: dinamik portfolyo, sekiz eski URL/SEO, blog çıktısı, TR/EN, consent, header, intro ve footer kontrolleri başarılı.
- `test:blog`: 14 senaryo grubu ve 16 geçersiz veri reddi; CMS tarih sözleşmesi başarılı.
- `test:i18n`: 10 çok dil ve 11 çeviri referans grubu başarılı.
- `test:cms-schema`: gerçek upstream ConfigSchema ve iki olumsuz şema testi başarılı. Yerel Node 26, `stripTypeScriptTypes` için eski `transform` modunu reddettiğinden yalnızca test aracında `strip` kullanıldı; şema kuralları ve site davranışı değişmedi.
- `test:workflow`: mevcut main-only yayın güvenliği başarılı. Workflow, domain, HTTPS, CMS yapılandırması ve blog tarihleri değiştirilmedi.
- `node scripts/test-portfolio-november-release.mjs`: eski dosya hash'leri, izinli alan değişiklikleri, kategori/arşiv geçişleri, 24/25 sayıları, 8 izinli medya ve UUID çakışma koruması başarılı.
- Chrome headless: 360/390/768/1440 px, iki dilde her projeye gerçek tıklama; toplam 192 modal açma/kapama, tüm filtreler, yeni galeriler, zoom, Escape, odak ve scroll geri dönüşü başarılı. Yatay taşma, yeni sayfa hatası veya onay öncesi Google isteği yok. Fiziksel telefon/Safari ve gerçek CMS Save testi değildir.

Yeni kabul testleri `scripts/test-portfolio-november-*.mjs`, ekran görüntüleri `browser/` altında. İlk 21 kaydı veya Finans kategorisini sabitleyen tarihsel geçiş fixture'ları yeni günlük doğrulama gibi kullanılmaz ve değiştirilmez. Normal build güncel veriyle dinamik çalışır.

## Koruma ve geri dönüş

`baseline.json`, değişiklik öncesi içerik, asset, şablon, istemci kodu, CMS ve workflow hash'lerini tutar. Yalnızca proje 4/19/10 için category, 9 için archived ve Finans için archived değişikliğine izin verilir; diğer eski içerik ve görseller aynı kalır. Değişecek beş kaydın yerel kopyaları ayrıca `.migration-preview/portfolio-november/before` içindedir. Fatura verisi veya paraf bu yedeğe de alınmaz.

İçerik arşivleme alanları geri açılabilir; eski kimlikler değişmez. Tam sürüm geri dönüşü gerekirse release planına göre normal Git revert kullanılır, force push/reset gerekmez. Sonradan CMS değişikliği varsa körlemesine revert yerine yeni kayıtlarla karşılaştırılarak uygulanır. Yeni harici yedek döngüsü başlatılmadı.

GitHub CI, PR ve gerçek Pages deploy sonucu ayrı doğrulanır. Canlı kabulde iki portfolyo URL'si, 24 kart/24 modal, süreç filtresindeki üç kayıt, kaldırılan Finans filtresi, gizlenen 9 ve 8 yeni medya kontrol edilir. Blog uygunluğu gerçek tarih filtresine göre korunur; bu görevde yeni blog yayını oluşturulmaz.
