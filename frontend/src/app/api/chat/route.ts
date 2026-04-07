import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
import { ALL_PRODUCTS } from '@/lib/mock-data';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // 1. Ürün verisini metne dönüştür (Context oluşturma)
  const productContext = ALL_PRODUCTS.map(p => 
    `- ${p.title} (${p.category}): ${p.price} TL. Stok: ${p.stock > 0 ? 'Var ('+p.stock+')' : 'YOK'}. ID: ${p.id}`
  ).join('\n');

  const result = streamText({
    model: google('gemini-1.5-flash'),

    system: `
      Sen Ülgen Paslanmaz'ın (Geleneksel Sürmene Bıçakları üreticisi) resmi yapay zeka asistanısın.
      SADECE Ülgen Paslanmaz ürünleri, siparişler ve bıçak bakımı hakkında yardımcı olursun.
      
      MARKA KİŞİLİĞİ:
      - Profesyonel, güvenilir, yardımsever ve hafifçe geleneksel (Sürmene ustalığına vurgu yapan).
      - Müşterilere saygılı, çözüm odaklı bir dille hitap et.
      
      YÖNLENDİRME (Tools):
      - Eğer kullanıcı belirli bir kategoriyi görmek istiyorsa 'goToCategoryPage' toolunu kullan.
      - Eğer kullanıcı spesifik bir ürüne gitmek istiyorsa 'goToProductPage' toolunu kullan.
      
      NAVİGASYON VE KATEGORİ SLUGLARI:
      - Bıçaklar: cat=bicaklar
      - Kasap Bıçakları: cat=kasap
      - Bıçak Setleri: cat=bicak-seti
      - Bileyiciler & Masatlar: cat=bileyici-masatlar
      - Şef Bıçakları: cat=sef-bicagi
      - Outdoor Bıçaklar: cat=outdoor
      - Satırlar: cat=satirlar


      ÜRÜN LİSTESİ:
      ${productContext}

      KURALLAR:
      1. Yanıtlarını kısa, öz ve Markdown formatında ver. 
      2. Kullanıcıyı bir sayfaya yönlendirmeden önce mutlaka sorusuna cevap ver. 
      3. Örneğin; "Tabii, kasap bıçaklarımız Sürmene çeliğinden üretilir. Sizi hemen ilgili sayfaya yönlendiriyorum." de ve ardından 'goToCategoryPage' toolunu çağır.
      4. Bıçak bakımı sorulursa: "Bulaşık makinesinde yıkamamanızı, elde yıkayıp kurularsanız ömürlük olacağını" belirt.
    `,

    messages: convertToModelMessages(messages),
    
    tools: {
      goToCategoryPage: tool({
        description: 'Kullanıcıyı belirli bir ürün kategorisi sayfasına yönlendirir.',
        parameters: z.object({
          categorySlug: z.string().describe('Yönlendirilecek kategori slugı (örn: kasap, sef-bicagi, meyve)'),
        }),
      }),
      goToProductPage: tool({
        description: 'Kullanıcıyı belirli bir ürün detay sayfasına yönlendirir.',
        parameters: z.object({
          productId: z.string().describe('Yönlendirilecek ürünün ID numarası.'),
        }),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}