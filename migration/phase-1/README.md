# Birinci aşama: kayıpsız portfolyo görsel ayrıştırması

Geliştirme dalı: `refactor/eleventy-cms-migration`.
Başlangıç commit'i: `63c3f30b2d1af4fc178ccac295aaf0ae89adaabf`.
Başlangıç çalışma alanı temizdi. Ana sayfa ve diğer 17 özgün dosya değişmedi.
Eleventy / Pages CMS kurulmadı; yayın ayarları değiştirilmedi; push yapılmadı.

## Sonuç

- HTML: 19.631.972 → 156.450 bayt (%99,203 küçülme; görseller ayrıca indirilir).
- 133 Base64 kullanımı → 67 benzersiz dosya; 66 tekrar kullanımı ortak dosyalara bağlandı.
- Gerçek dosya imzaları: 66 PNG + 1 JPEG. Kaynakta JPEG olan iki kullanım yanlış biçimde `image/png` etiketlenmişti. JPEG baytları PNG'ye çevrilmedi; `.jpg` uzantısıyla birebir korundu. WebP/AVIF dönüşümü yapılmadı.
- 21 proje, 21 TR + 21 EN kart, 21 TR + 21 EN detay penceresi, 132 galeri görsel kullanımı ve favicon korundu.
- Galeri sırası, alternatif metinler, tüm metinler, bağlantılar, kimlikler, CSS ve JavaScript korundu. Tam HTML dönüşüm testi, yalnızca 133 URI değişikliğine izin verir.
- `../assets/portfolio/<sha256>.png|jpg` göreli yolları kullanıldı.

## Kanıt dosyaları

- `baseline-inventory.json`: 18 özgün dosyanın SHA-256, boyut, gömülü CSS/JS blokları ve bağlantı envanteri.
- `image-manifest.json`: 133 kaynak URI hash'i / konumu, çözümlenmiş bayt hash'i, dosya yolu, boyut ve tekrar eşleştirmesi. `sourceOffset` JavaScript UTF-16 dize konumudur; bayt konumu değildir. JPEG ölçü alanları null; dosya baytları tam korunur.
- `content-manifest.json`: her proje kimliği için TR/EN kart, özet, detay başlığı/girişi, sorun/çözüm/etki bölümleri, teknoloji etiketleri, galeri nitelikleri ve tam HTML.
- `test-results.json`: 12 yerel bütünlük kontrolü.
- `http-results.json`: sekiz sayfa, 67 görsel ve iki ekran görüntüsü karşılaştırması için 77 kontrol.
- `browser-results.json`: 42 detay penceresi açma/kapama, dil, filtre, zoom ve mobil kontrol kaydı.
- `screenshots/`: 1440×1000 masaüstü ve 390×844 mobil öncesi/sonrası ekran görüntüleri. Her eşleşen çiftin PNG baytları birebir aynı. Mobil proje 21 ekranı ayrıca saklandı.

## Yedek ve doğrulanan geri dönüş

Yedekler Git'ten bağımsız, yerel dosyalardır ve yanlışlıkla commit edilmemeleri için `.gitignore` kapsamındadır:

- `.migration-backups/phase-1/snapshot/`: özgün 18 dosyanın birebir kopyası.
- `.migration-backups/phase-1/metadata.json`: başlangıç commit'i ve dosya hash'leri.
- `.migration-backups/phase-1/history-complete.bundle`: Git geçmişi ve referansları.
- `.migration-backups/phase-1-recovery.zip`: snapshot, metadata ve tam geçmiş paketinin bağımsız arşivi.

Yerel depo başlangıçta sığ kopyaydı. İlk `history.bundle`, `git bundle verify` başarılı olsa da bağımsız klonlamada başarısız oldu. Bu nedenle `git fetch --unshallow origin` ile eksik geçmiş okundu; yeni `history-complete.bundle` üretildi. Bu paket ayrı bir bare depoya klonlandı ve `git fsck --full` hatasız tamamlandı. İlk `history.bundle` kurtarma için kullanılmamalıdır.

Yedekler aynı disktedir; disk arızasına karşı harici yedek yerine geçmez. ZIP ayrıca açılarak dosya hash'leri kontrol edilmiştir. Arşiv ve bundle SHA-256 değerleri `backup-verification.json` içindedir.

Geri dönüşü mevcut çalışma klasöründe zorlayıcı reset yapmadan sınamak için, yeni ve boş bir hedef yol seçerek:

```powershell
git clone C:\Users\Asus\Desktop\mysite\.migration-backups\phase-1\history-complete.bundle C:\Users\Asus\Desktop\mysite-recovery
git -C C:\Users\Asus\Desktop\mysite-recovery switch --detach 63c3f30b2d1af4fc178ccac295aaf0ae89adaabf
git -C C:\Users\Asus\Desktop\mysite-recovery fsck --full
```

Git checkout satır sonlarını normalize edebilir. Kaynak dosyaların bayt düzeyinde aynısı gerekirse `snapshot/` içeriğini yeni kurtarma klasörüne kopyalayın ve `baseline-inventory.json` hash'leriyle karşılaştırın. Başlangıç snapshot'ı doğrulanmadan mevcut kullanıcı dosyalarının üzerine yazmayın. Bu işlem yereldir; canlıya dönüş ayrıca dağıtım ve kullanıcı onayı gerektirir.

## Kontrolleri tekrarlama

Depo kökünde, Node.js ile ve ek paket kurmadan:

```powershell
node scripts/portfolio-migration.mjs test
node scripts/preview-migration.mjs
# Ayrı terminalde, önizleme çalışırken:
node scripts/test-migration-http.mjs
```

Bütünlük testi yerel, ignore edilen snapshot ve tam bundle dosyasını gerektirir. Yeni klonda test çalıştırılacaksa güvenli yedek bu konuma ayrıca taşınmalıdır. `backup` ve `extract` tek seferlik, üzerine yazmayı reddeden hazırlık komutlarıdır; normal tekrar testinde kullanılmaz.

Önizleme yalnızca 127.0.0.1:4173 üzerinde çalışır; özgün sayfa `/__baseline/portfolyo/`, güncel sayfa `/portfolyo/` adresindedir. Yedek klasörlerini web üzerinden açmaz. Önizlemeye özel CSP Analytics isteklerini engeller; HTML dosyalarına bu amaçla müdahale edilmez.

## Sınırlar ve sonraki adım

BrowserAct CLI çekirdeği DLL erişim hatası verdi; tarayıcı kontrolleri uygulamanın yerel tarayıcısıyla tamamlandı. Harici bağlantıların canlı erişilebilirliği ve gerçek telefon donanımı test edilmedi. Mevcut modal `aria-hidden` kusuru bu dar kapsamlı aşamada değiştirilmedi.

Sonraki aşama, ayrıca onayla, bu manifestleri koruma sözleşmesi olarak kullanarak yerel Eleventy iskeletini kurmak ve mevcut sekiz URL'yi aynı çıktı yollarıyla üretmektir. Canlı yayın bu aşamanın kapsamında değildir.
