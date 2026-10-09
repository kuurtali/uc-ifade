# ifade ✳

**Bir bakışta altı ifade. Her ifadede iki örnek.**

[Site ve kurulum](https://kuurtali.github.io/uc-ifade/#kurulum) · [English](README.en.md) · [Düzeltme öner](https://github.com/kuurtali/uc-ifade/issues/new)

Mor ve altın renkli iPhone ana ekran widget’ı. Oxford kelimeleri ve günlük kalıpları karışık sırada gösterir. Her kayıtta iki İngilizce örnek, örneğe özgü Türkçe anlam ve Türkçe çeviri bulunur. Uygun ikinci anlam varsa kullanılır; yoksa aynı anlam başka bağlamda örneklenir.

| Koleksiyon | Gösterim | Seçim |
| --- | --- | --- |
| 5.750 öğrenme kaydı | Büyük widget’ta 6 kart, toplam 12 örnek | Türkiye saatine göre her 2 saatte yeni grup |

![İki örnekli widget için yaklaşık yerleşim](preview-v2.png)

*Bu görsel yaklaşık yerleşim çizimidir; iPhone ekran görüntüsü değildir. İki örnekli V2’nin gerçek cihaz görünümü henüz doğrulanmadı. Tek örnekli önceki sürüm kullanıcı cihazında çalıştı ve yenilendi.*

## Bir kez kur

1. [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) uygulamasını indir.
2. [Kurulum sayfasında](https://kuurtali.github.io/uc-ifade/#kurulum) **Widget kodunu kopyala** düğmesine bas. Scriptable’da **+** ile yeni betik aç; kodu yapıştır, adını **İfade** yap ve **▶** ile bir kez çalıştır.
3. Ana ekrana **büyük Scriptable widget’ı** ekle. Widget’a uzun bas → **Widget’ı Düzenle → Script → İfade**.

**Phrases veya İfade zaten kuruluysa:** Yeni widget ekleme. Mevcut betiği açıp içindeki kodun tamamını siteden kopyaladığın yeni kodla değiştir. Adını koru ve ▶ ile çalıştır. Bu geçiş bir kez yapılır; eski betik kendiliğinden iki örnekli hâle gelmez.

## Güncelleme ve çevrimdışı kullanım

- 00.00, 02.00, 04.00… için belirlenen grup gece de devam eder. Altışar ilerler; kesintisiz görüntülemeyle bütün kayıtlar yaklaşık 80 günde seçilir. Bu, öğrenme veya her grubun telefonda mutlaka gösterilmesi garantisi değildir.
- Gösterilecek grup cihazda saatten hesaplanır; sürekli çalışan bir sunucu gerekmez. iOS widget’ı arka planda çalıştırır. [Scriptable yenileme tarihi](https://docs.scriptable.app/listwidget/#refreshafterdate) en erken yenileme isteğidir; iOS geciktirebilir.
- Koleksiyon ilk açılışta indirilir, yerel olarak saklanır. Veri en az 24 saat eskiyse bir sonraki çalışmada yeni sürüm istenir. Ağ yoksa kayıtlı içerik kullanılır.
- Yeni veri için tekrar kurulum gerekmez. Widget kodunun değiştirilmesi gereken sürümlerde bir defalık kod güncellemesi gerekir.
- Büyük ana ekran widget’ı altı, orta boy iki, küçük boy bir kart gösterir. Dikdörtgen kilit ekranı görünümü yalnız bir ifade ve ilk örneği gösterir; parametre `0–5` gruptaki ifadeyi seçer.
- Eski `0001.jpg` bağlantısı sabit bir görseldir. Canlı widget değildir.

## Neden 5.750?

Oxford 3000 PDF’sinden 3.004, Oxford 5000 ek PDF’sinden 1.999, Oxford Phrase List’ten 750 kaynak girdisi çıkarıldı: toplam 5.753. İki kelime listesinde örtüşen `audio`, `gender`, `well-being` birleştirildi. Sonuç **5.000 kelime kaydı + 750 kalıp kaydı**. Ayrı tür/anlam maddeleri ve liste üyelikleri korunduğundan 5.750 farklı yazılış iddia edilmiyor. Akademik ek liste yok.

[Kaynak sayımı ve PDF bağlantıları](SOURCE-AUDIT.md) · [Kaynak tür düzeltmeleri](source-errata-v2.json)

## İçerik incelemesi

5.750 kaydın tümü ve 11.500 örnek AI destekli dilsel incelemeden geçti: hedef sözcük/kalıp, tür, anlam, İngilizce cümle, Türkçe karşılık ve örneklerin farklılığı kontrol edildi. İki örnek bütün olası anlamları kapsamaz. İnceleme bağımsız insan kontrolü değildir ve hatasızlık garantisi vermez. [28 kayıt için ek sözlük bağlantıları](meaning-evidence-v2.json) var; bütün kayıtlar için sözlük doğrulaması yapıldığı iddia edilmez.

[Mekanik içerik denetimi](content-audit-v2.json): eksik alan, bozuk karakter ve fazla uzun örnek uyarısı yok. [Yaklaşık yerleşim](layout-audit-v2.json): erişilebilir 2.875 altılı başlangıcı kontrol edildi; taşma bulunmadı. Arial ölçümleri iPhone yazı tipiyle birebir değildir.

## Katkı ve geliştirme

[Katkı rehberi](CONTRIBUTING.md) · [Geliştirme kaynakları](development-v2.zip)

Arşivi açtıktan sonra Python 3 ve Node.js ile:

```sh
python work/apply_reviews.py
python work/v2/build.py --preview
node work/v2/test_widget.cjs
python work/v2/build.py
```

Arşiv, düzenlenebilir inceleme kayıtlarını ve üretim/test araçlarını içerir. `collection-v2.json` kaynaklı tam veridir; `widget-data-v2.json` telefona gönderilen küçük sürümdür. `Ifade-v2.js` kurulacak betik; `widget-core-v2.js` ortak seçim mantığıdır. V1 dosyaları eski kurulumlar için korunur.

Kendi GitHub Pages kopyanı kullanacaksan `work/v2/widget-runtime.js` içindeki `BASE` adresini kendi site adresinle değiştirip yeniden üret. Web dosyaları veriyi göreli adreslerden alır. Hesap, API anahtarı veya ücretli hizmet gerekmez.

## Lisans

Yazılım **[MIT](LICENSE)**. Projenin özgün anlam/örnek/çeviri metinleri **CC BY 4.0**; Oxford listelerine veya üçüncü taraf içeriklerine yeniden lisans verilmez. Eski V1 Tatoeba atıfları korunur. [Kapsam ve atıf ayrıntıları](CONTENT-LICENSE.md).

Bu proje Oxford University Press veya Scriptable’ın resmî ürünü değildir.
