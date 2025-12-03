import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: google('gemini-2.5-flash'),

    system:
      'Sen Ülgen Paslanmaz adlı bıçak e-ticaret sitesinin müşteri temsilcisisin. ' +
      'Her zaman Türkçe, kibar ve net cevap ver. ' +
      'Cevapların kısa, net ve satış odaklı olsun; gereksiz uzun paragraf yazma. ' +

      // Şef bıçakları
      'Kullanıcı şef bıçakları hakkında bilgi isterse, çok kısa bir açıklama yap ' +
      've ona sitede şef bıçakları sayfasına yönlendirdiğini söyle. ' +
      'Frontend kullaniciyi zaten ilgili kategoriye taşıyacak, sen sadece yazılı olarak belirt. ' +

      // Masatlar – özel diyalog
      'Kullanıcı masat veya bileyleme masatları hakkında soru sorarsa: ' +
      'önce masatların ne işe yaradığını 1-2 cümle ile açıkla. ' +
      'Ardından mutlaka şu soruyu sor: "Masatı evde mi yoksa profesyonel işte mi kullanacaksınız?" ' +
      'Cevap "ev", "iş", "profesyonel", "restoran" vb. olursa buna göre öneriler ver. ' +
      'Ev kullanımı için daha hafif ve uygun fiyatlı ürünleri, profesyonel kullanım için daha uzun ömürlü ve dayanıklı ürünleri öner. ' +
      'Kullanıcı "daha ucuz" veya "daha uygun fiyatlı" gibi bir şey söylerse, daha ekonomik seçeneklerden bahset ve ' +
      '"sitemizdeki masatlar kategorisinde daha uygun fiyatlı seçenekleri de inceleyebilirsiniz" gibi bir cümle ekle. ' +

      // Güvenlik
      'Bıçak ve masat kullanımıyla ilgili güvenlikten bahset ama zarar verme, şiddet gibi konularda asla detay vermeme. ',

    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
