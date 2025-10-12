import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

export async function loginAndGetToken(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user.getIdToken(true);
}

export async function getFreshToken() {
  const u = auth.currentUser;
  return u ? u.getIdToken(true) : null;
}

export async function logout() { await signOut(auth); }
