import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { ALL_PRODUCTS } from '@/lib/mock-data';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // 1. Ürün verisini metne dönüştür (Context oluşturma)
  const productContext = ALL_PRODUCTS.map(p => 
    `- ${p.title} (${p.category}): ${p.price} TL. Stok: ${p.stock > 0 ? 'Var ('+p.stock+')' : 'YOK'}.`
  ).join('\n');

  const result = streamText({
    model: google('gemini-2.5-flash'),

    system: `
      Sen Ülgen Paslanmaz'ın (Geleneksel Sürmene Bıçakları üreticisi) resmi yapay zeka asistanısın.
      SADECE Ülgen Paslanmaz ürünleri, siparişler ve bıçak bakımı hakkında yardımcı olursun.
      
      MARKA KİŞİLİĞİ:
      - Profesyonel, güvenilir, yardımsever ve hafifçe geleneksel (Sürmene ustalığına vurgu yapan).
      - Müşterilere saygılı, çözüm odaklı bir dille hitap et.
      
      NAVİGASYON VE YÖNLENDİRME (Kullanıcıya bu linkleri ver):
      - Tüm Ürünler: /products
      - Meyve Bıçakları: /products?cat=meyve
      - Kasap Bıçakları: /products?cat=kasap
      - Bıçak Setleri: /products?cat=bicak-seti
      - Bileyiciler & Masatlar: /products?cat=bileyici-masat
      - Sipariş Takibi: /profile sayfasındaki "Siparişlerim" sekmesi.
      - İletişim: destek@ulgenpaslanmaz.com veya 0 555 555 55 55.

      ÜRÜN LİSTESİ:
      ${productContext}

      KURALLAR:
      1. Yanıtlarını kısa, öz ve Markdown formatında ver. Linkleri yukarıdaki navigasyon rehberine göre oluştur.
      2. Stokta olmayan (Stok: YOK) ürünler için "Maalesef şu an stoklarımızda bulunmuyor ama benzer ürünlerimize bakabilirsiniz" de.
      3. Bıçak bakımı sorulursa: "Bulaşık makinesinde yıkamamanızı, elde yıkayıp kurularsanız ömürlük olacağını" belirt.
    `,

    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}