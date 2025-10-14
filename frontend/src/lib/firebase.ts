// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 🔹 Aynı app birden fazla initialize edilmesin
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

// 🔹 (Opsiyonel) Emulator bağlantısı
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "1") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "localhost", 8080);
  } catch {
    /* ignore */
  }
}

// 🔹 Tarayıcıda debug komutu: window.getIdToken()
if (typeof window !== "undefined") {
  (window as any).getIdToken = async (forceRefresh = true) => {
    const u = auth.currentUser;
    if (!u) {
      console.warn("🚫 Henüz giriş yapılmamış kullanıcı yok.");
      return null;
    }
    const t = await u.getIdToken(forceRefresh);
    console.log("✅ Firebase ID Token:", t);
    return t;
  };

  // 🔹 Konsolda bilgi amaçlı: giriş/çıkış dinleyici
  onAuthStateChanged(auth, (user) => {
    if (user) console.log("👤 Oturum açık:", user.email);
    else console.log("👋 Oturum kapalı.");
  });
}
