# Anılaşlakcı.com.tr yanıt başlıkları

Üretim GitHub Pages üzerinden yayınlanır. Canlı HTTP yanıtında görülen
`Access-Control-Allow-Origin: *` değeri GitHub Pages/Fastly katmanından gelir.
Eleventy bu başlığı üretmez. Bu dosya tek başına canlı HTTP yanıtını değiştirmez.

## Cloudflare Response Header Transform Rule

Alan adı Cloudflare üzerinden vekillendiğinde **Rules → Transform Rules →
Modify Response Header** altında aşağıdaki filtreyle bir kural oluşturun.

```text
(http.host eq "anilaslakci.com.tr")
```

`Access-Control-Allow-Origin` için **Remove** seçin. Aynı kaynakta çalışan
site dosyaları bu başlığa ihtiyaç duymaz. Harici RSS istemcileri veya tarayıcı
entegrasyonları varsa etkisini ayrıca kontrol edin.

Diğer başlıklar için **Set static** kullanın.

| Başlık | Değer |
| --- | --- |
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| X-Frame-Options | `DENY` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` |

HSTS için önce tüm alt alan adlarının geçerli HTTPS sertifikasıyla çalıştığını
doğrulayın. `preload` isteğe bağlıdır ve ancak bu doğrulamadan sonra değerlendirilir.

## CSP gözlem kuralı

Başlangıçta başlığı **Content-Security-Policy-Report-Only** adıyla ekleyin.
İhlalleri tarayıcı konsolundan inceleyin.

```text
default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'none'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://www.google-analytics.com https://*.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com
```

Mevcut inline olay işleyicileri, intro önyükleme kodu, JSON-LD ve dinamik
stiller nedeniyle örnek başlangıçta gevşektir. Google Fonts izinleri, başlığı
korunan `/en/blog/` için gereklidir. Bu istisna kalktığında font kaynaklarını
daraltın. Raporları inceleyip onaylı GA4, menü, intro, portfolyo ve
lightbox akışlarını test etmeden zorlayıcı CSP'ye geçmeyin. Son durumda
`curl -I https://anilaslakci.com.tr/` ile başlıkları kontrol edin.

[Cloudflare yanıt başlığı kuralları](https://developers.cloudflare.com/rules/transform/response-header-modification/)
