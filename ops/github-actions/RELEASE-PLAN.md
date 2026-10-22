# Kontrollü üretim geçişi ve geri dönüş planı

Bu belge **uygulanmış dağıtım değildir**. Main merge/push, Pages Source değişikliği, yayın bayrağı ve gerçek deploy için ayrıca kullanıcı onayı gerekir. Şu an yalnızca geliştirme dalı değişir.

## Doğrulanmış başlangıç

- Main/canlı kaynak commit'i: `63c3f30b2d1af4fc178ccac295aaf0ae89adaabf`.
- Kaynak: Pages `legacy`, `main`, `/`; özel domain `anilaslakci.com.tr`, HTTPS zorunlu.
- `github-pages` environment mevcut, izin verilen deployment branch yalnızca `main`.
- `ENABLE_SITE_DEPLOY` değişkeni yok. Aktif tek kullanıcı workflow'u dağıtım yapmayan doğrulama workflow'udur.
- Apex A kayıtları GitHub Pages'in dört `185.199.10x/11x.153` adresine gidiyor. DNS değişikliği gerekmiyor.
- Geliştirme main'in devamı; başlangıçta 0 geride / 18 ileride. Geçiş anında yeniden kontrol edilmeli.
- Bağımsız ZIP ve tam Git bundle yedekleri `.migration-backups/phase-9-exact/`; SHA-256 ve Git nesnesi karşılaştırmaları `migration/phase-9/backups.json` içinde. İkinci cihaz/ortama kopyalamak önerilir; aynı disk donanım kaybını kapsamaz.

## Hazır üretim dosyası

`ops/github-actions/publish.yml.example`, onaydan sonra **aynı içerikle** `.github/workflows/publish.yml` konumuna kopyalanacak tam workflow'dur. Bu aşamada kopyalanmadı.

- Push: yalnızca main. PR tetikleyicisi yok. Manual ve cron çalışmaları da main/repository/onay bayrağı koşullarını geçmek zorunda.
- Build: Node 24, tam Git geçmişi, persist-credentials kapalı, `npm ci --ignore-scripts`, temiz çıktı, blog/TR-EN/güvenlik testleri.
- Artifact: yalnızca `_site`, adı `github-pages`, saklama 7 gün. Kaynaklar/yedekler artifact'e girmez. Yaklaşık 8 MB normal çıktı, GitHub'ın artifact sınırlarının çok altında; symlink eklenmemeli.
- Deploy: build'e `needs`, `pages: write` + `id-token: write`, `github-pages` environment ve aynı artifact adı. Build'in genel yetkisi yalnızca `contents: read`.
- Concurrency: tek üretim grubu, çalışan deploy iptal edilmez. GitHub eski bekleyen işleri daha yeni bekleyen işle değiştirebilir; her CMS commit'inin ayrı deploy göreceği garanti değildir, en güncel build esas alınır.
- Cron `0 6 * * *`: güncel Türkiye saati 09.00. Schedule varsayılan main dalından çalışır; gecikebilir. Tarihi gelen kayıt sonraki başarılı build'de görünür. Günlük kontrolden hemen sonraki yayın ertesi günü bekleyebilir. Daha sık cron ancak ayrı üretim kararıyla değiştirilmeli.
- CMS üretimde main'i düzenlediğinde push build/deploy başlatır. Editörün hâlâ geliştirme dalını düzenlemesi canlıyı güncellemez; kullanıcı main'i seçmelidir. Taslak içerik commit'i de build başlatabilir, taslağın kendisi yayımlanmaz.
- `configure-pages` eklenmedi: generator domain/pathPrefix'i açıkça biliyor; Pages ayarını otomatik etkinleştiren bir adım gerekli değil.

## Onay sonrası sıralı geçiş

