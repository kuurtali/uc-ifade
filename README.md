# İfade

[Site ve iPhone kurulumu](https://kuurtali.github.io/uc-ifade/#kurulum)

Mor zemin, açık sarı başlıklar. Büyük Scriptable ana ekran widget’ında altı karışık kelime/kalıp; her birinde Türkçe anlam, İngilizce örnek ve Türkçe çeviri.

## Koleksiyon

Oxford 3000: 3004 PDF girdisi; Oxford 5000 ek listesi: 1999; Oxford Phrase List: 750. Toplam **5753 kayıt**. Ayrı tür ve anlam girdileri korunur. Oxford 3000, Oxford 5000’in içinde olduğundan tekrar eklenmez. Akademik ek liste yoktur.

Tüm kayıtların dört içerik alanı doludur. Türkçe anlamlar proje için yazılmıştır. Örneklerin çoğu Tatoeba’dan otomatik eşleştirilmiştir; anlam ayrımları için düzeltmeler ve özgün örnekler eklenmiştir. Tüm kayıtlar tek tek insan incelemesinden geçmiş değildir.

## iPhone

1. App Store’dan [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) indir.
2. Sitedeki **Widget kodunu kopyala** düğmesini kullan. Scriptable’da + ile yeni betik aç, yapıştır, adını **İfade** yap. ▶ ile bir kez çalıştır.
3. Ana ekrana büyük Scriptable widget’ı ekle. Widget’ı Düzenle → Script → İfade seç.

Her gün kurulum gerekmez. Gruplar Türkiye saatine göre 00, 02, 04… saatlerinde değişir. `refreshAfterDate` iOS’a yenilenme zamanı bildirir; tam saat garantisi vermez. Pil ve sistem planlaması yenilenmeyi geciktirebilir. İlk yüklemeden sonra yerel koleksiyonla çevrimdışı çalışır. Eski JPG bağlantıları sabit görseldir; kendiliğinden yenilenmez.

Altı ifadeli görünüm **ana ekran** içindir. Dikdörtgen kilit ekranı widget’ında tek ifade ve örnek gösterilir. Widget parametresi 0–5 ile gruptaki ifade seçilebilir.

## Dosyalar

- `Ifade.js`: kurulacak hazır Scriptable betiği.
- `widget-data.json`: widget için küçük, eksiksiz koleksiyon.
- `collection.json`: kaynak ve cümle atıflarıyla tam koleksiyon.
- `widget-core.js`: web ve widget için ortak zaman/sıralama mantığı.
- `widget-runtime.js`: önbellek, çevrimdışı kullanım, widget çizimi.
- `widget-site.js`, `widget-site.css`, `index.html`: web önizlemesi, arama, kurulum.
- `test_widget.cjs`: iki saat sınırları, gece geçişi, bütün listenin dolaşılması ve ağ kesintisi kontrolleri.

## Kaynak ve lisans

Oxford PDF’leri kelime ve kalıp seçimi içindir; bu proje Oxford’un resmî ürünü değildir. Kaynak PDF bağlantıları her kayıtta bulunur. Oxford tanım ve örnek cümleleri kopyalanmamıştır.

Tatoeba İngilizce/Türkçe cümle çiftleri [ManyThings derlemesinden](https://www.manythings.org/anki/) alınmıştır; **[CC BY 2.0 France](https://creativecommons.org/licenses/by/2.0/fr/)**. İlgili her kayıtta iki cümlenin numarası, katkıcısı ve lisans atfı bulunur. Web ayrıntı görünümü bunları kaynak bağlantılarıyla gösterir. Proje için yazılmış anlamlar ve özgün örnekler CC BY 4.0 altında kullanılabilir; atıf: İfade projesi. Yazılım MIT lisanslıdır.

## Doğrulama sınırı

Otomatik kontroller gerçek iPhone testi değildir. Web görünümü ve veri dolaşımı doğrulanabilir; gerçek Scriptable yerleşimi ve iOS yenileme davranışı cihazda kontrol edilmelidir.
