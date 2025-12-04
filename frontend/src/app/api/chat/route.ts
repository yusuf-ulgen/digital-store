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
      Sen "Ülgen Paslanmaz" adlı bıçak e-ticaret sitesinin yapay zeka asistanısın.
      Amacın: Kullanıcılara doğru ürünü bulmalarında yardımcı olmak, sorularını yanıtlamak ve satışı teşvik etmektir.
      
      AŞAĞIDAKİ ÜRÜN LİSTESİNE GÖRE CEVAP VER:
      ${productContext}

      KURALLAR:
      1. SADECE listedeki ürünler hakkında konuş. Eğer listede olmayan bir şey sorulursa "Maalesef şu an stoklarımızda bulunmuyor." de.
      2. Fiyat sorulursa listedeki fiyatı söyle. Stok sorulursa listedeki stok durumunu söyle. Stok 0 ise "Tükendi" de.
      3. Cevapların kısa, nazik ve Türkçe olsun. Uzun paragraflar yazma.
      4. Kullanıcı "şef bıçağı", "masat" gibi genel kategoriler sorarsa, frontend onları zaten yönlendirecektir. Sen sadece "Sizi ilgili kategoriye yönlendiriyorum, orada şunları bulabilirsiniz..." gibi destekleyici bir cümle kur.
      5. Masat sorulursa: "Ev tipi mi profesyonel mi arıyorsunuz?" diye sorarak ihtiyacı anlamaya çalış.
      6. Güvenlik uyarısı gerekiyorsa nazikçe yap.

      Örnek Diyalog:
      Kullanıcı: "Şef bıçağı var mı?"
      Sen: "Evet, 100. Yıl Özel Şef Bıçağı ve Santoku modellerimiz mevcut. Sizi şef bıçakları sayfasına yönlendiriyorum, orada detaylı inceleyebilirsiniz."
    `,

    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}