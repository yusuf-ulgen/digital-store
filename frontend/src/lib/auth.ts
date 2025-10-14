// src/lib/auth.ts
// ✅ SSR-safe: Firebase importları fonksiyon içinde dinamik yapılır.
// ✅ Client-only alanlar window kontrolü ile korunur.

export type DecodedToken = {
  role?: string;
  roles?: string[];
  ["custom:role"]?: string;
  [k: string]: any;
};

/* -------------------------
 * Local token helpers
 * ------------------------- */
const TOKEN_KEY = "token";

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

/* -------------------------
 * JWT decode & role helpers
 * ------------------------- */
function b64UrlToUtf8(b64url: string): string {
  // atob server'da yok; decode'u client'ta çalıştırıyoruz.
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const json =
    typeof window !== "undefined"
      ? atob(b64)
      : Buffer.from(b64, "base64").toString("binary");
  // Unicode güvenli decode
  return decodeURIComponent(
    Array.prototype.map
      .call(json, (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
}

export function decodeJwt<T = any>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadUtf8 = b64UrlToUtf8(parts[1]);
    return JSON.parse(payloadUtf8) as T;
  } catch {
    return null;
  }
}

/** localStorage'daki token'ı decode eder */
export async function getDecodedToken(): Promise<DecodedToken | null> {
  const token = getToken();
  if (!token) return null;
  return decodeJwt<DecodedToken>(token);
}

/** Rol stringini normalize eder (Admin | Staff | Customer ...) */
export function extractRole(dt: DecodedToken | null): string | undefined {
  if (!dt) return undefined;
  if (typeof dt.role === "string") return dt.role;
  if (typeof dt["custom:role"] === "string") return dt["custom:role"];
  if (Array.isArray(dt.roles) && dt.roles.length > 0) return dt.roles[0];
  return undefined;
}

/* -------------------------
 * Firebase Auth helpers
 * (dinamik import → SSR safe)
 * ------------------------- */

/** Email/şifre ile login olur ve taze ID token döner; ayrıca localStorage'a yazar. */
export async function loginAndGetToken(email: string, password: string) {
  const { auth } = await import("@/lib/firebase");
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken(true);
  setToken(idToken);
  return idToken;
}

/** Oturum açıksa taze ID token alır; aldıysa localStorage'ı da günceller. */
export async function getFreshToken() {
  const { auth } = await import("@/lib/firebase");
  const u = auth.currentUser;
  if (!u) return null;
  const t = await u.getIdToken(true);
  setToken(t);
  return t;
}

/** Firebase oturumunu kapatır ve local token'ı siler. */
export async function logout() {
  const { auth } = await import("@/lib/firebase");
  const { signOut } = await import("firebase/auth");
  await signOut(auth);
  clearToken();
}

/* -------------------------
 * Convenience
 * ------------------------- */

/** Header için Authorization hazırlar; yoksa boş obje döner. */
export async function getAuthHeader(): Promise<Record<string, string>> {
  let token = getToken();
  if (!token) token = await getFreshToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** fetch ile kolay kullanım */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const authHeader = await getAuthHeader();
  const headers = new Headers(init.headers || {});
  for (const [k, v] of Object.entries(authHeader)) headers.set(k, v);
  return fetch(input, { ...init, headers });
}
