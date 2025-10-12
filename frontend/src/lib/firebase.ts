import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// İsteğe bağlı: emulator
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "1") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "localhost", 8080);
    // storage emulator kullanıyorsan: connectStorageEmulator(storage, "localhost", 9199)
  } catch {
    // aynı modül birden fazla kez import edilirse emulator bağlama hatası verebilir, sessiz geç
  }
}

if (typeof window !== "undefined") {
  // Geçici debug helper
  (window as any).getIdToken = async () => {
    const u = getAuth().currentUser;
    if (!u) { console.warn("No user"); return null; }
    const t = await u.getIdToken(/* forceRefresh? */ false);
    console.log("ID TOKEN:", t);
    return t;
  };
}