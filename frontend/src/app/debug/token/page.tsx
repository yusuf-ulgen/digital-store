"use client";

import { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

// firebaseConfig'ini senin projene göre doldur (zaten bir yerde varsa import et)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
};

if (!getApps().length) initializeApp(firebaseConfig);

export default function TokenPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const login = async () => {
    setErr(null);
    try {
      const auth = getAuth();
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await cred.user.getIdToken(/* forceRefresh */ true);
      setToken(idToken);

      // role'u görmek istersen decoded token backend tarafında; burada custom claims clienta yansımaz.
      setRole("unknown (backend decodes 'role')");

    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(token);
    alert("Token kopyalandı.");
  };

  const logout = async () => {
    await signOut(getAuth());
    setToken("");
    setRole(null);
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">ID Token Al (Debug)</h1>

      <div className="space-y-2">
        <input
          className="border px-3 py-2 w-80"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border px-3 py-2 w-80"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="space-x-2">
          <button className="border px-3 py-2" onClick={login}>Sign In</button>
          <button className="border px-3 py-2" onClick={logout}>Sign Out</button>
        </div>
      </div>

      {err && <div className="text-red-600">{err}</div>}

      {token && (
        <div className="space-y-2">
          <div><b>Role:</b> {role}</div>
          <textarea className="border w-full h-40 p-2" value={token} readOnly />
          <button className="border px-3 py-2" onClick={copy}>Kopyala</button>
        </div>
      )}
    </div>
  );
}
