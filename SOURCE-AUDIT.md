# Oxford kaynak karşılaştırması — 8 Ekim 2026

Yerel olarak indirilmiş resmi PDF'ler yeniden karakter konumları ve yazı tipleri
üzerinden okundu. Yeniden çıkarılan kimlik kümesi üretimdeki 5753 kayıtla aynı.

| Kaynak | Ham başlık sayısı |
|---|---:|
| Oxford 3000 | 3004 |
| Oxford 5000 ek liste | 1999 |
| Oxford Phrase List | 750 |
| Toplam | 5753 |

İki kelime listesinde aşağıdaki üç başlığın sözcük türleri örtüşüyor:

| Başlık | 3000 PDF | 5000 PDF | İşlem |
|---|---|---|---|
| audio | sayfa 1, isim/sıfat, A2 | sayfa 1, sıfat, B2 | Bir kayıt; iki kaynak saklı |
| gender | sayfa 5, isim, B2 | sayfa 4, isim, B2 | Bir kayıt; iki kaynak saklı |
| well-being | sayfa 11, isim, B2 | sayfa 8, isim, C1 | Bir kayıt; iki seviye/kaynak saklı |

Sonuç: **5000 kelime kaydı + 750 kalıp kaydı = 5750 öğrenme kaydı**.
Bu, 5750 farklı yazılış demek değildir. Örneğin `arm` isim ve fiil olarak,
`bank` para kurumu ve nehir kıyısı olarak ayrı kaynak maddeleridir.
`because of` ve `instead of` hem kelime hem kalıp listesinde yer aldığı için
750 kalıplık listenin üyeliğini korumak amacıyla ayrı öğrenme kayıtları kalır.

Birleştirilen üç eski kimlik için yönlendirme tablosu oluşturuldu; eski detay
bağlantıları yeni sürümde karşılıklarına yönlendirilebilecek. PDF'lerdeki
farklı seviye bilgileri sessizce ezilmedi.

Bu bir kaynak/sayım denetimidir; örnek cümlelerin dilsel denetimi değildir.
İçe aktarma algoritmasının yeniden çalışması bağımsız bir dil incelemesi sayılmaz.
PDF SHA-256 özetleri ve kimlik eşlemeleri `source-counts.json` içinde.

Kaynaklar:
- https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_3000.pdf
- https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-3000-5000/The_Oxford_5000.pdf
- https://www.oxfordlearnersdictionaries.com/external/pdf/wordlists/oxford-phrase-list/Oxford%20Phrase%20List.pdf
