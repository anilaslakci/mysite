# Pages CMS yayın tarihi uyumluluğu

## Kök neden

Sekiz Markdown kaydı `2026-11-02T10:00:00+03:00` gibi saniye ve açık saat dilimi içeriyor. `.pages.yml` ise `yyyy-MM-dd'T'HH:mm` bekliyordu. Eleventy bu ISO değerini doğru okurken Pages CMS date alanının `read` fonksiyonu date-fns ile katı biçim eşleşmesi yapıp `""` döndürüyordu. Böylece form ve liste tarihi boş kalıyordu. Önceki şema/yayın testleri alanın varlığını ve site yayın filtresini doğruluyordu; CMS tarih ayrıştırıcısıyla kayıt uyumunu kapsamıyordu.

Kaynaklar:

- https://pagescms.org/docs/configuration/fields/date/
- https://github.com/pages-cms/pages-cms/blob/main/fields/core/date/index.ts (`read`, `write`)
- https://github.com/pages-cms/pages-cms/blob/main/fields/core/date/view-component.tsx
- https://github.com/pages-cms/pages-cms/blob/main/fields/core/date/edit-component.tsx (`datetime-local`)

## Düzeltme

Yalnızca `publishAt` yapılandırması `yyyy-MM-dd'T'HH:mm:ss'+03:00'` biçimine geçirildi. Buradaki `+03:00` bilinçli bir **literal**: editörde girilen saat Türkiye duvar saatidir; bilgisayarın yerel saat dilimine çevrilmez. `xxx` / `XXX` kullanmak farklı saat dilimindeki bilgisayarda görünen veya kaydedilen saati kaydırabileceği için tercih edilmedi. Geçerli 2026 Europe/Istanbul UTC+03:00 düzeni esas alınır. Ülkenin saat uygulaması değişirse bu sözleşme ayrıca gözden geçirilmelidir.

CMS giriş değeri `2026-11-02T10:00`, disk değeri `2026-11-02T10:00:00+03:00`, UTC karşılığı `2026-11-02T07:00:00Z` olur. Yapılandırma desteklenen date-fns biçim dizgesini kullanır; desteklenmeyen timezone seçeneği eklenmez.

Hiçbir Markdown kaydı, yayın tarihi, gövde, görsel, URL, yayın filtresi, tasarım veya cron değiştirilmedi. `updatedAt` alanının mevcut dakika hassasiyetli Türkiye saati sözleşmesi de değiştirilmedi.

| Yazı | Değişmeyen kayıt zamanı | UTC |
|---|---|---|
| Trendyol / kendi site | 2026-11-02T10:00:00+03:00 | 07.00 |
| Google / Meta Ads | 2026-11-09T10:00:00+03:00 | 07.00 |
| Al-sat | 2026-11-16T10:00:00+03:00 | 07.00 |
| E-ihracat | 2026-11-23T10:00:00+03:00 | 07.00 |

Eski dört makalenin `2026-10-26T09:00:00+03:00` değerleri de aynen korunur ve artık CMS biçimine uyar. `published` tek başına yeterli değildir; `publishAt <= build time` koşulu devam eder. Gelecekteki CMS kaydı, saat gelmeden yayın oluşturmaz.

## Kabul testleri

- Resmî `read`/`write` fonksiyonlarının TypeScript tipleri kaldırılarak davranışı değiştirilmeden izole çalıştırıldı. CMS paketinin kullandığı date-fns 3.6.0 kullanıldı; projeye bağımlılık eklenmedi. Kaynak SHA-256 bilgileri `upstream-evidence.json` içinde.
- İstanbul, UTC, New York, Tokyo ortamlarında eski biçim sekiz kaydı da reddetti; yeni biçim sekizini de doğru okuyup aynı değere geri yazdı.
- Gerçek Chrome `datetime-local` alanında aynı dört saat dilimiyle açma, liste değeri ve düzenleme doğrulandı. `10:00` her yerde `10:00` kaldı; `11:15` düzenlemesi `11:15:00+03:00` kaydedildi. Bu, barındırılan tam CMS uygulaması değil; gerçek alan girdisi ve upstream dönüşüm kodunun izole testidir.
- Sadece test kopyasındaki ilk yazı 11.15'e alındı: gerçek Eleventy derlemesinde 11.14.59'da yok, 11.15.00'da var. Tam çıktı/SEO/JSON-LD/sitemap/RSS/dahili bağlantı denetimleri iki aşamada geçti. Orijinal dosyalar değişmedi.
- Kasım takviminin dokuz gerçek saat simülasyonu tekrar geçti. Kullanıcının istediği 2 Kasım 09.59/10.00, 9 Kasım 09.59/10.00, 16 ve 23 Kasım 10.00 sonuçları sırasıyla 0/1/1/2/3/4 yeni yazıdır.
- Kalıcı `test:cms-dates` kontrolü mevcut `test:blog` zincirine eklendi; böylece GitHub CI yapılandırma-kayıt uyumsuzluğunu yakalar. Tarihleri belirli değerlere dondurmaz; geçerli yeni CMS kayıtları desteklenir.
- Production build, blog, TR/EN, çeviri referansları, CMS resmî şeması ve workflow güvenliği yeniden doğrulanır. Eski dört yazı ve tüm görseller için Git farkı/bütünlük denetimi korunur.

Gerçek oturum açılmış Pages CMS'de kayıt kaydetme işlemi yapılmadı. Main'e geçişten sonra editör açık kaldıysa sayfa yenilenmeli; aynı alan tarih/saat gösterip düzenlemeye izin vermelidir. Bu oturumdaki doğrulama, barındırılan CMS kabulü olarak sunulmaz.

GitHub zamanlama gecikmesi sınırı değişmedi: yayın hedefi Türkiye saati 10.00, görünürlük ilk uygun başarılı yeniden derlemede oluşur. Main-only deploy, özel domain ve HTTPS korunur.
