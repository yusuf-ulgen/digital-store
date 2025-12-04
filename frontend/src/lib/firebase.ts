import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Config ayarlarını alıyoruz
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Değişkenleri tanımla
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  // 1. Config Kontrolü
  if (!firebaseConfig.apiKey) {
    throw new Error("🔥 Firebase API Key bulunamadı! .env.local dosyasını kontrol edin.");
  }

  // 2. App Başlatma (Singleton Yapısı)
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    console.log("✅ Firebase App Başlatıldı");
  } else {
    app = getApp();
    console.log("♻️ Mevcut Firebase App Kullanılıyor");
  }

  // 3. Servisleri Başlatma
  auth = getAuth(app);
  db = getFirestore(app);

} catch (error) {
  console.error("❌ Firebase Başlatma Hatası:", error);
  // Uygulama çökmesin diye boş nesneler döndür veya hatayı fırlat
  // Ancak hatayı görmek için konsola bakmak şart.
  throw error;
}

// Servisleri dışarı aktar
export { auth, db };