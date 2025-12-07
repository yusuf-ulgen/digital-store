import type { Product } from "@/lib/api/products-admin";

// LocalProduct tipini buraya da taşıyalım veya import edelim
export type LocalProduct = Product & {
  soldCount?: number;
  shortDescription?: string; // Fiyatın üstündeki kısa açıklama
  features?: string[];       // Madde madde özellikler (Array)
  longDescription?: string;  // Ürün Açıklaması (Accordion içi)
  usage?: string;            // Kullanım Talimatı
  care?: string;             // Temizleme Talimatı
};

// 2. YARDIMCI FONKSİYONU GÜNCELLİYORUZ
// (Eski verilerin bozulmaması için varsayılan değerler atıyoruz)
const fakeProduct = (
  id: string,
  category: string,
  title: string,
  price: number,
  stock: number,
  imageFileName?: string,
  soldCount: number = 0,
  // Yeni parametreleri opsiyonel olarak ekleyelim
  customData?: {
    shortDescription?: string;
    features?: string[];
    longDescription?: string;
    usage?: string;
    care?: string;
  }
): LocalProduct => ({
  id,
  title,
  price,
  stock,
  category,
  imageUrl: imageFileName
    ? `/products/${imageFileName}`
    : `https://placehold.co/400x400/eeeeee/333333?text=${title.replace(/ /g, "+")}`,
  active: stock > 0,
  createdAt: new Date().toISOString(),
  soldCount,
  
  // Varsayılan (Placeholder) Metinler
  // Sen veriyi girene kadar boş görünmemesi için bunları varsayılan yapıyoruz.
  shortDescription: customData?.shortDescription || `${title}, mutfağınızdaki en büyük yardımcınız olmaya aday. Ülgen Paslanmaz kalitesiyle üretilmiştir.`,
  
  features: customData?.features || [
    "Profesyonel el işçiliği",
    "Yüksek karbonlu paslanmaz çelik",
    "Ergonomik sap tasarımı",
    "Uzun ömürlü keskinlik"
  ],
  
  longDescription: customData?.longDescription || "Bu ürün, profesyonel şeflerin ve yemek tutkunlarının ihtiyaçlarına göre özel olarak tasarlanmıştır. Keskinliği ve dengesi ile mutfakta harikalar yaratmanızı sağlar.",
  
  usage: customData?.usage || "Bıçağınızı kemik veya donmuş gıda kesiminde kullanmayınız. Ahşap veya plastik kesme tahtası tercih ediniz.",
  
  care: customData?.care || "Bıçağınızı bulaşık makinesinde yıkamayınız. Ilık su ve sabunla elde yıkayıp hemen kurulayınız."
});

