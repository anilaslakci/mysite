# Blog ve çok dilli site için mimari hazırlık

Bu belge sonraki aşamalar için tasarımdır. Blog koleksiyonu, yayın workflow'u, RSS veya İngilizce sayfa bu revizyonda oluşturulmadı. Yeni bağımlılık ve kullanılmayan soyutlama eklenmedi.

## Blog veri sözleşmesi önerisi

Yeni onaylı aşamada `src/content/posts/` altında Markdown ve front matter; Pages CMS'de tek yazı koleksiyonu. Rich-text editörü seçilirse kaydedilen Markdown/HTML formatı pilot yazıyla round-trip test edilmeden bütün içeriklere uygulanmamalı. HTML biçimlendirmeli mevcut portfolyo alanları blog editörüne taşınmayacak.

Önerilen alanlar: `uid` (UUID), `translationKey`, `locale` (`tr`/`en`), `slug`, `title`, `description`, `status` (`draft`/`published`), `publishAt` (saat dilimi ofsetli ISO tarih), `updatedAt`, kategori, etiketler, kapak görseli ve alt metni. SEO başlığı/açıklaması için kontrollü varsayılanlar; canonical normalde ilgili kalıcı URL'den üretilmeli, gereksiz manuel URL alanı olmamalı. Başlık/slug değişiminde eski URL için açık yönlendirme planı gerekli.

Hedef URL'ler: Türkçe `/blog/` ve `/blog/<slug>/`; İngilizce `/en/blog/` ve `/en/blog/<slug>/`. Şimdiki sekiz URL korunacak. Özel domain altında `/mysite/` öneki kullanılmayacak.

Derleme başında tek bir `SITE_BUILD_TIME` değeri dondurulmalı. Yayına uygun kayıt `status === published` ve `publishAt <= SITE_BUILD_TIME` olmalı. Taslak ve gelecekteki kayıtlar yalnızca listeden gizlenmemeli: HTML URL'si, sitemap, RSS, kategori/etiket dizinleri ve ilişkili yazı bağlantılarından da dışlanmalı. Önceki çıktı temizlenmeli; mevcut `clean-site.mjs` yaklaşımı buna uygun bir başlangıçtır.

İleri tarihli yayın için yalnızca CMS tarih alanı yeterli değildir; yeni statik derleme gerekir. Sonraki yayın onayında GitHub Actions ile UTC tabanlı periyodik tetikleme ve manuel çalıştırma tasarlanmalı. Editoryal saat dilimi `Europe/Istanbul`; kaydedilen tarih açık ofset içermeli. Örnek: `2026-11-01T09:00:00+03:00`, UTC `06:00` demektir. Tarih/saat yorumlaması tarayıcının yerel saatine bırakılmamalı.

GitHub scheduled workflow varsayılan dal üzerinde çalışır; gecikebilir. Dakika hassasiyetinde yayın garantisi verilmemeli. Bu nedenle workflow'u geliştirme dalına koyup zamanlanmış yayın varmış gibi raporlamak doğru olmaz. Ücretsiz planın güncel kullanım sınırları, repo etkinliği ve zamanlama kısıtları yayın aşamasında tekrar kontrol edilmeli. Şimdi hiçbir workflow eklenmedi/etkinleştirilmedi.

Sitemap, RSS ve `BlogPosting` aynı yayın koleksiyonunu tüketmeli. `datePublished`, `dateModified`, görsel, yazar ve sayfa URL'si tutarlı üretilmeli. Yalnızca onaylı/yayımlanmış kayıtların metadata'sı sunulmalı. Testler yayın anından önce/tam eşikte/sonra; İstanbul gece yarısı; taslaktan yayına; tarihi ileri alma; tarih formatı hatası ve eski çıktı temizliği sınırlarını kapsamalı.

## Çok dilli site sözleşmesi önerisi

