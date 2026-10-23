# Blog formu ve makale seçimiyle çeviri eşleştirme

Başlangıç dalı `refactor/eleventy-cms-migration`. Kullanıcı CMS değişiklikleri fast-forward ile `e9f34b62cd1dfe7e337558ebac18fb47e352c647` commit'ine alındı. Bağımsız başlangıç yedeği `.migration-backups/phase-8/before-blog-ux.zip` içindedir. İki gerçek taslak, başlıkta kullanıcının yaptığı `Yazısı2` düzenlemesi dahil aynen korundu. Yüklenen `assets/blog/mvjg96t2-p5wd4qsu.png` ve 67 özgün portfolyo görseli korunur. Hiçbir kullanıcı içeriği yeniden yazılmadı veya silinmedi.

## Kullanıcı akışı

**Türkçe:** Blog Yazıları → Yeni yazı → Dil Türkçe → Başlık, kalıcı URL adı, özet, kategori ve içerik → Taslak/Yayında → Kaydet. “Bu yazı hangi makalenin çevirisi?” boş kalır. UUID otomatik, translationKey görünmez.

**İngilizce çeviri:** Yeni yazı → Dil İngilizce → “Bu yazı hangi makalenin çevirisi?” alanından Türkçe asıl yazıyı seç → İngilizce başlık/slug/özet/içerik → Durum ve tarih → Kaydet. Teknik kimlik kopyalamak gerekmez. Bağımsız İngilizce yazıda seçim boş kalabilir.

**Eski eşleştirilmiş kayıt:** Gizli `translationKey` korunur. Yeni alan boşsa eski ilişki devam eder. Başka bir Türkçe asıl yazı seçildiğinde yeni referans ilişkiyi belirler; eski ham translationKey dosyadan silinmez. Böyle bir eski kayıtta yeni seçimi temizlemek eski ilişkiyi geri getirir; tamamen bağımsızlaştırma için ayrıca kontrollü veri düzenlemesi gerekir. Bu sınır gizlenmez.

## Teknik yöntem ve CMS sınırları

Resmî `reference` alanı kullanılır: `collection: posts`, `value: '{fields.uid}'`, `label: '{fields.title} — {fields.locale}'`. Seçim dosyaya `translationOf: <asıl yazı uid>` olarak kaydedilir. Eleventy, `lib/blog-translations.mjs` ile asıl TR kaydını bulur ve onun `translationKey || uid` değerini yalnızca bellekte çözümler. CMS'nin başka alana dinamik veri kopyaladığı veya dosyaları otomatik güncellediği varsayılmaz.

Resmî reference seçeneklerinde locale filtresi veya koşullu görünürlük belgelenmedi. Liste bu yüzden her iki dili gösterebilir; başlık yanında `tr/en` görünür. Kullanıcı `tr` aslı seçer; EN hedef, kendi kendini seçme, TR kaydından referans verme, bulunamayan kaynak, yanlış tip/UUID ve aynı TR aslına ikinci EN kayıt build hatasıdır. Kontroller taslakları da kapsar. CMS'nin Save düğmesini bu kurallarla bloke ettiği iddia edilmez; geçersiz kayıt GitHub CI/build tarafından reddedilir ve yayın çıktısı üretilemez.

Gizli `uid` otomatik UUID olarak kaldı. `translationKey` gizli/salt okunur uyumluluk alanıdır. SEO başlığı boşsa title, meta açıklaması boşsa summary kullanılır. Dil seçimi Türkçe/İngilizce; durum Taslak/Yayında oldu. “Yayında” seçimi gelecekteki yayın tarihini atlamaz; açıklama bunu belirtir.

Kalıcı slug elle belirlenmeye devam eder. Pages CMS filename şablonları alan adına slug önerisi yazan bir mekanizma değildir; otomatik öneri varmış gibi yapılandırma eklenmedi. Başlık değişimi mevcut slug/dosya adını değiştirmez.

## Korunan SEO/yayın davranışı

URL'ler, canonical, yalnızca yayımlanmış gerçek eşdeğerler için karşılıklı hreflang/x-default, dile göre ilgili yazılar/kategoriler, iki RSS, sitemap ve İstanbul yayın saati aynı kalır. Her dil bağımsız taslak/tarih kullanır. EN çeviri silinirse veya taslak olursa TR kayıt değişmez ve EN karşılık bağlantısı üretilmez.

Yeni workflow, cron veya yayın altyapısı yoktur. Yeni kabul testi mevcut `test:i18n` komutuna bağlanmıştır; GitHub CI bu komutu zaten çalıştırır. Main, Pages kaynağı ve deploy kapıları değiştirilmez.

## Doğrulama

- Kullanıcının gerçek CMS commit'lerinde TR/EN taslak kaydı ve yüklenen PNG bulundu. Tekrar açma/düzenleme/kaydetme kullanıcının bildirdiği kabul kanıtıdır; bu oturumda tekrarlanmış sayılmaz.
- 11 otomatik referans/eşleştirme grubu: yeni alan yapılandırması, gizli kimlikler, legacy key, yalnızca referansla eşleşme, iki dil yayın, tek dil taslak/gelecek, tekrar/self/yanlış dil/eksik kaynak, eşleştirme çakışması, bağımsız EN ve çeviri silme.
- Testler gerçek taslakların izole kopyalarını kullandı. Yayın için eklenen QA gövdesi, tarih ve durum yalnızca ignored test klasöründedir. Gerçek Markdown dosyaları, portfolyo kayıtları ve yüklenen görsel bayt bayt korundu.
- Gerçek yerel tarayıcıda TR→EN→TR klavye geçişi ve doğru canonical doğrulandı; konsolda yeni hata/uyarı yok. Ekran görüntüsü `local-paired-preview.png` bir QA yayın önizlemesidir, gerçek yayın değildir.
- Günlük Eleventy/SEO/link/sitemap/RSS kontrolleri, önceki 14 blog grubu/16 negatif durum, 10 TR/EN grubu, 19 tarihsel koruma kontrolü ve 9 kayıt kontrolü başarılı. Resmî ConfigSchema yeni yapılandırmayı kabul etti.
- Bu tarayıcıdaki gerçek Pages CMS yine giriş ekranında kaldı. Yeni reference seçicisinin gerçek editörde seçim/Save/tekrar açma davranışı ve yeni görsel yükleme işlemi bu oturumda doğrulanmadı. Kullanıcı adına CMS kaydı düzenlenmedi veya silinmedi.

## Değişen dosyalar ve geri dönüş

`.pages.yml`, `lib/blog.mjs`, yeni `lib/blog-translations.mjs`, `scripts/test-blog-translations.mjs`, `package.json` ve bu aşamanın rapor/kanıtları. Tasarım, şablonlar, proje kayıtları, mevcut blog dosyaları ve görseller değiştirilmedi. Bağımlılık eklenmedi.

Geliştirme commit'ini `git revert` ile geri almak yeterlidir; force reset/push gerekmez. Mevcut kayıtların başka biçime toplu dönüşümü yapılmadığından kaynak içerik geri dönüşü gerekmez. GitHub push ve temiz runner CI sonucu kullanıcı teslim raporunda belirtilir. Canlıya geçiş ayrıca onay gerektirir.

Kaynaklar: [Reference](https://pagescms.org/docs/configuration/fields/reference/), [Select](https://pagescms.org/docs/configuration/fields/select/), [Filename](https://pagescms.org/docs/configuration/content/filename/).
