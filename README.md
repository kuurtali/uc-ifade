# Üç İfade

iPhone 15 Pro Max için her ekranda üç İngilizce ifade, Türkçe anlam, özgün İngilizce örnek ve Türkçe çeviri gösteren kilit ekranı prototipi.

## Durum

- 30 örnek ifade / 10 JPEG kart hazırdır. Tam 5.750 ifadelik koleksiyon **henüz hazır değildir**.
- `index.html`: çalışan önizleme, kart seçimi, indirme ve kopyalama.
- `kurulum.html`: tek kart denemesi, sıra kaydı ve günlük otomasyonların kurulum rehberi.
- `manifest.json`: Kestirmeler’in kullanacağı veri; sıra telefonda saklanır.
- iPhone kilitli çalışma testi kullanıcı cihazında yapılmalıdır; sitedeki test bunun yerini tutmaz.
- İlk sürüm 10 kart tamamlanınca durur. Yeni içerik eklenirken mevcut kart sırası korunmalıdır.

## İçerik

Hedef: Oxford 3000 + Oxford 5000 ek 2000 kelime + Oxford Phrase List. OPAL/AWL kapsam dışıdır.
Kaynak PDF’ler depoya eklenmemiştir. 30 örnek girdinin liste üyeliği ve seviyeleri resmî PDF’lerden kontrol edilmiştir. Örnekler ve Türkçe çeviriler bu proje için yazılmıştır. Oxford’un resmî uygulaması değildir.

- https://www.oxfordlearnersdictionaries.com/about/wordlists/oxford3000-5000
- https://www.oxfordlearnersdictionaries.com/about/wordlists/oxford-phrase-list

## Yeniden üretim

Python 3 ve Pillow kullanılır. `python build.py` veri doğrulamasını çalıştırır, kart görsellerini, `manifest.json` ve `manifest.js` üretir. Windows’ta Segoe UI, Linux’ta DejaVu Sans kullanır. Gerekirse `CARD_FONT` ve `CARD_FONT_BOLD` ile font yolları verilebilir. Fontlar depoya dahil değildir.

## GitHub Pages

Settings → Pages → Deploy from a branch → main → /(root). Site statiktir; saatlik GitHub Actions veya açık bir bilgisayar gerekmez. Her gün çalışan 15 saat tetikleyicisi iPhone’da bir kez kurulur. Gizli anahtar veya kullanıcı verisi depoda bulunmaz.
