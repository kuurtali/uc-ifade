# Katkı / Contributing

İçerik düzeltmeleri, çeviri önerileri ve gerçek cihaz testleri çok değerlidir.
Content corrections, translation suggestions and real-device reports are welcome.

## İçerik hatası / Content correction

Sitede kartı açıp **Düzeltme öner** bağlantısını kullan. Kayıt kimliği otomatik eklenir. Ya da [yeni issue](https://github.com/kuurtali/uc-ifade/issues/new) açıp şunları belirt:

- Kelime/kalıp ve kartın bağlantısı / expression and entry link.
- Birinci veya ikinci örnek / first or second example.
- Sorun ve önerilen EN/TR düzeltmesi / problem and proposed correction.
- Varsa Oxford, Cambridge veya başka güvenilir sözlük bağlantısı / supporting dictionary link.

Sözlüklerden uzun tanım veya örnek listeleri kopyalama; özgün kısa örnek yaz. İkinci örneğe uygun farklı anlam ekle, yoksa aynı anlamı başka bağlamda göster. Kaynak türünü koru; hatalı kaynak etiketi varsa gerekçeyi ve bağlantıyı kaydet. Eski kayıt kimliklerini değiştirme.

Write original, short examples rather than copying dictionary content. Preserve the recorded part of speech and stable IDs. Explain any source correction. Do not mark unreviewed automatic output as reviewed.

## Widget hatası / Widget report

iPhone modeli, iOS ve Scriptable sürümü, widget boyutu, uygulama içi önizlemenin çalışıp çalışmadığı ve sorunun görüldüğü zamanı yaz. Kişisel bildirimleri gizleyerek ekran görüntüsü ekleyebilirsin. Yenileme gecikmesini içerik indirme hatasından ayırmaya çalış.

Include device/software versions, widget size, whether the in-app preview works, and the time of the problem. Redact personal notifications from screenshots.

## Değişiklik hazırlama / Preparing changes

1. `development-v2.zip` arşivini aç / extract the development archive.
2. İlgili `work/v2/reviewed-*.tsv` kaydını düzenle; sekiz alanı koru / edit the relevant eight-field review record.
3. `python work/apply_reviews.py`, `python work/v2/build.py --preview`, `node work/v2/test_widget.cjs`, `python work/v2/build.py` çalıştır.
4. Çıktıları ve düzenlenen kaynak kaydını PR’a ekle. Örnek, anlam ve çeviriyi birlikte açıkla / submit generated data and the review source with the reason for the correction.

İçerik katkıları özgün veya uygun izinli olmalı; lisans kapsamı [CONTENT-LICENSE.md](CONTENT-LICENSE.md), kod kapsamı [LICENSE](LICENSE) dosyasındadır. Gizli bilgi veya erişim anahtarı ekleme.
