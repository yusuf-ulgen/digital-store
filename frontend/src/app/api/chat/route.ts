import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { ALL_PRODUCTS } from '@/lib/mock-data';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const maxDuration = 30;

// Basit bellek içi rate-limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const globalLimit = { count: 0, resetTime: 0 };

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000;   // 5 dakika
const MAX_REQUESTS_PER_WINDOW = 20;
const GLOBAL_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 saat
const GLOBAL_MAX_REQUESTS = 100;

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const now = Date.now();

  // Global limit kontrolü
  if (now > globalLimit.resetTime) {
    globalLimit.count = 1;
    globalLimit.resetTime = now + GLOBAL_LIMIT_WINDOW_MS;
  } else {
    if (globalLimit.count >= GLOBAL_MAX_REQUESTS) {
      return new Response(
        JSON.stringify({ error: 'Saatlik genel kullanım limitine ulaşıldı. Lütfen daha sonra tekrar deneyin.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
    globalLimit.count += 1;
  }

  // IP bazlı limit kontrolü
  const limitData = rateLimitMap.get(ip);
  if (limitData) {
    if (now > limitData.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    } else {
      if (limitData.count >= MAX_REQUESTS_PER_WINDOW) {
        return new Response(
          JSON.stringify({ error: 'Çok fazla istek gönderdiniz. Lütfen birkaç dakika sonra tekrar deneyin.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      limitData.count += 1;
    }
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  // Ürün verisini Firestore'dan çek, hata durumunda mock dataya düş
  let productsList = ALL_PRODUCTS;
  try {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const firestoreProducts: any[] = [];
    querySnapshot.forEach((doc) => {
      firestoreProducts.push({ id: doc.id, ...doc.data() });
    });
    if (firestoreProducts.length > 0) {
      productsList = firestoreProducts;
    }
  } catch (error) {
    console.error('Firestore bağlantısı başarısız, mock data kullanılıyor:', error);
  }

  // Ürün context'ini metne dönüştür
  const productContext = productsList.map(p =>
    `- ${p.title} (${p.category}): ${p.price} TL. Stok: ${p.stock > 0 ? 'Var (' + p.stock + ')' : 'YOK'}. ID: ${p.id}`
  ).join('\n');

  const result = (streamText as any)({
    model: google('gemini-flash-latest'),
    temperature: 0.3,

    system: `
Sen Ülgen Paslanmaz'ın (Geleneksel Sürmene Bıçakları üreticisi) resmi yapay zeka asistanısın.
SADECE Ülgen Paslanmaz ürünleri, siparişler ve bıçak bakımı hakkında yardımcı olursun.

MARKA KİŞİLİĞİ:
- Profesyonel, güvenilir, yardımsever ve Sürmene ustalığına vurgu yapan.
- Müşterilere saygılı, çözüm odaklı bir dille hitap et.

# YÖNLENDİRME KURALLARI — MUTLAKA UYULMALI
Kullanıcı bir ürün kategorisi, kullanım alanı veya ürün hakkında soru sorduğunda ya da görmek istediğinde:
1. Sorusunu yanıtla ve kısa ürün önerileri sun.
2. Yanıtının en sonuna, mutlaka ilgili kategori için tıklanabilir bir Markdown linki ekle.
   Format: [Kategori Adı için tıklayın →](URL)

# KATEGORİ URL EŞLEŞMELERİ
- Kasap / Et işleme bıçakları → [Kasap Kategorisi →](/products?cat=kasap)
- Outdoor / Av / Kamp / Doğa bıçakları → [Outdoor Kategorisi →](/products?cat=outdoor)
- Şef / Profesyonel mutfak bıçakları → [Şef Bıçakları →](/products?cat=sef-bicagi)
- Genel mutfak / Bıçaklar → [Bıçaklar →](/products?cat=bicaklar)
- Satır / Ağır hizmet → [Satırlar →](/products?cat=satirlar)
- Bileyici / Masat / Bileme → [Bileyici & Masatlar →](/products?cat=bileyici-masatlar)
- Bıçak seti / Set → [Bıçak Setleri →](/products?cat=bicak-seti)

# ÖRNEK DOĞRU YANITLAR
Kullanıcı "kasap bıçağı göster" derse:
"İşte kasap bıçaklarımızdan öneriler: ... [Kasap Kategorisi →](/products?cat=kasap)"

Kullanıcı "outdoor bıçakları var mı" derse:
"Kamp ve av için şu seçeneklerimiz var: ... [Outdoor Kategorisi →](/products?cat=outdoor)"

# KURAL
- Link OLMADAN yönlendirme cümlesi YAZMA. Her yönlendirme mutlaka yukarıdaki formatta gerçek bir Markdown linki ile bitmeli.
- Yanıtlarını kısa ve öz tut.
- Bıçak bakımı sorulursa: bulaşık makinesine koyma, elle yıka ve kurula.

ÜRÜN LİSTESİ:
${productContext}
    `,

    messages: convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}