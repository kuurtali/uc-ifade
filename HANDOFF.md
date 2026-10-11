# İfade — geliştirme ve AI devir rehberi

Son durum: 11 Ekim 2026. İlk 10 adımlık geliştirme planı tamamlandı. 5750 kayıt / 11500 örnek. Büyük ana ekran widget'ı altı ifadeyi ikişer örnekle gösterir. Mor/altın görünüm, iki saatlik seçim ve eski bağlantılar korunur.

## Başlangıç

1. Bu depoyu indir veya klonla; README.md, GUIDE.md, CONTRIBUTING.md ve bu dosyayı oku.
2. Depodaki **development-v2.zip** arşivini ayrı bir çalışma klasörüne aç. Arşivin kökündeki START-HERE.md aynı akışı açıklar. Arşiv güncel düzenlenebilir kaynakları, 5750 inceleme kaydını, testleri ve mevcut V2 site dosyalarını içerir.
3. Güncel canlı dosyalar deponun kökündedir; arşivdeki `outputs/uc-ifade-v2` bu yayının çalışma kopyasıdır. Daha sonraki yayınlarda arşivi de yenile; eski arşivi yeni yayın üzerine körlemesine kopyalama.

## Hangi dosya düzenlenir?

| Amaç | Arşiv içindeki kaynak |
|---|---|
| Anlam, örnek, çeviri | `work/v2/reviewed-*.tsv` içinde kimliği eşleşen satır |
| Kaynak, tür ve inceleme bilgileri | `work/v2/collection.json`, `source-errata.json`, `meaning-evidence.json` |
| Altılı seçimi ve iki saat sınırları | `work/v2/widget-core.js` |
| Scriptable görünümü, indirme, önbellek | `work/v2/widget-runtime.js` |
| Web etkileşimi | `work/v2/widget-site-v2.js` |
| Web görünümü ve rehber | `outputs/uc-ifade-v2/index.html`, `widget-site-v2.css`, `kurulum-gorselli.html` |
| Test ve cihaz kabulü | `work/v2/test_*.cjs`, `native-device-check.json`, `long-run-refresh-check.json` |

`.tsv` adlarına rağmen inceleme satırları **sekme değil `|` ile ayrılan sekiz alandır**:
`id|anlam1|örnek1|çeviri1|anlam2|örnek2|çeviri2|ilişki`
İlişki `same-sense` veya `different-sense` olur. Bir kimlik yalnız bir inceleme satırında bulunur. Otomatik üretilen metni okumadan incelenmiş sayma. Örnekler kısa, özgün ve birbirinden farklı olmalı.

## Yeniden üret ve kontrol et

Python 3 ve Node.js gerekir. Aşağıdaki temel akış ek paket gerektirmez; arşivin kökünde çalıştır:

```sh
python work/apply_reviews.py
python work/v2/build.py --preview
node work/v2/test_widget.cjs
python work/v2/build.py
python work/export_release.py
node work/v2/test_site.cjs
node work/v2/test_long_run.cjs
```

İçerik değiştiğinde `work/v2/collection.json` içindeki `version` değerini güncelle. Üretilmiş JSON'u tek başına düzeltme; sonraki üretim değişikliği geri alabilir. HTML/CSS değişikliklerini ayrıca tarayıcıda, widget yerleşimini telefonda kontrol et. Önceki yerleşim sonuçlarını değişen metinler için yeni kontrol yapılmış gibi sunma.

## GitHub'a gönderme

`outputs/uc-ifade-v2` içindeki **değişen** yayın dosyalarını GitHub deposunun kökündeki karşılıklarına uygula. Kaynak değişiklikleriyle birlikte development-v2.zip arşivini güncelle; arşivin içine kendisini koyma. Yeni AI'ın değişiklik gerekçesini anlayabilmesi için devir notunu da güncelle. Tercihen bir dal ve pull request ile değişiklikleri incele; ana dala kabul edilen sürüm GitHub Pages tarafından yayımlanır. Sonuçları canlı site üzerinde doğrula.

V1 `Ifade.js`, `widget-data.json`, kimlikler/alias'lar ve eski JPG bağlantılarını silme. Yalnız içerik değişirse mevcut V2 kurulumları en az 24 saatlik veri önbelleği dolduktan sonraki çalışmada alır. Scriptable kodu değişirse kullanıcı bir kez betiği yeniler. İki saatlik seçim ile iOS'un widget'ı çalıştırma zamanını karıştırma; tam saat garantisi yok.

## Doğrulama ve kabul

- 5750 kaydın AI destekli dilsel ilk incelemesi ve iki örnek tamamlandı; bağımsız insan veya tüm maddeler için sözlük doğrulaması iddia edilmiyor.
- İlk turda bütün kayıtların dolaşımı, sınırlar, bozuk/çevrimdışı önbellek, web araması, eski kimlikler ve iki örnek kontrolleri geçti.
- Gerçek veri/kodla 100 günlük, 1200 çalıştırmalık benzetimde üç günlük ağ kesintisi ve yeni sürüme geçiş geçti. Bu iOS bellek veya pil testi değildir.
- İki gerçek iPhone 15 Pro Max grubunda 12 örnek görünür. 11 Ekim'de kullanıcı cihaz yenilenmesini de doğruladı; 10/10 plan kabulü tamamlandı. Bu bağımsız zamanlama ölçümü değildir.

## Arşiv kapsamı

GitHub, İfade'nin güncel bakım ve yeniden üretim kaynaklarını içerir. Diğer projelerin özel inceleme dosyaları, kişisel çalışma notları, tekrar eden tarihsel ZIP yedekleri ve indirilen üçüncü taraf ham veri arşivleri bu kamuya açık pakete dahil değildir. Oxford kaynakları ve lisans sınırları SOURCE-AUDIT.md / CONTENT-LICENSE.md içinde açıklanır. Yerel tam çalışma geçmişi ayrı tutulur; projeyi güncellemek için gerekli değildir.