- Türkçe varsayılan ve mevcut kök URL'ler kalıcı. İngilizce ayrı `/en/` ağacında.
- Profesyonel İngilizce içerik ayrı hazırlanmalı; eksik çeviriyi Türkçe içerikle dolduran İngilizce URL üretilmemeli.
- Eşdeğer sayfalar URL metniyle değil sabit `translationKey` ile eşleşmeli. Dil değiştirici varsa eşdeğer yayımlanmış sayfaya gitmeli. Çevirisi yoksa yanlış eşdeğer veya bozuk bağlantı yerine ilgili dil seçeneği gizlenmeli; bölüm ana sayfasına dönüş tercih edilirse kullanıcıya açıkça gösterilmeli.
- Her dil kendi URL'sine canonical vermeli. Türkçe/İngilizce karşılıklı ve kendini de içeren mutlak `hreflang` bağlantıları, uygun `x-default`, doğru `html lang` ve dil bazında başlık/açıklama gerekir. İngilizce sayfanın canonical'ı Türkçe sayfa olmamalı.
- Yayınlanmayan/eksik çeviri hreflang ve sitemap'e eklenmemeli. Tarayıcı diliyle zorunlu otomatik yönlendirme yapılmamalı.
- Navigasyon, CTA, footer, galeri/detay başlıkları, boş durumlar, erişilebilirlik etiketleri ve hata metinleri dil sözlüklerinden gelmeli. Kişi/proje kimlikleri ve dosya yolları çevrilmemeli.
- Portfolyo şu an aynı URL'de JS ile dil değiştirir. Bu, bağımsız İngilizce SEO URL'sinin yerine geçmez. Sonraki aşamada aynı proje verilerinden yerel dil başlangıcı doğru iki sayfa üretilebilir; mevcut `/portfolyo/` korunmalı.

## Bugün saptanan sabit metin bağımlılıkları

| Yer | Mevcut bağımlılık | Sonraki aşamada yaklaşım |
| --- | --- | --- |
| `src/index.njk` | Türkçe intro, navigasyon, hero, bölüm metinleri, title/description/JSON-LD | Tasarım korunarak sayfa verisi ve UI sözlüğü; profesyonel EN sayfa |
| `src/_includes/layouts/service.njk` | `html lang="tr"`, ortak sayfa kabuğu | `locale` verisiyle dil, ortak SEO kısmi şablonu |
| `src/_includes/services/header.njk` | Projeler, Ana Siteye Dön, Uzmanlık ve sabit kök bağlantılar | Çeviri anahtarıyla dil bazında bağlantılar |
| `src/_includes/services/sidebar.njk` | Altı hizmet adı ve mevcut Türkçe yollar | Dil bazında navigasyon eşlemesi |
| `src/_includes/services/footer.njk` | Türkçe konum ve sabit 2026 | Dil sözlüğü; yıl değişikliği ayrıca regresyon kontrolü |
| Altı `src/<hizmet>/index.njk` | Türkçe hizmet metinleri ve SEO alanları | Dil başına içerik, ortak tasarım; eski yollar korunur |
| `src/portfolyo/index.njk` | İlk görünümde Türkçe hero/SEO/footer ve lang | Yerel dil sayfa verisi; aynı proje koleksiyonu |
| `src/assets/js/portfolio-1.js` | JS `STRINGS`, selector kimliklerine bağlı dil güncelleme | Tek sözlükten şablon ve JS verisi üretimi; URL diliyle tutarlılık |
| `lib/portfolio.mjs` | Detay/galeri başlıkları için ayrı `words` | JS/şablon sözlüğü tekrarının ölçülü birleştirilmesi |
| `sitemap.xml`, `robots.txt` | Elle tutulan mevcut URL listeleri | Blog/i18n geldiğinde aynı yayın koleksiyonundan sitemap |

Bu yerlerde sırf gelecekte kullanılacak diye şimdi metinler taşınmadı; tasarım ve mevcut SEO çıktısı korunuyor. Yeni portfolyo veri katmanı kimliği, sıralamayı, kategoriyi ve arşiv durumunu dilden ayırdığı için sonraki aşamayı engellemiyor.

## Sonraki uygulama kapıları

1. Yeni portfolyo CMS yapılandırmasının gerçek editör kabul testi.
2. Tek blog yazısıyla veri/editör/SEO pilotu; henüz otomatik yayın yok.
3. Yerel yayın tarihi sınır testleri ve sitemap/RSS/BlogPosting doğrulaması.
4. Ayrı onayla yayın workflow'u ve canlı geçiş.
5. Profesyonel İngilizce ana sayfa/hizmet içerikleri ve `/en/` pilotu; eşdeğer URL/hreflang testleri.

Başvurular:
- [Pages CMS UUID](https://pagescms.org/docs/configuration/fields/uuid/)
- [Pages CMS referans alanı](https://pagescms.org/docs/configuration/fields/reference/)
- [GitHub Actions schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
- [Google çok dilli sayfa bildirimi](https://developers.google.com/search/docs/specialty/international/localized-versions)
