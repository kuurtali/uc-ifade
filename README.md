# Üç İfade

[Kartları aç](https://kuurtali.github.io/uc-ifade/) · [iPhone kurulumu](https://kuurtali.github.io/uc-ifade/kurulum.html)

Her ekranda üç İngilizce ifade: Türkçe anlam, özgün İngilizce örnek ve örneğin Türkçe çevirisi. iPhone 15 Pro Max için 1290 × 2796 görseller. 08.00–22.00 arasında saatte bir değişim; 15 günlük tetikleyici Kestirmeler’de bir kez kurulur.

## Durum

Üç resmî PDF’den **5.753 kaynak girdisi** içeri aktarıldı: Oxford 3000 dosyasından 3.004, Oxford 5000 ek listesinden 1.999, Oxford Phrase List’ten 750 ana kalıp. Bu sayı PDF başlıklarındaki nominal toplamla aynı değildir; ayrı kaynak girdileri ve anlam ayrımları korunur. Aynı yazılışa sahip girdiler bulunabilir.

**30 ifadenin anlamı ve örnekleri hazır; 5.723 girdi bekliyor. Tam koleksiyon henüz bitmedi.** Eksik içerik kilit ekranına alınmaz. Site bütün kataloğu arama, kaynak/seviye ve hazır/bekleyen filtreleriyle gösterir. Güncel sayılar manifest dosyasındadır.

OPAL/AWL ve başka akademik ek listeler kapsam dışıdır. Ana listelerdeki C1 ifadeler korunur. Oxford’un resmî uygulaması değildir. PDF’ler depoda yeniden dağıtılmaz; örnekler sözlükten kopyalanmaz, bu proje için yazılır.

## Binlerce girdiye göre yapı

- `catalog.json`: sabit kimlik, kaynak PDF/sayfa, seviye, varyant ve içerik durumu.
- `deck-order.json`: kalıcı sıra; yeni hazır içerik sona eklenir.
- `data.tsv`: ilk 30 özgün örnek. `content.json`: sonradan tamamlanan içerik.
- `manifest.json`: telefonun indirdiği küçük kart listesi ve `cycleAtEnd` bilgisi.
- `manifest.js`: web önizlemesinin içeriği. `card-*.jpg`: içerik sürümlü görsel adresleri.
- `content_tool.py`: bekleyen içeriği paketler halinde dışarı alma ve denetlenmiş içerik ekleme.

Hazır kartlar bitince koleksiyon tamamlanana kadar kestirme durur; yeni kartlar geldiğinde kaldığı yerden devam eder. Tüm katalog tamamlanınca aynı kestirme tur sonunda başa döner. Son karttaki boş yerler TEKRAR etiketli ifadelerle tamamlanır. 5.753 girdi tamamlandığında 1.918 kart, günde 15 başarılı değişimle yaklaşık 128 gün eder. Gösterim, öğrenme anlamına gelmez.

## İçerik tamamlama

Python 3 ve Pillow gerekir. Yalnızca PDF’leri yeniden içeri aktarmak için pdfplumber gerekir. Hazır kataloğa içerik eklemek için ücretli API gerekmez.

```sh
python content_tool.py export batch.json --limit 100
# Anlam, doğal İngilizce örnek ve örneğin Türkçe çevirisini yaz.
# Kaynak satırındaki anlam ve sözcük türüyle uyumunu kontrol et.
# Kontrol sonrası her girdinin reviewed değerini true yap.
python content_tool.py accept batch.json
python -m unittest test_pipeline.py
python build.py
```

`reviewed` otomatik dil doğruluğu kanıtı değildir; editoryal kontrolü kaydeder. Eksik alan, bilinmeyen kimlik ve yayımlanmış girdileri yanlışlıkla değiştiren paketler reddedilir. Metin görsele sığmazsa üretim durur; örnek kısa ve doğal olacak şekilde düzenlenir. Başarılı üretimden sonra güncel veri, manifest dosyaları ve yeni görseller birlikte yüklenir.

Tam koleksiyon yayını öncesi denetim:

```sh
python build.py --validate-only --require-complete
```

Eksik tek girdi bile varsa komut hata verir. Testler binlerce girdinin sıra kaybı olmadan üçlü gösterimini, kısmi kartın yeni içerikle tamamlanmasını ve eksik içerik engelini kapsar. Windows’ta Segoe UI, Linux’ta DejaVu Sans kullanılır; gerekirse `CARD_FONT` ve `CARD_FONT_BOLD` Unicode TTF yollarıyla ayarlanır.

## Yayın ve telefon

GitHub Pages: Settings → Pages → Deploy from a branch → main → /(root). Saatlik sunucu işi veya açık bilgisayar gerekmez. HTML tek başına duvar kâğıdını değiştirmez; günlük tetikleyiciler iPhone’da çalışır.

Kestirme, indirme ve duvar kâğıdı uygulaması başarılı olduktan sonra sırayı iCloud Drive’a kaydeder. İnternet veya eylem hatasında sıra ilerlemez. Telefon kapalıyken geçen saatler telafi edilmez. **Kilitliyken çalışma kullanıcının iPhone’unda henüz denenmedi.** Hazır imzalı iCloud kestirme bağlantısı yerine adım adım rehber bulunur.

Profil README’sindeki günlük söz sistemi incelendi. Orada zamanlanmış GitHub Actions rastgele söz seçiyor; burada bütün ifadelerden geçebilmek için kalıcı sıra kullanılıyor. Profil deposu değiştirilmedi.

## Kaynaklar

- [Oxford 3000 PDF](https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_3000.pdf)
- [Oxford 5000 ek liste PDF](https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_5000.pdf)
- [Oxford Phrase List PDF](https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-phrase-list/Oxford%20Phrase%20List.pdf)

PDF’leri üst klasöre `Oxford_3000.pdf`, `Oxford_5000_Ek_2000.pdf`, `Oxford_Phrase_List_750.pdf` adlarıyla koyup `python import_catalog.py --pdf-dir ../` çalıştırarak yeniden içeri aktarabilirsin. Mevcut içerik ve sıra korunur. Kaynak sürümü değişirse kimlik uyuşmazlığı sessizce sıra değiştirmek yerine işlemi durdurur.