1. Kısa bir CMS düzenleme aralığı planlayın. Son CMS commit'lerini alın; temiz çalışma alanını ve uzak main/development commit'lerini tekrar kaydedin. Çatışma varsa durun; force veya içerik kaybıyla çözmeyin.
2. Main ve geliştirme ZIP/bundle yedeklerini yeni isimlerle tekrar oluşturun, bütünlüğünü doğrulayın. Yedekleri proje dışında ikinci konuma da kopyalayın. Main için PR incelemesi/branch korumaları önerilir; mevcut ayarlar bu aşamada değiştirilmedi.
3. Ayrı üretim onayı kapsamında örneği geliştirme dalına `publish.yml` olarak kopyalayın. `ENABLE_SITE_DEPLOY=true` yerel ortamıyla güvenlik testini çalıştırın. Bu yalnızca yerel testtir, deploy başlatmaz. Test, kopyanın onaylı örnekle aynı olmasını zorunlu tutar.
4. Yalnızca onay kapsamında GitHub repository variable `ENABLE_SITE_DEPLOY=true` yapın. Main'de henüz üretim workflow'u bulunmadığından bu değişkeni tek başına eklemek deploy başlatmaz. Geliştirme push'u da workflow'un main koşulunu geçemez. Kopyayı geliştirme dalında push edin ve CI'ı bekleyin. Mevcut validator, gerçek publish dosyası varsa bu açık bayrağı gerektirir; bu kontrol atlanmamalı.
5. Bakım aralığında Pages → Build and deployment → Source'u **GitHub Actions** olarak değiştirin. Custom domain ve Enforce HTTPS değerlerini aynen koruyun; domaini silip yeniden eklemeyin, DNS'e dokunmayın. CNAME dosyası çıktı içinde korunur ama custom Actions yayınında esas domain ayarı Pages ayarıdır; CNAME tek başına domain kurmaz.
6. Main'i değiştirmeden eski URL'nin hâlâ cevap verdiğini kontrol edin. GitHub'ın kaynak değişiminde kesintisiz eski artifact'i tutacağı garanti edilmez. Beklenmeyen 404/domain kaybı varsa merge etmeden manuel geri dönüşe geçin.
7. İncelenen geliştirme dalını onaylı PR ile main'e normal merge edin; geçmişi yeniden yazmayın. Kaynak Actions'a önceden geçirildiğinden yanlışlıkla kök kaynak dosyalarını legacy/Jekyll ile yayımlama riski azaltılır. Merge main-push üretim workflow'unu tetikler.
8. Build ve deploy sonuçlarını ayrı izleyin. Test/build/artifact hatası varsa deploy başlamamalı. Gerekirse onaylı main üzerinden workflow_dispatch ile yeniden çalıştırın; geliştirme/PR üzerinden dağıtım denemeyin.
9. Başarılı artifact SHA'sını, run bağlantısını ve deploy zamanını kaydedin. Aşağıdaki smoke kontrolleri bitmeden geçiş tamamlandı demeyin.

## İlk canlı smoke sırası

1. HTTPS ana sayfa ve sertifika; özel domain, yanlış `/mysite/` öneki veya yönlendirme döngüsü olmaması.
2. Mevcut sekiz TR URL + `/blog/`, karşılık gelen dokuz EN URL; self canonical, html lang, karşılıklı hreflang.
3. Masaüstü ve mobil dil geçişi, menü, intro ve iletişim mailto/LinkedIn bağlantıları. Gerçek mesaj gönderilmesi gerekmez.
4. İki dilde portfolyo 21 kart, modal/filtre/galeri ve klavye; özgün görseller yükleniyor mu?
5. Sitemap ve iki RSS; taslak/gelecek/test içeriklerinin bulunmaması; favicon/OG görselleri; robots erişimi.
6. Bilinmeyen bir TR ve EN yolunda **HTTP 404** ve noindex. GitHub Pages kök `404.html` sunar; yerel önizlemenin EN yolu için EN 404 seçmesi GitHub'ın davranış kanıtı değildir. Kök 404 Türkçe varsayılandır, İngilizce 404 bağlantısı vardır; doğrudan `/en/404.html` noindex sayfası 200 olabilir.
7. GA4 tek loader/tek config ve izinli kullanıcı oturumunda DebugView/Realtime tek page_view kontrolü. Yerel önizleme analytics ağını bilerek engeller; statik kod kontrolü gerçek veri teslimini kanıtlamaz.
8. Gerçek içerik yayımlamadan, kullanıcı onayıyla CMS main dalı taslak kaydının CI/deploy akışını kontrol edin; test verisi ancak ayrıca izinli biçimde oluşturulmalı/temizlenmeli.

