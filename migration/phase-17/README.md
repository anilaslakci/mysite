# İlk dört Türkçe blog rehberi

26 Ekim 2026 tarihinde dört yazı mevcut Eleventy/Pages CMS modeline eklendi. Kayıtlar `published`, yayın zamanı `2026-10-26T09:00:00+03:00` olarak ayarlandı. Hepsi aynı gün yayımlanır; haftalık tarih dağılımı yapılmadı. Böylece karşılıklı gövde bağlantıları ilk yayında da geçerlidir. Mevcut günlük yayın workflow’u değişmedi.

| Yazı | Görünen gövde kelime sayısı |
| --- | ---: |
| ROAS | 1.978 |
| Trendyol kârlılığı | 2.043 |
| Meta reklamları | 2.145 |
| Dropshipping | 2.017 |

Sayım başlık ve tablo değerlerini kapsar; HTML etiketleri, URL’ler ve görsellerin alt öznitelikleri hariçtir. Her yazıda dört SSS, en az iki gövde içi ilgili yazı bağlantısı, üç ilgili kayıt ve doğal CTA bulunur. Altı mevcut hizmet sayfasına uygun bağlamlarda bağlantı verildi. İletişim için mevcut `/#iletisim` hedefi kullanıldı.

## Dosyalar ve görseller

Dört UUID adlı Markdown kaydı, `reklam-performans` kategorisi, sekiz özgün SVG ve sekiz PNG sunumu eklendi. Her yazının bir kapağı ve bir açıklayıcı şeması vardır. PNG boyutları 19.372–26.814 bayttır. SVG kaynakları düzenlenebilir; mevcut CMS doğrulaması ve sosyal paylaşım uyumluluğu için sayfalarda PNG kullanılır. Yeni bağımlılık eklenmedi.

İngilizce yazı veya çeviri ilişkisi oluşturulmadı. Kayıtların `locale` değeri `tr`; `translationKey` ve `translationOf` alanları boş bırakıldı. Mevcut sistem eşleştirme kimliğini kayıt UID’sinden çözümler. Gerçek olmayan İngilizce hreflang bağlantısı üretilmez.

## Editoryal doğrulama

Gelir, reklam sonrası katkı ve net dönem kârı ayrılır. Hesaplar varsayımsaldır; gerçek müşteri sonucu veya sektör ortalaması değildir. Trendyol için doğrulanmamış güncel komisyon/kargo tarifesi yayımlanmadı; geçerli anlaşma ve faturalar esas alınır. Dropshipping için gelir garantisi verilmez.

Meta’nın bazı yardım/API sayfaları oturum veya 429 erişim sınırlaması verdi. Güncel panel seçenekleri, kesin öğrenme süresi veya evrensel bütçe değiştirme eşiği doğrulanmış gibi sunulmadı. Temel açık artırma ve otomasyon açıklamaları erişilebilen resmî Meta kaynaklarıyla desteklendi.

Başlıca resmî kaynaklar — 26 Ekim 2026:

- [Google Ads dönüşüm değerleri](https://support.google.com/google-ads/answer/13064207?hl=en)
- [Google Ads Hedef ROAS](https://support.google.com/google-ads/answer/6268637?hl=tr)
- [Trendyol iş ortaklarına özel uygulamalar](https://www.trendyol.com/s/is-ortaklarina-ozel)
- [Trendyol Akademi](https://akademi.trendyol.com/)
- [Meta Andromeda teknik açıklaması](https://engineering.fb.com/2024/12/02/production-engineering/meta-andromeda-advantage-automation-next-gen-personalized-ads-retrieval-engine/)
- [Meta açık artırma açıklaması](https://about.fb.com/wp-content/uploads/2023/01/Toward_fairness_in_personalized_ads.pdf)
- [Shopify dropshipping modeli](https://help.shopify.com/en/manual/products/dropshipping/what-is-dropshipping)
- [Shopify avantaj ve dezavantajlar](https://help.shopify.com/en/manual/products/dropshipping/what-is-dropshipping/features-of-dropshipping)
- [Amazon dropshipping açıklaması](https://sell.amazon.com/learn/what-is-dropshipping)

## Teknik kabul

`npm test`, blog senaryoları, TR/EN, çeviri ilişkileri ve workflow güvenliği geçti. Build; sitemap, iki RSS, canonical, JSON-LD, görseller, iç bağlantılar ve anchor hedeflerini doğruladı. Mevcut consent, navigasyon, header ve intro grupları başarılı.

`test-editorial-launch.mjs` bu yayın için manuel kabul testidir; günlük build’e eklenmedi. Gelecekteki bilinçli içerik değişiklikleri tarihsel manifest nedeniyle engellenmez. Test; uzunluk, SSS, metadata, görseller, related kayıtları ve temel örnek hesaplarını kontrol eder. Manifestte kaynak hash değerleri bulunur.

`test-editorial-browser.mjs`, kurulu Playwright/Chrome ile 390, 768 ve 1440 px genişliklerde dört yazıyı kontrol eder: toplam 12 detay görünümü; TR listesinde dört kart; reklam kategorisinde iki kart; EN listesinde sıfır yazı. Kapak ve inline görseller yüklendi, alt metinler mevcut, üç ilgili yazı üretildi. Tek H1, canonical, BlogPosting, yanlış EN alternate olmaması, yatay taşma ve konsol hataları kontrol edildi. Onay öncesinde Google Analytics isteği oluşmadı.

Fiziksel telefon/Safari ve gerçek Pages CMS editöründe yeni bir Save işlemi test edilmedi. Mevcut CMS kayıt biçimi ve medya kuralları korunur. Test motoru için `PLAYWRIGHT_MODULE`, URL için `TEST_BASE_URL`, kanıt dizini için `TEST_EVIDENCE_DIR` kullanılabilir; projeye ek bağımlılık gerekmez.

Geri dönüş gerektiğinde mevcut RELEASE-PLAN ve normal PR revert yöntemi geçerlidir. Force push/reset veya yeni harici yedek döngüsü kullanılmadı.