// BÜTÜN LİSTEYİ BURAYA KOYUYORUZ VE BAŞINA 'export' EKLİYORUZ
export const ALL_PRODUCTS: LocalProduct[] = [
    // Şef Bıçağı
    fakeProduct("1", "sef-bicagi", "Şef Bıçağı Santoku", 599, 10, "sefBicagiSantoku.png",0,
        {
            shortDescription: "Japon mutfağından ilham alan Santoku, sebze doğramada mükemmel denge sağlar.",
            features: [
                "Japon 4116 Çelik",
                "Ceviz Ağacı Sap",
                "18 cm Namlu Uzunluğu",
                "Ultra Hafif Yapı"
            ],
            longDescription: "Santoku bıçağı, 'üç erdem' anlamına gelir: Dilimleme, doğrama ve kıyma. Bu bıçak, geniş yüzeyi sayesinde kesilen parçaları kolayca taşımanıza olanak tanır.",
            usage: "Sebze, meyve ve kemiksiz et kesimi için idealdir.",
            care: "Sadece elde yıkayın ve asidik gıdaları kestikten sonra hemen durulayın."
        }),
    fakeProduct("2", "sef-bicagi", "100. Yıl Özel Şef Bıçağı", 449.9, 5, "100.YilOzelSefBicagi.png"),
    fakeProduct("3", "sef-bicagi", "Şef Bıçağı Paslanmaz Çelik", 599, 0, "sefBicagiPaslanmazCelik.png"),
    fakeProduct("4", "sef-bicagi", "Japon Şef Bıçağı", 750, 8, "japonSefBicagi.png"),
    fakeProduct("5", "sef-bicagi", "Dövme Çelik Şef Bıçağı", 899, 3, "dovmeCelikSefBicagi.png"),
    fakeProduct("6", "sef-bicagi", "Mini Santoku Bıçağı", 399, 12, "miniSantokuBicagi.png"),
    fakeProduct("7", "sef-bicagi", "Profesyonel Şef Seti", 1599, 2, "profesyonelSefSeti.png"),
    fakeProduct("8", "sef-bicagi", "Sebze Bıçağı", 299, 20, "sebzeBicagi.png"),
    fakeProduct("9", "sef-bicagi", "Et Doğrama Bıçağı", 650, 7, "etDogramaBicagi.png"),
    fakeProduct("10", "sef-bicagi", "Şef Bıçağı (Ahşap Sap)", 620, 0, "sefBicagiAhsapSap.png"),
    fakeProduct("11", "sef-bicagi", "Hobi Şef Bıçağı", 410, 4, "hobiSefBicagi.png"),
    fakeProduct("12", "sef-bicagi", "Premium Şef Bıçağı", 1999, 1, "premiumSefBicagi.png"),

    // Outdoor
    fakeProduct("13", "outdoor", "Outdoor Av Bıçağı", 799, 10, "outdoorAvBicagi.png"),
    fakeProduct("14", "outdoor", "Kamp Baltası", 1200, 5, "kampBaltasi.png"),
    fakeProduct("15", "outdoor", "Çakı (Survival)", 450, 0, "cakiSurvival.png"),
    fakeProduct("16", "outdoor", "Outdoor Taktik Bıçak", 990, 8, "outdoorTaktikBicak.png"),
    fakeProduct("17", "outdoor", "Bushcraft Bıçağı", 1100, 3, "bushcraftBicagi.png"),
    fakeProduct("18", "outdoor", "Mini Outdoor Çakı", 300, 12, "miniOutdoorCaki.png"),
    fakeProduct("19", "outdoor", "Outdoor Set (Pusula)", 1800, 2, "outdoorSetPusula.png"),
    fakeProduct("20", "outdoor", "Balıkçı Bıçağı", 500, 20, "balikciBicagi.png"),
    fakeProduct("21", "outdoor", "Dağcı Bıçağı", 850, 7, "dagciBicagi.png"),
    fakeProduct("22", "outdoor", "Outdoor Bıçak (Kılıflı)", 920, 0, "outdoorBicakKilifli.png"),
    fakeProduct("23", "outdoor", "Ahşap Saplı Av Bıçağı", 710, 4, "ahsapSapliAvBicagi.png"),
    fakeProduct("24", "outdoor", "Premium Outdoor Bıçak", 2100, 1, "premiumOutdoorBicak.png"),

    // Bıçaklar
    fakeProduct("25", "bicaklar", "Mutfak Bıçağı", 199, 15, "mutfakBicagi.png"),
    fakeProduct("26", "bicaklar", "Ekmek Bıçağı", 250, 10, "ekmekBicagi.png"),
    fakeProduct("27", "bicaklar", "Peynir Bıçağı", 180, 0, "peynirBicagi.png"),
    fakeProduct("28", "bicaklar", "Soyma Bıçağı", 150, 30, "soymaBicagi.png"),
    fakeProduct("29", "bicaklar", "Domates Bıçağı", 170, 25, "domatesBicagi.png"),
    fakeProduct("30", "bicaklar", "Fileto Bıçağı", 350, 10, "filetoBicagi.png"),
    fakeProduct("31", "bicaklar", "Lazer Kesim Bıçak", 220, 5, "lazerKesimBicak.png"),
    fakeProduct("32", "bicaklar", "Seramik Bıçak", 400, 8, "seramikBicak.png"),
    fakeProduct("33", "bicaklar", "Meyve Bıçağı", 99, 50, "meyveBicagi.png"),
    fakeProduct("34", "bicaklar", "Dekor Bıçağı", 210, 0, "dekorBicagi.png"),
    fakeProduct("35", "bicaklar", "Pizza Bıçağı", 190, 14, "pizzaBicagi.png"),
    fakeProduct("36", "bicaklar", "Genel Amaçlı Bıçak", 230, 11, "genelAmacliBicak.png"),

    // Bıçak Seti
    fakeProduct("37", "bicak-seti", "3'lü Bıçak Seti", 799, 10, "bicakSeti3lu.png"),
    fakeProduct("38", "bicak-seti", "5'li Bıçak Seti (Standlı)", 1499, 5, "bicakSeti5liStandli.png"),
    fakeProduct("39", "bicak-seti", "Mıknatıslı Bıçak Seti", 1899, 0, "miknatisliBicakSeti.png"),
    fakeProduct("40", "bicak-seti", "Profesyonel Başlangıç Seti", 2100, 8, "profesyonelBaslangicSeti.png"),
    fakeProduct("41", "bicak-seti", "Steak Bıçak Seti", 999, 3, "steakBicakSeti.png"),
    fakeProduct("42", "bicak-seti", "Renkli Bıçak Seti", 699, 12, "renkliBicakSeti.png"),
    fakeProduct("43", "bicak-seti", "Ahşap Bloklu Set", 2499, 2, "ahsapBlokluSet.png"),
    fakeProduct("44", "bicak-seti", "Full Çelik Set", 2999, 20, "fullCelikSet.png"),
    fakeProduct("45", "bicak-seti", "Ekonomik Set", 499, 7, "ekonomikSet.png"),
    fakeProduct("46", "bicak-seti", "Lüks Bıçak Seti", 3499, 0, "luxBicakSeti.png"),
    fakeProduct("47", "bicak-seti", "Taşıma Çantalı Set", 2899, 4, "tasimaCantaliSet.png"),
    fakeProduct("48", "bicak-seti", "2'li Şef Seti", 1199, 1, "2liSefSeti.png"),

    // Kasap
    fakeProduct("49", "kasap", "Kasap Bıçağı No:1", 300, 10, "kasapBicagiNo1.png"),
    fakeProduct("50", "kasap", "Kasap Bıçağı No:2", 350, 5, "kasapBicagiNo2.png"),
    fakeProduct("51", "kasap", "Kasap Bıçağı No:3", 400, 0, "kasapBicagiNo3.png"),
    fakeProduct("52", "kasap", "Sıyırma Bıçağı", 280, 8, "siyirmaBicagi.png"),
    fakeProduct("53", "kasap", "Yüzme Bıçağı", 290, 3, "deriyuzmeBicagi.png"),
    fakeProduct("54", "kasap", "Kurban Bıçağı Seti", 1200, 12, "kurbanBicagiSeti.png"),
    fakeProduct("55", "kasap", "Dövme Kasap Bıçağı", 550, 2, "dovmeKasapBicagi.png"),
    fakeProduct("56", "kasap", "Kemik Sıyırma Bıçağı", 310, 20, "kemikSiyirmaBicagi.png"),
    fakeProduct("57", "kasap", "Deri Yüzme Bıçağı (Ahşap)", 300, 7, "deriYuzmeBicagiAhsap.png"),
    fakeProduct("58", "kasap", "Kasap Satırı (Küçük)", 600, 0, "kasapSatiriKucuk.png"),
    fakeProduct("59", "kasap", "Et Açma Bıçağı", 450, 4, "etAcmaBicagi.png"),
    fakeProduct("60", "kasap", "Premium Kasap Seti", 1999, 1, "premiumKasapSeti.png"),

    // Satırlar
    fakeProduct("61", "satirlar", "Ağır Hizmet Satır", 899, 10, "agirHizmetSatir.png"),
    fakeProduct("62", "satirlar", "Et Parçalama Satırı", 750, 5, "etParcalamaSatiri.png"),
    fakeProduct("63", "satirlar", "Mutfak Tipi Satır", 550, 0, "mutfakTipiSatir.png"),
    fakeProduct("64", "satirlar", "Dövme Çelik Satır", 990, 8, "dovmeCelikSatir.png"),
    fakeProduct("65", "satirlar", "Kasap Satırı (Büyük)", 950, 3, "kasapSatiriBuyuk.png"),
    fakeProduct("66", "satirlar", "Kallavi Satır", 1100, 12, "kallaviSatir.png"),
    fakeProduct("67", "satirlar", "Zırh Satırı (Tek Sap)", 450, 2, "zirhSatiriTekSap.png"),
    fakeProduct("68", "satirlar", "Zırh Satırı (Çift Sap)", 650, 20, "zirhSatiriCiftSap.png"),
    fakeProduct("69", "satirlar", "Döner Bıçağı Satırı", 700, 7, "donerBicagiSatiri.png"),
    fakeProduct("70", "satirlar", "İnce Et Satırı", 610, 0, "inceEtSatiri.png"),
    fakeProduct("71", "satirlar", "Kemik Kırma Satırı", 920, 4, "kemikKirmaSatiri.png"),
    fakeProduct("72", "satirlar", "Premium Dövme Satır", 1400, 1, "premiumDovmeSatir.png"),

    // Bileyici & Masatlar
    fakeProduct("73", "bileyici-masatlar", "Profesyonel Masat", 350, 10, "profesyonelMasat.png"),
    fakeProduct("74", "bileyici-masatlar", "Elmas Masat", 550, 5, "elmasMasat.png"),
    fakeProduct("75", "bileyici-masatlar", "Bileme Taşı (1000/3000)", 700, 0, "bilemeTasi1000_3000.png"),
    fakeProduct("76", "bileyici-masatlar", "Bileme Taşı (400/1000)", 650, 8, "bilemeTasi400_1000.png"),
    fakeProduct("77", "bileyici-masatlar", "Çelik Bileme Çubuğu", 400, 3, "celikBilemeCubugu.png"),
    fakeProduct("78", "bileyici-masatlar", "Mekanik Bileyici", 250, 12, "mekanikBileyici.png"),
    fakeProduct("79", "bileyici-masatlar", "Kaydırmaz Standlı Bileme Taşı", 850, 2, "kaydirmazStandliBilemeTasi.png"),
    fakeProduct("80", "bileyici-masatlar", "Seramik Masat", 480, 20, "seramikMasat.png"),
    fakeProduct("81", "bileyici-masatlar", "Kasap Masatı (Uzun)", 420, 7, "kasapMasatiUzun.png"),
    fakeProduct("82", "bileyici-masatlar", "Bıçak Bileme Aleti", 199, 0, "bicakBilemeAleti.png"),
    fakeProduct("83", "bileyici-masatlar", "Mini Masat", 150, 4, "miniMasat.png"),
    fakeProduct("84", "bileyici-masatlar", "Premium Bileme Seti", 1800, 1, "premiumBilemeSeti.png"),
];