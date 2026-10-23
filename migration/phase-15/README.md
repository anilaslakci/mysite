# Yaldız yaşam döngüsü revizyonu

Kapsam yalnızca src/assets/js/home-1.js dekorasyon bloğu ve src/assets/css/home-1.css dekorasyon kurallarıdır. Intro, cursor, Analytics, navigasyon, CMS, içerikler ve workflow değişmez.

Kök neden: intro noktaları sabit konumda .18–.65 opacity arasında süzülüyor, hiç yeniden doğmuyordu. Hero yıldızları directEntry veya coarse pointer koşulunda oluşturulmuyordu; dil geçişi ve tekrar ziyarette sistem yoktu. Mevcut yıldızların pozisyonu da döngüler arasında sabitti. CSS infinite olmasına rağmen görünmeme hissini bu koşullar açıklıyor; bir animasyonun gerçekten kendiliğinden durduğu saptanmadı.

Yeni ortak yaşam döngüsü: altı intro, sekiz hero düğümü; mobilde hero altı görünür. Altı saniyelik fazları eşit dağıtılmış döngülerde opacity ve transform değişir. Her animationiteration sınırında öğe görünmezken kontrollü rastgele konum ve boyut seçilir. Yeni düğüm birikmez, interval/RAF dekorasyon döngüsü yoktur. Intro üst/alt yan bantları marka ve swipe alanlarını korur. reduced-motion statik görünüm; gizli sekme pause. Cursor kendi bağımsız kodunu kullanmayı sürdürür.

Doğrulama: npm test (build, 21 proje, SEO/blog, TR/EN, 10 consent grubu, 8 navigation grubu, 18 header ve 18 intro grubu), blog 14 grup/16 geçersiz veri, i18n 10 grup, translation 11 grup, workflow ve medya kontrolleri geçti. Medya 67 kayıt, 66 kullanılan görsel, sıfır eksik; hiçbir görsel silinmedi.

Yeni scripts/test-gold-browser.mjs kurulu Playwright/Chrome ile TR, EN ve 390 px context'lerinde her katmanı 26.25 saniye örnekler. Görünür öğe sayısının hiç sıfırlanmamasını, kaybolmayı, en az dört döngüde yeni konumları, sabit düğüm sayısını, tekrar ziyaret ve reduced-motion davranışını doğrular. Sonuçlar gold-browser-results.json içinde. Drag/cursor regresyon sonuçları drag-regression/ içinde; gerçek tarayıcı mouse input'u ve mobil touch emülasyonu kullanılmıştır. Fiziksel telefon ve Safari testi değildir.

Çalıştırma: PLAYWRIGHT_MODULE kurulu modül yolu (isteğe bağlı); TEST_BASE_URL önizleme/canlı kökü; TEST_EVIDENCE_DIR çıktı konumu. Yeni proje bağımlılığı yoktur. Örnek varsayılan yerel URL http://127.0.0.1:4174. No tracking dependency added. Field CWV ölçülmemiştir.
