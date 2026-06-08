import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages, tool } from 'ai';
import { ALL_PRODUCTS } from '@/lib/mock-data';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const maxDuration = 30;

// Basit bellek içi rate-limiter tanımları
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const globalLimit = { count: 0, resetTime: 0 };

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 dakika
const MAX_REQUESTS_PER_WINDOW = 20; // 5 dakikada en fazla 20 istek

const GLOBAL_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 saat
const GLOBAL_MAX_REQUESTS = 100; // 1 saatte toplam en fazla 100 istek

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
  const now = Date.now();

  // 1. Global limit kontrolü
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

  // 2. IP bazlı limit kontrolü
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

  // 1. Ürün verisini firestore'dan çekmeye çalış, hata durumunda mock dataya düş
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
    console.error('Failed to fetch products from firestore for chat, using mock fallback:', error);
  }

  // 2. Ürün verisini metne dönüştür (Context oluşturma)
  const productContext = productsList.map(p => 
    `- ${p.title} (${p.category}): ${p.price} TL. Stok: ${p.stock > 0 ? 'Var ('+p.stock+')' : 'YOK'}. ID: ${p.id}`
  ).join('\n');

  const result = (streamText as any)({
    model: google('gemini-1.5-flash'),
    maxSteps: 5,

    system: `
      Sen Ülgen Paslanmaz'ın (Geleneksel Sürmene Bıçakları üreticisi) resmi yapay zeka asistanısın.
      SADECE Ülgen Paslanmaz ürünleri, siparişler ve bıçak bakımı hakkında yardımcı olursun.
      
      MARKA KİŞİLİĞİ:
      - Profesyonel, güvenilir, yardımsever ve hafifçe geleneksel (Sürmene ustalığına vurgu yapan).
      - Müşterilere saygılı, çözüm odaklı bir dille hitap et.
      
      YÖNLENDİRME VE NAVİGASYON (Tools):
      - Eğer kullanıcı kaliteli, pahalı veya belirli bir kategoride bıçak sorarsa (örn: kasap bıçağı, şef bıçağı), ürün listesinden ilgili kategorideki en yüksek kaliteli/pahalı olanları listeleyip özelliklerini açıkla ve hemen ardından 'goToCategoryPage' veya 'goToProductPage' toolunu çağırarak kullanıcıyı o sayfaya yönlendir.
      - Kullanıcıyı bir sayfaya yönlendirmeden önce mutlaka sorusuna cevap ver ve ne yaptığını belirt. Örneğin; "Tabii, en yüksek kaliteli kasap bıçaklarımız Sürmene çeliğinden üretilir. İşte sizin için seçtiğim bazı modeller: [liste]. Sizi hemen ilgili kasap bıçakları sayfamıza yönlendiriyorum." de ve ardından 'goToCategoryPage' toolunu çağır.
      
      NAVİGASYON VE KATEGORİ SLUGLARI:
      - Bıçaklar (Mutfak / Genel Kullanım): cat=bicaklar (kategori slugı: bicaklar)
      - Kasap Bıçakları: cat=kasap (kategori slugı: kasap)
      - Bıçak Setleri: cat=bicak-seti (kategori slugı: bicak-seti)
      - Bileyiciler & Masatlar: cat=bileyici-masatlar (kategori slugı: bileyici-masatlar)
      - Şef Bıçakları: cat=sef-bicagi (kategori slugı: sef-bicagi)
      - Outdoor Bıçaklar: cat=outdoor (kategori slugı: outdoor)
      - Satırlar: cat=satirlar (kategori slugı: satirlar)

      ÜRÜN LİSTESİ:
      ${productContext}

      KURALLAR:
      1. Yanıtlarını kısa, öz ve Markdown formatında ver. 
      2. Kullanıcıyı yönlendirmeden önce mutlaka mesajın içinde önerilerini sun.
      3. Bıçak bakımı sorulursa: "Bulaşık makinesinde yıkamamanızı, elde yıkayıp kurularsanız ömürlük olacağını" belirt.
    `,

    messages: convertToModelMessages(messages),
    
    tools: {
      goToCategoryPage: {
        description: 'Kullanıcıyı belirli bir ürün kategorisi sayfasına yönlendirir.',
        parameters: z.object({
          categorySlug: z.string().describe('Yönlendirilecek kategori slugı (örn: kasap, sef-bicagi, outdoor, satirlar, bileyici-masatlar, bicaklar, bicak-seti)'),
        }),
        execute: async ({ categorySlug }: { categorySlug: string }) => {
          return { success: true, categorySlug, action: 'redirect' };
        }
      },
      goToProductPage: {
        description: 'Kullanıcıyı belirli bir ürün detay sayfasına yönlendirir.',
        parameters: z.object({
          productId: z.string().describe('Yönlendirilecek ürünün ID numarası.'),
        }),
        execute: async ({ productId }: { productId: string }) => {
          return { success: true, productId, action: 'redirect' };
        }
      },
    },
  });

  return result.toUIMessageStreamResponse();
}