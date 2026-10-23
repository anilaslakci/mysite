# Yayın ve doğrulama sınırı

## Şu anda etkin olan

`.github/workflows/validate.yml` yalnızca doğrulama yapar. Geliştirme dalına push, main hedefli PR veya workflow_dispatch tanımı vardır. Manuel düğmenin kullanılabilirliği GitHub'ın varsayılan dalda workflow bulunması kuralına bağlıdır; geliştirme dalında garanti edilmez. Workflow `contents: read` kullanır, checkout kimliğini saklamaz, deploy/Pages yazma yetkisi almaz. `npm ci --ignore-scripts`, dondurulmuş tek saatle site testleri, izole blog senaryoları ve workflow güvenlik kontrolü çalışır. Örnek QA yazıları yalnızca ignored test dizininde oluşur.

Resmî checkout/setup-node Action commit'leri `action-pins.json` içinde sabitlenmiştir. Actions için ayrı ücretli servis kurulmadı.

## Etkin olmayan yayın taslağı

`publish.yml.example` `.github/workflows` dışında olduğundan GitHub bunu çalıştırmaz. İçeriği, sonraki onaylı canlı geçiş içindir:

- main içerik değişikliği sonrası yayın,
- günlük `0 6 * * *` UTC kontrolü (güncel UTC+03 Türkiye saatiyle 09.00),
- isteğe bağlı manuel tetikleme,
- main + doğru repository + `ENABLE_SITE_DEPLOY == 'true'` repository değişkeni şartı,
- ayrı build/artifact ve Pages deploy işleri,
- yalnızca deploy işinde `pages: write` ve `id-token: write`,
- aynı anda tek üretim dağıtımı.

Zamanlanmış workflow varsayılan dalda bulunmalıdır. GitHub zamanlaması gecikebilir; 09.00 kesin teslim garantisi değildir. Yalnızca günlük kontrol varsa örneğin 09.01 tarihli, önceden commit edilmiş yazı ilk sonraki build'de görünür; başka içerik değişikliği yoksa bu ertesi gün 09.00 kontrolü olabilir. Daha sık kontrol istenirse yeni onaylı yayın planında cron aralığı değiştirilmelidir.

## Canlıya geçiş için ayrı onaydan sonra

1. Gerçek CMS kabulünü ve gerçek yazı/içerik incelemesini tamamla; QA dosyalarını gerçek koleksiyona koyma.
2. main ve domain yedeklerini, mevcut Pages kaynağını kaydet; staging/yerel çıktı kontrolü yap.
3. İncelenen şablonu `.github/workflows/publish.yml` olarak yerleştir; değişiklikleri onaylı süreçle main'e al. `test-workflow-safety` bu dosyaya yalnızca açık `ENABLE_SITE_DEPLOY=true` onayı ve şablonla birebir yapılandırma eşleşmesi durumunda izin verir.
4. Ayrı onay kapsamında Pages yayın kaynağını GitHub Actions'a geçir; mevcut özel domain/HTTPS ayarlarını koru. Şimdi bu işlem yapılmadı.
5. Repository değişkeni `ENABLE_SITE_DEPLOY=true` yalnızca onaylı aktivasyonda ayarlanmalı. Değişken CI testlerine aktarılır; tek başına validation workflow'una deploy yetkisi vermez.
6. İlk üretim dağıtımını, canonical/sitemap/RSS/404/CNAME ve gerçek UTC/İstanbul yayın sınırlarını kontrol et. Sonra cron kabulünü izle.

Geri dönüş: üretim workflow'unu kapatmak, onay bayrağını kaldırmak ve önceki doğrulanmış kaynağa geri dönmek ayrı canlı operasyonudur. Bu geliştirme görevi sırasında workflow etkinleştirme, Pages ayarı, DNS veya main değişikliği yapılmaz.

Kaynak: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule
