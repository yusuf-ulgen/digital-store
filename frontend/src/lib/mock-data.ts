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
  // --- ŞEF BIÇAKLARI (Genel Konsept: Cavit İnox / Profesyonel Seri) ---
  fakeProduct("1", "sef-bicagi", "Şef Bıçağı Santoku", 599, 10, "sefBicagiSantoku.png", 0, {
    shortDescription: "Japon mutfak sanatının Türk el işçiliği ile buluşması. Sebze ve et için mükemmel denge.",
    features: [
      "Çelik: 1.4116 Alman Paslanmaz Çelik",
      "Sertlik: 56 HRC (Buzul Isıl İşlem)",
      "Sap: Doğal Ceviz Ağacı (Perçinli)",
      "Namlu Boyu: 18 cm",
      "Özellik: Oluklu yüzey (Yapışmayı engeller)"
    ],
    longDescription: "Santoku, 'üç erdem' anlamına gelir: Dilimleme, doğrama ve kıyma. Oluklu yapısı sayesinde patates gibi nişastalı gıdalar namluya yapışmaz. Dengeli ağırlık merkezi bileğinizi yormaz.",
    usage: "Sebze, meyve ve kemiksiz et kesimi için idealdir. Zırh gibi vurarak kullanmayınız.",
    care: "Ahşap saplı olduğu için elde yıkayıp hemen kurulayınız. Bulaşık makinesi önerilmez."
  }),
  fakeProduct("2", "sef-bicagi", "100. Yıl Özel Şef Bıçağı", 449.9, 5, "100.YilOzelSefBicagi.png", 0, {
    shortDescription: "Cumhuriyetimizin 100. yılına ithafen üretilmiş, lazer işlemeli koleksiyonluk şef bıçağı.",
    features: [
        "Çelik: T5 Fransız Çeliği",
        "Sap: Kök Ceviz / Pirinç Bilezik",
        "İşleme: Lazer ile 100. Yıl Logosu",
        "Kutu: Özel Kadife Kaplı Kutu"
    ],
    longDescription: "Sadece bir bıçak değil, bir miras. T5 Fransız çeliğinin keskinliği, Anadolu ceviz ağacının sıcaklığıyla birleşti. Özel kutusunda gönderilir.",
    usage: "Genel mutfak kullanımı ve koleksiyon.",
    care: "Kullandıktan sonra hafifçe yağlayarak saklayınız."
  }),
  fakeProduct("3", "sef-bicagi", "Şef Bıçağı Paslanmaz Çelik", 599, 0, "sefBicagiPaslanmazCelik.png", 0, {
    shortDescription: "Endüstriyel mutfaklar için hijyenik, PPC saplı profesyonel şef bıçağı.",
    features: [
        "Çelik: 4034 Kalite Paslanmaz",
        "Sap: Hijyenik PPC Enjeksiyon (Bakteri barındırmaz)",
        "Boyut: 19 cm Namlu",
        "Sertlik: 54-55 HRC"
    ],
    longDescription: "Profesyonel şeflerin yoğun temposuna ayak uydurmak için tasarlandı. Sap ve çelik birleşimi sızdırmazdır, gıda artığı birikmez.",
    usage: "Otel, restoran ve ev mutfakları için genel kesim.",
    care: "Bulaşık makinesinde yıkanabilir (Düşük sıcaklık önerilir)."
  }),
  fakeProduct("4", "sef-bicagi", "Japon Şef Bıçağı", 750, 8, "japonSefBicagi.png", 0, {
    shortDescription: "Gyuto tarzı, yüksek karbonlu çelikten üretilmiş hassas kesim bıçağı.",
    features: ["Çelik: Yüksek Karbonlu N690", "Ağız Yapısı: V-Grind (Çift taraflı)", "Sap: Stabilize Ahşap", "Keskinlik: Jilet Keskinliği"],
    longDescription: "Japon geometrisi ile Türk çeliğinin birleşimi. İnce dilimleme işlemleri (Sashimi, Carpaccio) için mükemmeldir.",
    usage: "Hassas et ve sebze dilimleme.",
    care: "Yüksek karbon içerir, asitli gıdalardan sonra hemen durulayınız."
  }),
  fakeProduct("5", "sef-bicagi", "Dövme Çelik Şef Bıçağı", 899, 3, "dovmeCelikSefBicagi.png", 0, {
    shortDescription: "Geleneksel yöntemle örste dövülerek sıkıştırılmış çelik. Kırılmaz, eğilmez.",
    features: ["Üretim: El Dövmesi (Hand Forged)", "Çelik: T7 Yüksek Karbon", "Balçak: Pirinç Döküm", "Ağırlık: Tok ve Ağır"],
    longDescription: "Sürmene'nin usta ellerinde dövülen çelik, moleküler yapısı sıkıştığı için fabrikasyon bıçaklara göre 2 kat daha geç körelir.",
    usage: "Sert sebzeler, etler ve genel kullanım.",
    care: "Elde yıkanmalıdır. Karbon çeliği olduğu için rengi zamanla koyulaşabilir (Patina)."
  }),
  fakeProduct("6", "sef-bicagi", "Mini Santoku Bıçağı", 399, 12, "miniSantokuBicagi.png", 0, {
    shortDescription: "Pratik işler ve küçük eller için 12 cm namlulu kompakt Santoku.",
    features: ["Boyut: 12 cm Namlu", "Sap: Renkli ABS Plastik", "Çelik: 1.4116", "Hafiflik: 90 gr"],
    longDescription: "Büyük şef bıçağı kullanmaktan çekinenler için ideal boyut. Kahvaltılık hazırlarken veya meyve doğrarken elinizden düşmeyecek.",
    usage: "Kahvaltı, meyve, küçük sebzeler.",
    care: "Makinede yıkanabilir."
  }),
  fakeProduct("7", "sef-bicagi", "Profesyonel Şef Seti", 1599, 2, "profesyonelSefSeti.png", 0, {
    shortDescription: "Gastronomi öğrencileri ve yeni şefler için 3'lü başlangıç seti.",
    features: ["İçerik: Şef (19cm), Sıyırma (14cm), Soyma (9cm)", "Çelik: Fransız T5", "Sap: Perçinli Venge Ağacı", "Ekstra: Rulo Çanta Hediyeli"],
    longDescription: "Mutfakta en çok ihtiyaç duyduğunuz üç temel bıçak bir arada. Yüksek keskinlik performansı ile doğrama, ayıklama ve soyma işlemlerini keyfe dönüştürür.",
    usage: "Tüm mutfak operasyonları.",
    care: "Elde yıkama tavsiye edilir."
  }),
  fakeProduct("8", "sef-bicagi", "Sebze Bıçağı", 299, 20, "sebzeBicagi.png", 0, {
    shortDescription: "Nakiri tarzı, küt uçlu sebze kıyma bıçağı.",
    features: ["Tip: Nakiri / Sebze", "Uç: Küt (Güvenli)", "Genişlik: 4.5 cm", "Bileme: İnce Lazer Ağız"],
    longDescription: "Geniş yüzeyi sayesinde doğradığınız sebzeleri tavaya taşımak için kürek gibi kullanabilirsiniz. Küt ucu batmaları engeller.",
    usage: "Maydanoz kıyma, soğan doğrama.",
    care: "Bulaşık makinesi önerilmez."
  }),
  fakeProduct("9", "sef-bicagi", "Et Doğrama Bıçağı", 650, 7, "etDogramaBicagi.png", 0, {
    shortDescription: "Kasap tipi geniş namlulu et doğrama bıçağı.",
    features: ["Çelik: T5 (Sert)", "Namlu: 16 cm Geniş", "Sap: Ergonomik Fibrox (Kaymaz)", "Dayanım: Yüksek"],
    longDescription: "Etin sinirlerini ayıklarken ve kuşbaşı doğraken hakimiyetinizi artırır. Sapı ıslakken ve yağlıyken bile elden kaymaz.",
    usage: "Kırmızı et ve tavuk işleme.",
    care: "Sıcak suyla yıkayınız."
  }),
  fakeProduct("10", "sef-bicagi", "Şef Bıçağı (Ahşap Sap)", 620, 0, "sefBicagiAhsapSap.png", 0, {
    shortDescription: "Klasik Fransız şef bıçağı formunda, doğal ahşap saplı model.",
    features: ["Form: Klasik Şef", "Sap: Gül Ağacı", "Çelik: 4116", "Denge: Sap Ağırlıklı"],
    longDescription: "Klasik severler için üretildi. Sallama hareketiyle (Rocking motion) doğrama yapmak için ideal kavisli ağıza sahiptir.",
    usage: "Maydanoz kıyma, soğan, genel kullanım.",
    care: "Ahşap sap bakımı için ayda bir zeytinyağı sürünüz."
  }),
  fakeProduct("11", "sef-bicagi", "Hobi Şef Bıçağı", 410, 4, "hobiSefBicagi.png", 0, {
    shortDescription: "Ev kullanıcıları için fiyat/performans odaklı şef bıçağı.",
    features: ["Çelik: 4034 Paslanmaz", "Kalınlık: 2mm", "Sap: Sert Plastik", "Ekonomik"],
    longDescription: "Profesyonel keskinliği evinize getirir. Hafif yapısı sayesinde uzun süreli kullanımda bileğinizi yormaz.",
    usage: "Ev tipi genel kullanım.",
    care: "Bulaşık makinesinde yıkanabilir."
  }),
  fakeProduct("12", "sef-bicagi", "Premium Şef Bıçağı", 1999, 1, "premiumSefBicagi.png", 0, {
    shortDescription: "Şam çeliği (Damascus) desenli, VG10 çekirdekli üst düzey bıçak.",
    features: ["Çelik: VG10 (60-62 HRC)", "Katman: 67 Kat Damascus", "Sap: Mikarta / Epoksi", "Kutu: Ahşap Sunum Kutusu"],
    longDescription: "Bıçak sanatının zirvesi. 67 kat çeliğin birleşimiyle oluşan doğal desenler her bıçakta benzersizdir. Jilet keskinliğindedir.",
    usage: "Hassas kesim, sunum.",
    care: "Asla makineye atmayınız, kemik kesmeyiniz."
  }),

  // --- OUTDOOR (Genel Konsept: Çakıroğlu / Sürmene Avcı Serisi) ---
  fakeProduct("13", "outdoor", "Outdoor Av Bıçağı", 799, 10, "outdoorAvBicagi.png", 0, {
    shortDescription: "Doğada güvenebileceğiniz, 4 mm sırt kalınlığına sahip avcı bıçağı.",
    features: ["Çelik: 4116 Paslanmaz", "Kalınlık: 4 mm", "Kılıf: Hakiki Vaketa Deri", "Tam Boy: 24 cm"],
    longDescription: "Full-tang (tek parça) yapısı sayesinde en zorlu koşullarda bile kırılmaz. Deri kılıfı kemere takılabilir.",
    usage: "Kamp, av, batoning (odun yarma).",
    care: "Kılıfına koymadan önce mutlaka kurulayınız."
  }),
  fakeProduct("14", "outdoor", "Kamp Baltası", 1200, 5, "kampBaltasi.png", 0, {
    shortDescription: "Dövme çelikten üretilmiş, kompakt ve güçlü kamp baltası.",
    features: ["Başlık: Dövme Karbon Çelik", "Sap: Dişbudak Ağacı", "Ağırlık: 600 gr", "Kılıf: Deri Ağızlık"],
    longDescription: "Kamp ateşiniz için odun hazırlarken en büyük yardımcınız. Dövme çelik olduğu için ağzı çabuk dönmez.",
    usage: "Odun kırma, yontma, kazık çakma.",
    care: "Paslanmaması için yağlı bırakınız."
  }),
  fakeProduct("15", "outdoor", "Çakı (Survival)", 450, 0, "cakiSurvival.png", 0, {
    shortDescription: "Tek elle açılabilen, kilit mekanizmalı taktik çakı.",
    features: ["Mekanizma: Liner-Lock Kilit", "Çelik: N690", "Sap: G10 Kaymaz", "Ekstra: Kemer Klipsi"],
    longDescription: "Acil durumlarda, ip kesmede ve genel kamp işlerinde cebinizdeki güç. Kilit sistemi sayesinde kapanma riski yoktur.",
    usage: "Günlük taşıma (EDC), kamp.",
    care: "Mekanizmayı ara sıra yağlayınız."
  }),
  fakeProduct("16", "outdoor", "Outdoor Taktik Bıçak", 990, 8, "outdoorTaktikBicak.png", 0, {
    shortDescription: "Askeri standartlarda, siyah kaplamalı ve cam kırıcılı taktik bıçak.",
    features: ["Kaplama: Siyah Titan", "Uç: Tanto", "Sap: Termoplastik", "Ekstra: Cam Kırıcı Arka Topuz"],
    longDescription: "Yansıma yapmayan siyah kaplaması ve agresif tanto ucu ile taktik kullanım için tasarlandı.",
    usage: "Taktik, arama-kurtarma.",
    care: "Kaplamayı çizmeyiniz."
  }),
  fakeProduct("17", "outdoor", "Bushcraft Bıçağı", 1100, 3, "bushcraftBicagi.png", 0, {
    shortDescription: "Scandi ağız yapısıyla ahşap oymak için mükemmel Bushcraft bıçağı.",
    features: ["Ağız: Scandi Grind", "Çelik: O2 Karbon Çelik", "Sap: Zeytin Ağacı", "Sırt: Ateş başlatıcıya uygun 90 derece"],
    longDescription: "Doğada barınak yapmak, kaşık oymak (kuksa) ve ateş başlatmak için özel olarak tasarlanmıştır.",
    usage: "Bushcraft, ahşap işleri.",
    care: "Karbon çeliktir, paslanmaya karşı bakım ister."
  }),
  fakeProduct("18", "outdoor", "Mini Outdoor Çakı", 300, 12, "miniOutdoorCaki.png", 0, {
    shortDescription: "Anahtarlık boyutunda klasik Sürmene çakısı.",
    features: ["Boyut: 6 cm Kapalı", "Sap: Pleksi / Kemik Görünümlü", "Çelik: Paslanmaz", "Geleneksel"],
    longDescription: "Dedelerimizin cebinden eksik olmayan klasik model. Küçük işler için her zaman yanınızda.",
    usage: "Meyve soyma, paket açma.",
    care: "Kaybetmemeye dikkat ediniz."
  }),
  fakeProduct("19", "outdoor", "Outdoor Set (Pusula)", 1800, 2, "outdoorSetPusula.png", 0, {
    shortDescription: "Kampçılar için hazırladığımız Av Bıçağı + Magnezyum Çubuğu + Pusula seti.",
    features: ["Set: 3 Parça", "Bıçak: 4116 Çelik Avcı", "Ateş: Ferrocerium Çubuk", "Taşıma: Özel Kutu"],
    longDescription: "Doğaya çıkarken temel ihtiyaçlarınızı tek pakette toplayın. Ateş yakmak ve yön bulmak artık çok kolay.",
    usage: "Kamp başlangıç seti.",
    care: "Pusulayı manyetik alanlardan uzak tutunuz."
  }),
  fakeProduct("20", "outdoor", "Balıkçı Bıçağı", 500, 20, "balikciBicagi.png", 0, {
    shortDescription: "Yüzer saplı, suya düşse de batmayan balıkçı bıçağı.",
    features: ["Sap: Mantar/EVA (Suda batmaz)", "Çelik: 4116 Esnek", "Uç: İğne Uç", "Kılıf: Plastik"],
    longDescription: "Teknede veya kıyıda bıçağınız suya düşse bile batmaz. Esnek namlusu balık temizlemeyi kolaylaştırır.",
    usage: "Balık temizleme, fileto.",
    care: "Tuzlu sudan sonra tatlı su ile yıkayınız."
  }),
  fakeProduct("21", "outdoor", "Dağcı Bıçağı", 850, 7, "dagciBicagi.png", 0, {
    shortDescription: "Tırmanış iplerini kesmek için tırtıklı ağza sahip, karabinalı bıçak.",
    features: ["Ağız: Yarı Tırtıklı (Serrated)", "Ağırlık: Ultra Hafif", "Delik: Karabina Bağlantısı", "Tek El Açılım"],
    longDescription: "Yüksek irtifada ağırlık yapmaz. Tırtıklı ağzı sayesinde kalın halatları tek hamlede keser.",
    usage: "Dağcılık, tırmanış.",
    care: "Mekanizmayı temiz tutunuz."
  }),
  fakeProduct("22", "outdoor", "Outdoor Bıçak (Kılıflı)", 920, 0, "outdoorBicakKilifli.png", 0, {
    shortDescription: "Klasik drop-point namlulu, deri kılıflı kamp bıçağı.",
    features: ["Model: Klasik Kamp", "Çelik: T5", "Sap: Ceviz", "Kılıf: Taba Renk Deri"],
    longDescription: "Hem gıda hazırlamak hem de odun yontmak için " + "her işe yarar" + " formunda tasarlanmıştır.",
    usage: "Genel kamp kullanımı.",
    care: "Deri kılıfı vazelin ile besleyiniz."
  }),
  fakeProduct("23", "outdoor", "Ahşap Saplı Av Bıçağı", 710, 4, "ahsapSapliAvBicagi.png", 0, {
    shortDescription: "Anadolu motifi işlemeli, estetik av bıçağı.",
    features: ["Sap: Kök Ceviz", "Namlu: Asit İndirme Desenli", "Çelik: 4034", "Boyut: 22 cm"],
    longDescription: "Namlusundaki estetik işlemeler ve ergonomik ahşap sapı ile hem vitrinlik hem kullanımlık.",
    usage: "Hafif av işleri, piknik.",
    care: "Desenlerin bozulmaması için tellemeyiniz."
  }),
  fakeProduct("24", "outdoor", "Premium Outdoor Bıçak", 2100, 1, "premiumOutdoorBicak.png", 0, {
    shortDescription: "N690 Böhler çelikten üretilmiş, mikarta saplı üst düzey bıçak.",
    features: ["Çelik: Böhler N690 (Avusturya)", "Sertlik: 60 HRC", "Sap: Yeşil Kanvas Mikarta", "Kılıf: Kydex"],
    longDescription: "Dünyanın en iyi bıçak çeliklerinden biri olan N690 ile üretildi. Kydex kılıfı taktiksel taşıma imkanı sunar.",
    usage: "Profesyonel outdoor, survival.",
    care: "Elmas bileyici ile bilenmelidir."
  }),

  // --- BIÇAKLAR (Mutfak Yardımcıları) ---
  fakeProduct("25", "bicaklar", "Mutfak Bıçağı", 199, 15, "mutfakBicagi.png", 0, {
    shortDescription: "Her mutfağın demirbaşı, çok amaçlı 12 cm bıçak.",
    features: ["Boyut: 12-14 cm", "Sap: Plastik", "Çelik: Paslanmaz", "Paket: Tekli"],
    longDescription: "Kahvaltıda peynir kesmekten, elma soymaya kadar gün içinde elinizin en çok gittiği bıçak.",
    usage: "Genel basit kesim işleri.",
    care: "Bulaşık makinesinde yıkanabilir."
  }),
  fakeProduct("26", "bicaklar", "Ekmek Bıçağı", 250, 10, "ekmekBicagi.png", 0, {
    shortDescription: "Özel dişli yapısı ile taze ekmekleri ezmeden dilimler.",
    features: ["Ağız: Tırtıklı (Serrated)", "Boy: 28 cm", "Çelik: Esnek Paslanmaz", "Sap: Kaymaz"],
    longDescription: "Sadece ekmek değil, dışı sert içi yumuşak olan domates veya ananas gibi ürünleri de mükemmel keser.",
    usage: "Ekmek, kek, pasta, domates.",
    care: "Bileme gerektirmez."
  }),
  fakeProduct("27", "bicaklar", "Peynir Bıçağı", 180, 0, "peynirBicagi.png", 0, {
    shortDescription: "Peynirin yapışmasını önleyen delikli ve çatal uçlu tasarım.",
    features: ["Tip: Delikli", "Uç: Servis Çatalı", "Sap: Ergonomik", "Çelik: 304 Kalite"],
    longDescription: "Yumuşak peynirler (Brie, Kaşar vb.) bıçağa yapışmadan kesilir. Ucundaki çatal ile dokunmadan servis yapabilirsiniz.",
    usage: "Peynir tabağı hazırlığı.",
    care: "Elde yıkayınız."
  }),
  fakeProduct("28", "bicaklar", "Soyma Bıçağı", 150, 30, "soymaBicagi.png", 0, {
    shortDescription: "Kavisli 'Gaga' ucuyla sebzeleri ziyan etmeden soyar.",
    features: ["Uç Tipi: Tourne (Kuş Gagası)", "Boy: 7 cm", "Sap: Plastik", "Keskinlik: Yüksek"],
    longDescription: "Avucunuza tam oturur. Özellikle yuvarlak meyve ve sebzeleri soymak için ideal kavisli yapıdadır.",
    usage: "Patates, elma soyma.",
    care: "Makinede yıkanabilir."
  }),
  fakeProduct("29", "bicaklar", "Domates Bıçağı", 170, 25, "domatesBicagi.png", 0, {
    shortDescription: "Mikro tırtıklı ağzı ile domatesin kabuğunu kaymadan keser.",
    features: ["Ağız: Mikro Dişli", "Çelik: Paslanmaz", "Sap: Renkli", "Boy: 12 cm"],
    longDescription: "Bıçağın domates kabuğu üzerinde kaymasını engelleyen ince dişlere sahiptir. Ezmeden incecik dilimler çıkarır.",
    usage: "Domates, narenciye, sosis.",
    care: "Bileme gerektirmez."
  }),
  fakeProduct("30", "bicaklar", "Fileto Bıçağı", 350, 10, "filetoBicagi.png", 0, {
    shortDescription: "Esnek namlusuyla balık filetosunu kılçıktan sıyırır.",
    features: ["Namlu: Esnek (Flexible)", "Boy: 16-20 cm", "Çelik: 4116", "Uç: Sivri"],
    longDescription: "Namlusu bükülebilir yapıdadır, bu sayede omurga kemiğini takip ederek eti ziyan etmeden ayırır.",
    usage: "Balık fileto, tavuk göğsü açma.",
    care: "Dikkatli kullanınız, çok keskindir."
  }),
  fakeProduct("31", "bicaklar", "Lazer Kesim Bıçak", 220, 5, "lazerKesimBicak.png", 0, {
    shortDescription: "Lazer teknolojisiyle bilenmiş, uzun süre körelmeyen ekonomik bıçak.",
    features: ["Bileme: Lazer", "Ağız: Tırtıklı", "Metal Kalınlığı: 1.5mm", "Kullanım: Pratik"],
    longDescription: "Bileme derdi olmayan, uygun fiyatlı ve çok keskin bir alternatiftir. Öğrenciler ve yazlıklar için ideal.",
    usage: "Genel mutfak.",
    care: "Bilenmez."
  }),
  fakeProduct("32", "bicaklar", "Seramik Bıçak", 400, 8, "seramikBicak.png", 0, {
    shortDescription: "Asla paslanmaz, metal tadı bırakmaz, ultra sert Zirkonyum.",
    features: ["Malzeme: Siyah/Beyaz Seramik", "Sertlik: Çelikten sert", "Özellik: Anti-Alerjik", "Koku: Tutmaz"],
    longDescription: "Meyve asitlerinden etkilenmez, gıdaların kararmasını geciktirir. Çelikten daha uzun süre keskin kalır.",
    usage: "Kemiksiz yumuşak gıdalar.",
    care: "Düşürmeyiniz, kırılgandır. Sadece elde yıkayın."
  }),
  fakeProduct("33", "bicaklar", "Meyve Bıçağı", 99, 50, "meyveBicagi.png", 0, {
    shortDescription: "6'lı paket halinde satılan klasik renkli saplı meyve bıçakları.",
    features: ["Paket: 6 Adet", "Sap: Karışık Renk", "Boy: Küçük", "Uygun Fiyat"],
    longDescription: "Misafirlerinize meyve ikram ederken veya günlük kahvaltılarda kullanabileceğiniz ekonomik set.",
    usage: "Meyve tabağı.",
    care: "Bulaşık makinesinde yıkanabilir."
  }),
  fakeProduct("34", "bicaklar", "Dekor Bıçağı", 210, 0, "dekorBicagi.png", 0, {
    shortDescription: "Şekilli kesimler (zikzak) yapmak için özel bıçak.",
    features: ["Ağız: Zikzak/Dalgalı", "Sap: Sağlam Plastik", "Çelik: Paslanmaz", "Kullanım: Süsleme"],
    longDescription: "Patates kızartması, havuç veya salatalıklara şekil vermek için kullanılır.",
    usage: "Garnish, sunum hazırlığı.",
    care: "Elde yıkayınız."
  }),
  fakeProduct("35", "bicaklar", "Pizza Bıçağı", 190, 14, "pizzaBicagi.png", 0, {
    shortDescription: "Büyük çaplı tekerlek bıçak, pizzayı dağıtmadan keser.",
    features: ["Tip: Tekerlek (Rulet)", "Çap: 10 cm", "Koruma: Parmak Koruyucu", "Sap: Kaymaz"],
    longDescription: "Sıcak peyniri sürüklemeden hamuru tek seferde keser. Börek ve lahmacun için de uygundur.",
    usage: "Hamur işleri.",
    care: "Tekerlek arasını fırça ile temizleyiniz."
  }),
  fakeProduct("36", "bicaklar", "Genel Amaçlı Bıçak", 230, 11, "genelAmacliBicak.png", 0, {
    shortDescription: "Utility Knife olarak bilinen, şef bıçağının küçük kardeşi.",
    features: ["Boy: 15 cm", "Tip: Utility", "Denge: Orta", "Çelik: 4034"],
    longDescription: "Şef bıçağının büyük geldiği, soyma bıçağının küçük kaldığı ara işler için en ideal boyuttur.",
    usage: "Sandviç hazırlama, peynir kesme.",
    care: "Makinede yıkanabilir."
  }),

  // --- BIÇAK SETLERİ ---
  fakeProduct("37", "bicak-seti", "3'lü Bıçak Seti", 799, 10, "bicakSeti3lu.png", 0, {
    shortDescription: "Mutfağın 3 silahşörü: Şef(19cm) + Ekmek(20cm) + Soyma(12cm).",
    features: ["Set: 3 Parça", "Çelik: T5", "Sap: Plastik", "Kutu: Hediye Kutulu"],
    longDescription: "Cavit İnox kalitesiyle en temel ihtiyaçlar bir arada. Yeni eve taşınanlar için mükemmel bir hediye.",
    usage: "Temel mutfak kurulumu.",
    care: "Elde yıkama önerilir."
  }),
  fakeProduct("38", "bicak-seti", "5'li Bıçak Seti (Standlı)", 1499, 5, "bicakSeti5liStandli.png", 0, {
    shortDescription: "Doğal ahşap standı ile tezgahınızda şık duran 5'li set.",
    features: ["Stand: Kayın Ağacı", "İçerik: Şef, Ekmek, Dilimleme, Çok Amaçlı, Soyma", "Çelik: 1.4116", "Renk: Siyah Sap"],
    longDescription: "Bıçaklarınız çekmecede birbirine çarpıp körelmesin. Stand sayesinde hem düzenli hem keskin kalırlar.",
    usage: "Tam kapsamlı mutfak.",
    care: "Bıçaklar yıkanıp kurulanarak standa konmalıdır."
  }),
  fakeProduct("39", "bicak-seti", "Mıknatıslı Bıçak Seti", 1899, 0, "miknatisliBicakSeti.png", 0, {
    shortDescription: "Duvara monte güçlü manyetik askı ve 4 adet profesyonel bıçak.",
    features: ["Askı: 35 cm Güçlü Mıknatıs", "Bıçaklar: Dövme Çelik Görünümlü", "Montaj: Dübel/Vida Dahil", "Modern"],
    longDescription: "Profesyonel mutfaklardaki gibi bıçaklarınız elinizin altında olsun. Yerden tasarruf sağlar.",
    usage: "Modern mutfak dizaynı.",
    care: "Bıçakları mıknatısa yavaşça bırakınız."
  }),
  fakeProduct("40", "bicak-seti", "Profesyonel Başlangıç Seti", 2100, 8, "profesyonelBaslangicSeti.png", 0, {
    shortDescription: "Aşçılık öğrencileri için rulo çantalı eğitim seti.",
    features: ["Çanta: Kanvas Rulo", "İçerik: 5 Bıçak + 1 Masat", "Çelik: N6MOV (Fransız)", "Güvenli"],
    longDescription: "Okula veya işe giderken kendi bıçak setinizi güvenle taşıyın. Masat dahildir.",
    usage: "Gastronomi öğrencileri, mobil şefler.",
    care: "Her kullanımdan sonra temizlenip çantaya konmalı."
  }),
  fakeProduct("41", "bicak-seti", "Steak Bıçak Seti", 999, 3, "steakBicakSeti.png", 0, {
    shortDescription: "6 kişilik, etleri suyu akmadan kesen özel dişli sofra bıçağı.",
    features: ["Adet: 6 Kişilik", "Uç: Sivri", "Ağız: Yarım Dişli", "Sap: Ahşap Görünümlü Bakalit"],
    longDescription: "Mangal keyfiniz zehir olmasın. Pişmiş eti zorlanmadan lokmalık kesmek için tasarlanmıştır.",
    usage: "Izgara et servisi.",
    care: "Makinede yıkanabilir."
  }),
  fakeProduct("42", "bicak-seti", "Renkli Bıçak Seti", 699, 12, "renkliBicakSeti.png", 0, {
    shortDescription: "HACCP standartlarına uygun, çapraz bulaşmayı önleyen renkli set.",
    features: ["Renkler: Kırmızı(Et), Yeşil(Sebze), Sarı(Tavuk), Mavi(Balık)", "Sap: Hijyenik", "Çelik: Paslanmaz", "Profesyonel"],
    longDescription: "Hangi bıçağı hangi gıdada kullandığınızı karıştırmayın. Profesyonel mutfak hijyen kurallarına uygundur.",
    usage: "Hijyenik gıda hazırlığı.",
    care: "Sanayi tipi bulaşık makinesine uygundur."
  }),
  fakeProduct("43", "bicak-seti", "Ahşap Bloklu Set", 2499, 2, "ahsapBlokluSet.png", 0, {
    shortDescription: "Ağır ve oturaklı ceviz bloğu ile premium bir set.",
    features: ["Blok: Masif Ceviz", "Bıçaklar: Yüksek Karbonlu Çelik", "Sap: Perçinli", "Prestij"],
    longDescription: "Mutfağınızın en değerli köşesi olacak. Klasik perçinli sap tasarımı ile ömür boyu kullanım sunar.",
    usage: "Evladiyelik kullanım.",
    care: "Bloğu sudan uzak tutunuz."
  }),
  fakeProduct("44", "bicak-seti", "Full Çelik Set", 2999, 20, "fullCelikSet.png", 0, {
    shortDescription: "Saptan uca yekpare çelik tasarım. En hijyenik seri.",
    features: ["Gövde: Monoblok Çelik", "Denge: Mükemmel", "Tasarı: Modern/Minimal", "Temizlik: En Kolay"],
    longDescription: "Sap ile namlu arasında bakteri birikecek hiçbir boşluk yoktur. Modern mutfaklar için şık ve ultra hijyenik.",
    usage: "Titiz kullanıcılar.",
    care: "Bulaşık makinesinden lekesiz çıkar."
  }),
  fakeProduct("45", "bicak-seti", "Ekonomik Set", 499, 7, "ekonomikSet.png", 0, {
    shortDescription: "Öğrenci evleri ve yazlıklar için temel ihtiyaç paketi.",
    features: ["Fiyat: Uygun", "İçerik: 3 Bıçak", "Kalite: Standart", "Hafif"],
    longDescription: "Yüksek performans beklemeden günü kurtarmak isteyenler için bütçe dostu çözüm.",
    usage: "Basit işler.",
    care: "Makinede yıkanabilir."
  }),
  fakeProduct("46", "bicak-seti", "Lüks Bıçak Seti", 3499, 0, "luxBicakSeti.png", 0, {
    shortDescription: "Damascus desenli çelik ve epoksi saplı sanat eseri seti.",
    features: ["Çelik: 67 Katman VG10", "Sap: Mavi Epoksi & Ahşap", "Kutu: Deri Kaplama", "Sertlik: 62 HRC"],
    longDescription: "Sadece kesmek için değil, seyretmek için de tasarlandı. Mutfak tutkunları için en özel hediye.",
    usage: "Özel sunumlar.",
    care: "Sadece elde, yumuşak süngerle."
  }),
  fakeProduct("47", "bicak-seti", "Taşıma Çantalı Set", 2899, 4, "tasimaCantaliSet.png", 0, {
    shortDescription: "Sert kapaklı 'Bond Çanta' içinde şifreli profesyonel set.",
    features: ["Çanta: Alüminyum/Sert", "Kilit: Şifreli", "İçerik: Full Set + Satır", "Profesyonel"],
    longDescription: "Catering hizmeti veren şefler için mobil mutfak. Bıçaklarınız kilit altında güvende.",
    usage: "Executive Chef kullanımı.",
    care: "Çanta temizliğine özen gösteriniz."
  }),
  fakeProduct("48", "bicak-seti", "2'li Şef Seti", 1199, 1, "2liSefSeti.png", 0, {
    shortDescription: "Şef Bıçağı + Santoku Bıçağı ikilisi.",
    features: ["İkili: Avrupa ve Japon Tarzı", "Çelik: 1.4116", "Sap: Gül Ağacı", "Tamamlayıcı"],
    longDescription: "Hem klasik sallama hareketini sevenler hem de Japon usulü dikey kesim yapanlar için iki ana bıçak.",
    usage: "Profesyonel hazırlık.",
    care: "Elde yıkayınız."
  }),

  // --- KASAP BIÇAKLARI (Genel Konsept: Sürmene / Çakıroğlu / T5 Çelik) ---
  fakeProduct("49", "kasap", "Kasap Bıçağı No:1", 300, 10, "kasapBicagiNo1.png", 0, {
    shortDescription: "Sürmene tipi, 14 cm namlulu pratik kasap bıçağı.",
    features: ["Model: No 1", "Namlu: 14 cm", "Çelik: T5 Fransız", "Sap: Perçinli Venge"],
    longDescription: "Elde çok rahat dönen, hafif ve keskin. Tavuk açmak ve küçük etleri doğramak için ustaların tercihi.",
    usage: "Seri kullanım, tezgah işleri.",
    care: "Masat ile her gün bileylenmeli."
  }),
  fakeProduct("50", "kasap", "Kasap Bıçağı No:2", 350, 5, "kasapBicagiNo2.png", 0, {
    shortDescription: "En çok satılan standart boy (16-17 cm) kasap bıçağı.",
    features: ["Model: No 2", "Namlu: 16.5 cm", "Çelik: CK75 / T5", "Sap: Ergonomik Ahşap"],
    longDescription: "Kurban bayramlarının ve kasap dükkanlarının vazgeçilmezi. İdeal boyutuyla hem sıyırma hem doğrama yapar.",
    usage: "Genel kasaplık, kurban kesimi.",
    care: "Kanlı bırakmayınız, pas yapabilir."
  }),
  fakeProduct("51", "kasap", "Kasap Bıçağı No:3", 400, 0, "kasapBicagiNo3.png", 0, {
    shortDescription: "Büyük parça etleri işlemek için 19 cm namlulu büyük boy bıçak.",
    features: ["Model: No 3", "Namlu: 19 cm", "Çelik: Yüksek Karbon", "Güç: Yüksek"],
    longDescription: "Dana budunu parçalamak, büyük rostoluk etleri hazırlamak için gereken güç ve uzunluk.",
    usage: "Karkas parçalama.",
    care: "Kullandıktan sonra yağlayınız."
  }),
  fakeProduct("52", "kasap", "Sıyırma Bıçağı", 280, 8, "siyirmaBicagi.png", 0, {
    shortDescription: "Sivri ucu ve kavisli yapısıyla kemiğe sıfır giren bıçak.",
    features: ["Tip: Sıyırma", "Çelik: Esnek T5", "Sap: Kaymaz Plastik", "Uç: Sivri"],
    longDescription: "Kemiğin etrafında dönerek eti ziyan etmeden ayırmanızı sağlar. Kasapların 'kalem' dediği bıçak.",
    usage: "Kemik sıyırma.",
    care: "Ucu köreldiğinde mutlaka bileyin."
  }),
  fakeProduct("53", "kasap", "Yüzme Bıçağı", 290, 3, "deriyuzmeBicagi.png", 0, {
    shortDescription: "Deriyi delmeden yüzmek için küt ve geniş ağızlı.",
    features: ["Tip: Yüzme", "Ağız: Kavisli/Küt", "Sap: Ahşap", "Risk: Düşük"],
    longDescription: "Kurban derisini tulum çıkarmak veya hasarsız yüzmek için ucu kütleştirilmiş ve göbeği genişletilmiştir.",
    usage: "Deri yüzme.",
    care: "Sadece yüzme işleminde kullanınız."
  }),
  fakeProduct("54", "kasap", "Kurban Bıçağı Seti", 1200, 12, "kurbanBicagiSeti.png", 0, {
    shortDescription: "Kesim, Yüzme ve Sıyırma bıçaklarından oluşan 3'lü set + Masat.",
    features: ["İçerik: Boğazlama(25cm), Yüzme, Sıyırma", "Çelik: Dövme Çelik", "Sap: Ceviz", "Tam Set"],
    longDescription: "Kurban ibadetinizi eziyete dönüştürmeden, keskin ve doğru bıçaklarla halletmeniz için hazırlandı.",
    usage: "Kurban bayramı.",
    care: "Yılda bir kullanıyorsanız yağlayıp gazeteye sararak saklayın."
  }),
  fakeProduct("55", "kasap", "Dövme Kasap Bıçağı", 550, 2, "dovmeKasapBicagi.png", 0, {
    shortDescription: "Örste dövülmüş, siyah karartmalı otantik kasap bıçağı.",
    features: ["İşlem: Sıcak Dövme", "Görünüm: Ham (Brut de Forge)", "Keskinlik: Çok Yüksek", "Sap: Yanık Ahşap"],
    longDescription: "Çeliğin suyu örste verilmiştir. Fabrikasyon bıçaklara göre çok daha serttir ve zor körelir.",
    usage: "Profesyonel kasap.",
    care: "Mutlaka kurulanmalıdır, paslanabilir."
  }),
  fakeProduct("56", "kasap", "Kemik Sıyırma Bıçağı", 310, 20, "kemikSiyirmaBicagi.png", 0, {
    shortDescription: "Mezbaha tipi, sert plastik saplı seri sıyırma bıçağı.",
    features: ["Sap: Sarı/Mavi Plastik", "Çelik: 1.4116", "Sertlik: 56 HRC", "Hijyenik"],
    longDescription: "Et entegre tesislerinde kullanılan, elden kaymayan ve sterilize edilebilen model.",
    usage: "Sanayi tipi sıyırma.",
    care: "Bulaşık makinesine uygundur."
  }),
  fakeProduct("57", "kasap", "Deri Yüzme Bıçağı (Ahşap)", 300, 7, "deriYuzmeBicagiAhsap.png", 0, {
    shortDescription: "Geleneksel ahşap saplı deri yüzme bıçağı.",
    features: ["Sap: Gürgen Ağacı", "Tip: Yüzme", "Çelik: T5", "Ekonomik"],
    longDescription: "Eskilerin kullandığı klasik model. Ahşap sap ele oturur ve terletmez.",
    usage: "Deri yüzme.",
    care: "Elde yıkayınız."
  }),
  fakeProduct("58", "kasap", "Kasap Satırı (Küçük)", 600, 0, "kasapSatiriKucuk.png", 0, {
    shortDescription: "Tavuk ve kuzu kemiği için 400gr ağırlığında el satırı.",
    features: ["Ağırlık: 400-500 gr", "Çelik: Paslanmaz", "Sap: Perçinli", "Boyut: Kompakt"],
    longDescription: "Bileği yormaz. Tavuk parçalamak ve kaburga kırmak için idealdir.",
    usage: "Tavuk, kuzu.",
    care: "Bulaşık makinesinde yıkanabilir."
  }),
  fakeProduct("59", "kasap", "Et Açma Bıçağı", 450, 4, "etAcmaBicagi.png", 0, {
    shortDescription: "Geniş ve ağır namlusuyla eti inceltmek için kullanılır.",
    features: ["Namlu: Geniş", "Ağırlık: Dengeli", "İşlev: Dövme/Açma", "Çelik: T5"],
    longDescription: "Bıçağın yan yüzeyiyle eti dövebilir, keskin ağzıyla şinitzel veya biftek açabilirsiniz.",
    usage: "Biftek hazırlığı.",
    care: "Elde yıkayınız."
  }),
  fakeProduct("60", "kasap", "Premium Kasap Seti", 1999, 1, "premiumKasapSeti.png", 0, {
    shortDescription: "Profesyonel dükkan açılışı için gerekli tüm bıçaklar.",
    features: ["Kalite: A++", "Çelik: N690 / T7", "Sap: Gül Ağacı", "Garanti: Ömür Boyu"],
    longDescription: "Ustasından ustasına miras kalacak kalitede, en iyi çelikten üretilmiş set.",
    usage: "Master Kasap.",
    care: "Özel bakım ister."
  }),

  // --- SATIRLAR ---
  fakeProduct("61", "satirlar", "Ağır Hizmet Satır", 899, 10, "agirHizmetSatir.png", 0, {
    shortDescription: "1 Kg üzeri ağırlığıyla dana kemiklerini tek vuruşta kırar.",
    features: ["Ağırlık: 1.2 Kg", "Sırt: 6 mm", "Çelik: CK75 Yay Çeliği", "Sap: Perçinli Ağaç"],
    longDescription: "Ağzı kemik kırmak için özel açılmıştır (balta ağzı). Dönme veya kırılma yapmaz.",
    usage: "Büyükbaş kemik.",
    care: "Paslanır çelik, yağlı saklayın."
  }),
  fakeProduct("62", "satirlar", "Et Parçalama Satırı", 750, 5, "etParcalamaSatiri.png", 0, {
    shortDescription: "Hem kesen hem kıran, orta ağırlıkta (700gr) satır.",
    features: ["Ağırlık: 700 gr", "Ağız: Keskin", "Tip: Klasik", "Çelik: Paslanmaz"],
    longDescription: "Tezgahta eti porsiyonlarken hem kemiğe vurabilir hem de eti kesebilirsiniz.",
    usage: "Genel kasaplık.",
    care: "Elde yıkayınız."
  }),
  fakeProduct("63", "satirlar", "Mutfak Tipi Satır", 550, 0, "mutfakTipiSatir.png", 0, {
    shortDescription: "Ev hanımları için hafifletilmiş, güvenli satır.",
    features: ["Ağırlık: 300 gr", "Görünüm: Satır", "İşlev: Bıçak/Satır Hibrit", "Sap: Plastik"],
    longDescription: "Satır görüntüsündedir ama bıçak gibi keskin ve hafiftir. Sert sebzeleri (balkabağı) kesmek için idealdir.",
    usage: "Ev mutfağı.",
    care: "Makinede yıkanabilir."
  }),
  fakeProduct("64", "satirlar", "Dövme Çelik Satır", 990, 8, "dovmeCelikSatir.png", 0, {
    shortDescription: "Geleneksel ocaklarda dövülerek şekillendirilmiş el yapımı satır.",
    features: ["Yapı: Dövme", "Yüzey: Siyah", "Sap: Bütünleşik (Full Tang)", "Sağlamlık: Çok Yüksek"],
    longDescription: "Makine presi değil, çekiç darbesiyle üretilmiştir. Çeliğin en saf ve sert halidir.",
    usage: "Ağır işler.",
    care: "Paslanmaya karşı koruyunuz."
  }),
  fakeProduct("65", "satirlar", "Kasap Satırı (Büyük)", 950, 3, "kasapSatiriBuyuk.png", 0, {
    shortDescription: "Geniş yüzeyi ile tezgah temizliği ve taşıma işlevi de görür.",
    features: ["Yüzey: Geniş (20cm)", "Çelik: Paslanmaz", "Sap: Ahşap", "Klasik"],
    longDescription: "Kıymayı ve etleri üzerinde taşıyıp tezgaha vurmak için geniş yüzeyli tasarlanmıştır.",
    usage: "Tezgah satırı.",
    care: "Elde yıkayınız."
  }),
  fakeProduct("66", "satirlar", "Kallavi Satır", 1100, 12, "kallaviSatir.png", 0, {
    shortDescription: "Gaziantep işi, devasa ve gösterişli satır.",
    features: ["Boyut: XL", "Görünüm: Heybetli", "Sap: Özel İşlemeli", "Kullanım: Zırh/Satır"],
    longDescription: "Vitrinde sergilemek veya ocak başında şov yapmak için üretilmiş özel parçadır.",
    usage: "Şov ve kebap.",
    care: "Dikkatli taşıyınız."
  }),
  fakeProduct("67", "satirlar", "Zırh Satırı (Tek Sap)", 450, 2, "zirhSatiriTekSap.png", 0, {
    shortDescription: "Evde zırh kıyması yapmak için tek elle kullanılan model.",
    features: ["Tip: Pala/Zırh", "Ağız: Kavisli", "Sap: Tek", "Keskinlik: Jilet"],
    longDescription: "Eti ezmeden, suyunu kaçırmadan kıymak için kavisli yapıda üretilmiştir.",
    usage: "Kıyma çekme.",
    care: "Elde yıkayıp asınız."
  }),
  fakeProduct("68", "satirlar", "Zırh Satırı (Çift Sap)", 650, 20, "zirhSatiriCiftSap.png", 0, {
    shortDescription: "Adana kebapçılarının kullandığı orijinal çift saplı zırh.",
    features: ["Tip: Profesyonel Zırh", "Sap: Çift (İki El)", "Boy: 50 cm", "Çelik: Yay Çeliği"],
    longDescription: "İki elle ritmik hareketlerle eti ve sebzeyi aynı anda kıymak için kullanılır. Gerçek kebap lezzetinin sırrıdır.",
    usage: "Profesyonel kebap.",
    care: "Kullandıktan sonra hemen temizleyip yağlayınız."
  }),
  fakeProduct("69", "satirlar", "Döner Bıçağı Satırı", 700, 7, "donerBicagiSatiri.png", 0, {
    shortDescription: "50 cm uzunluğunda, ince ve esnek döner kesme bıçağı.",
    features: ["Boy: 50-60 cm", "Tip: Döner", "Esneklik: Hafif", "Keskinlik: Maksimum"],
    longDescription: "Döneri yaprak gibi ince kesmek için özel olarak bilenmiştir. Sıcağa dayanıklı sap kullanılmıştır.",
    usage: "Döner kesimi.",
    care: "Ağzını sürekli masatlayınız."
  }),
  fakeProduct("70", "satirlar", "İnce Et Satırı", 610, 0, "inceEtSatiri.png", 0, {
    shortDescription: "Kokoreç ve tantuni kesmek için kullanılan ince satır.",
    features: ["Kullanım: Kokoreç/Tantuni", "Ağırlık: Hafif", "Hız: Yüksek", "Çelik: Paslanmaz"],
    longDescription: "Seri vuruşlar yapmak için hafiftir. Sac üzerinde metale vurmaya dayanıklıdır.",
    usage: "Sokak lezzetleri.",
    care: "Sık bileme ister."
  }),
  fakeProduct("71", "satirlar", "Kemik Kırma Satırı", 920, 4, "kemikKirmaSatiri.png", 0, {
    shortDescription: "Sadece kemik kırmak için tasarlanmış küt ağızlı balyoz satır.",
    features: ["Ağız açısı: 40 derece (Küt)", "Ağırlık: Yüksek", "Dayanım: Kırılmaz", "Çelik: Karbon"],
    longDescription: "Bu satır kesmek için değil, kırmak içindir. Ağzı bilerek küt bırakılmıştır ki kemiğe vurunca dönmesin.",
    usage: "İlikli kemik kırma.",
    care: "Paslanır."
  }),
  fakeProduct("72", "satirlar", "Premium Dövme Satır", 1400, 1, "premiumDovmeSatir.png", 0, {
    shortDescription: "Özel deri kılıflı, sapı geyik boynuzu veya özel ahşap satır.",
    features: ["Malzeme: Premium", "Kılıf: Deri", "Sap: Boynuz/Kök Ceviz", "İşçilik: El Yapımı"],
    longDescription: "Koleksiyonerler için özel üretilmiştir. Hem işlevsel hem de görsel bir şaheserdir.",
    usage: "Koleksiyon.",
    care: "Özel bakım yağı ile."
  }),

  // --- BİLEYİCİ & MASATLAR (Cavit İnox & Profesyonel Seriler) ---
  fakeProduct("73", "bileyici-masatlar", "Profesyonel Masat", 350, 10, "profesyonelMasat.png", 0, {
    shortDescription: "Mıknatıslı ucu metal tozlarını tutan, yivli çelik masat.",
    features: ["Tip: Yivli Çelik", "Boy: 30 cm", "Sap: Halkalı Plastik", "Özellik: Mıknatıslı"],
    longDescription: "Bıçağın ağzını düzeltir (honing) ve üzerindeki metal kıymıklarını mıknatısı sayesinde toplar.",
    usage: "Günlük bakım.",
    care: "Kuru bezle siliniz, yıkamayınız."
  }),
  fakeProduct("74", "bileyici-masatlar", "Elmas Masat", 550, 5, "elmasMasat.png", 0, {
    shortDescription: "Oval yapıda, endüstriyel elmas tozu kaplı aşındırıcı masat.",
    features: ["Kaplama: Elmas Tozu", "Şekil: Oval", "Aşındırma: Yüksek", "Hız: Çok Hızlı"],
    longDescription: "Normal masatların düzeltemediği körelmiş bıçaklardan talaş kaldırarak yeniden keskinleştirir.",
    usage: "Kör bıçaklar.",
    care: "Suyla yıkamayınız, kaplaması zarar görebilir."
  }),
  fakeProduct("75", "bileyici-masatlar", "Bileme Taşı (1000/3000)", 700, 0, "bilemeTasi1000_3000.png", 0, {
    shortDescription: "Japon grit standartlarında çift taraflı su taşı.",
    features: ["Grit: 1000 (Bileme) / 3000 (Parlatma)", "Tip: Sulu", "Taban: Silikon", "Sonuç: Jilet"],
    longDescription: "1000 tarafı ile ağız açıp, 3000 tarafı ile kılığını alıp parlatabilirsiniz. Profesyonel sonuç verir.",
    usage: "Detaylı bileme seansı.",
    care: "Kullanmadan önce 10 dk suda bekletin."
  }),
  fakeProduct("76", "bileyici-masatlar", "Bileme Taşı (400/1000)", 650, 8, "bilemeTasi400_1000.png", 0, {
    shortDescription: "Ağzı bozulmuş bıçakları onarmak için kalın kumlu taş.",
    features: ["Grit: 400 (Onarım) / 1000 (Bileme)", "Kullanım: Kaba işlem", "Boyut: Büyük", "Ekonomik"],
    longDescription: "Bıçağınızda çentik varsa 400 kum ile giderip 1000 kum ile keskinleştirebilirsiniz.",
    usage: "Hasarlı bıçaklar.",
    care: "Düz zeminde kullanın."
  }),
  fakeProduct("77", "bileyici-masatlar", "Çelik Bileme Çubuğu", 400, 3, "celikBilemeCubugu.png", 0, {
    shortDescription: "Klasik yuvarlak, sert krom kaplı ev tipi masat.",
    features: ["Tip: Yuvarlak", "Kaplama: Sert Krom", "Boy: 25 cm", "Basit"],
    longDescription: "Evdeki bıçaklarınızı yemek yapmadan önce 3-4 sürtme ile canlandırmak için yeterlidir.",
    usage: "Ev tipi.",
    care: "Kuru saklayın."
  }),
  fakeProduct("78", "bileyici-masatlar", "Mekanik Bileyici", 250, 12, "mekanikBileyici.png", 0, {
    shortDescription: "Vakumlu tabanı ve karbür uçları ile pratik çek-bırak bileyici.",
    features: ["Sistem: Karbür Uçlar", "Güvenlik: Vantuzlu Taban", "Kullanım: Kolay", "Hızlı"],
    longDescription: "Masat kullanmayı bilmeyenler için en güvenli çözüm. Bıçağı yuvaya yerleştirip çekmeniz yeterli.",
    usage: "Acemi kullanıcılar.",
    care: "Metal tozunu dökünüz."
  }),
  fakeProduct("79", "bileyici-masatlar", "Kaydırmaz Standlı Bileme Taşı", 850, 2, "kaydirmazStandliBilemeTasi.png", 0, {
    shortDescription: "Taşın oynamasını engelleyen bambu standlı set.",
    features: ["Stand: Bambu + Kauçuk", "Taş: Korundum", "Aksesuar: Açı Tutucu", "Premium"],
    longDescription: "Bileme yaparken taşın kayması tehlikelidir. Bu stand taşı sabitler, açı tutucu ise doğru açıyı verir.",
    usage: "Güvenli bileme.",
    care: "Taşı kurutarak saklayın."
  }),
  fakeProduct("80", "bileyici-masatlar", "Seramik Masat", 480, 20, "seramikMasat.png", 0, {
    shortDescription: "Beyaz seramikten üretilmiş, bıçağı parlatarak keskinleştiren masat.",
    features: ["Malzeme: Alümina Seramik", "Grit: 2000 Eşdeğeri", "Sonuç: Pürüzsüz", "Hassas"],
    longDescription: "Metal masatlar gibi talaş kaldırmaz, sadece ağzı düzeltir ve parlatır. Çok keskin bıçaklar için idealdir.",
    usage: "Son rötuş.",
    care: "Düşerse kırılır."
  }),
  fakeProduct("81", "bileyici-masatlar", "Kasap Masatı (Uzun)", 420, 7, "kasapMasatiUzun.png", 0, {
    shortDescription: "Satırlar ve uzun döner bıçakları için 35-40 cm profesyonel masat.",
    features: ["Boy: Ekstra Uzun", "Sap: Geniş Korumalı", "Çelik: Yüksek Sertlik", "Ağır"],
    longDescription: "Uzun namlulu bıçakları tek seferde dipten uca masatlamak için boyu uzatılmıştır.",
    usage: "Profesyonel tezgah.",
    care: "Temiz bezle siliniz."
  }),
  fakeProduct("82", "bileyici-masatlar", "Bıçak Bileme Aleti", 199, 0, "bicakBilemeAleti.png", 0, {
    shortDescription: "Tezgah kenarına sıkıştırılabilen mini bileyici.",
    features: ["Boyut: Cep Boyu", "Uç: Seramik/Karbür", "Fiyat: Ucuz", "Pratik"],
    longDescription: "Yer kaplamaz, çekmecede durur. Acil durumlarda bıçağı hemen keskinleştirir.",
    usage: "Hızlı çözüm.",
    care: "Temizliği kolaydır."
  }),
  fakeProduct("83", "bileyici-masatlar", "Mini Masat", 150, 4, "miniMasat.png", 0, {
    shortDescription: "Çakılar ve av bıçakları için taşınabilir kalem masat.",
    features: ["Boyut: Kalem kadar", "Klips: Var", "Yüzey: Elmas", "Outdoor"],
    longDescription: "Doğada bıçağınız körelirse cebinizden çıkarıp saniyeler içinde bileyebilirsiniz.",
    usage: "Kamp, av.",
    care: "Kaybetmeyin."
  }),
  fakeProduct("84", "bileyici-masatlar", "Premium Bileme Seti", 1800, 1, "premiumBilemeSeti.png", 0, {
    shortDescription: "Ahşap kutu içinde taş, yağ, deri kayış ve masat içeren tam set.",
    features: ["Kutu: Ahşap", "İçerik: Full Bakım", "Yağ: Honing Oil", "Deri: Maslama Kayışı"],
    longDescription: "Bıçağına değer verenlerin ritüel seti. Bileme, parlatma ve koruma için her şey mevcut.",
    usage: "Bıçak tutkunları.",
    care: "Set parçalarını eksiksiz saklayın."
  }),
];