## Geri dönüş: otomatik garanti yok

**Önce otomasyonu durdurun:** onay kapsamında `ENABLE_SITE_DEPLOY=false` yapın, GitHub Actions'taki çalışan/bekleyen üretim run'larını iptal edin. Değişkeni kapatmak başlamış bir deploy'u geçmişe dönük durdurmaz. Gerekirse üretim workflow'unu ayrıca devre dışı bırakın. Bu aşamaların hepsi hesap yetkisi ve kullanıcı onayı gerektirir.

**Yeni mimaride bir önceki sürüme dönüş:** kaynak Actions kalabilir. Sorunlu içerik/kod commit'ini main'de normal `git revert` ile geri alın; doğru commit'i build/test edip ayrı onayla yeniden dağıtın. Deploy kapısı kapalıyken otomatik yayın beklemeyin. Eski run'ın “Re-run” işlemi yeni artifact üretir ve mevcut ayarlar/bağımlılıklar başarısız olabilir; garantili tek tuş kurtarma sayılmaz. Saklanan 7 günlük artifact de otomatik rollback sağlamaz.

**Eski legacy siteye tam dönüş:**

1. Otomasyon kapalı ve run'lar iptal edilmiş olmalı.
2. Bağımsız `live-main.bundle` veya `live-main.zip` içinden `63c3f30...` ağacını geçici ayrı çalışma alanında kurtarın. Orijinal çalışma alanındaki yeni CMS içeriklerini silmeyin.
3. Sorunlu merge commit'i biliniyorsa main'de `git revert -m 1 <merge>` kullanımı incelemeyle değerlendirilebilir. Sonraki CMS değişiklikleri varsa körlemesine uygulanmamalı. Alternatif: kurtarılan eski ağacın dosyalarını normal yeni bir geri dönüş commit'inde main'e taşıyın; force reset/push yapmayın. Yeni içerikler yedekte kalmalı.
4. Main'in kök HTML/görseller/CNAME bakımından eski sürümle eşleştiğini kontrol edin. Üretim workflow'unun kapalı/çıkarılmış olmasını doğrulayın.
5. Pages Source'u onayla tekrar Deploy from a branch → main → `/` yapın. Domain/HTTPS değerlerini koruyun. Legacy build'i ve HTTPS smoke testini bekleyin.
6. Kaynak değişikliği, sertifika, cache veya GitHub hizmeti kaynaklı gecikme olabilir. Kesinti süresi ve otomatik kurtarma garanti edilemez. Hata sürerse Pages build/deploy logları ve domain durumu üzerinden manuel kurtarma gerekir; DNS'i gereksiz yere değiştirmeyin.

## Mevcut karar

Geliştirme kontrolleri tamamlanıp son CI yeşil olduğunda **kontrollü canlıya geçişe hazır** kabul edilir. Üretim ayarlarının yapılmamış olması bu aşamanın bilinçli sınırıdır; ayrı nihai onay, yetkili Source/bayrak işlemleri ve canlı smoke doğrulaması hâlâ gerekir. Canlı dağıtım bu belgede veya bu hazırlıkta gerçekleştirilmedi.

Kaynaklar: [GitHub custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Custom domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [Schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
