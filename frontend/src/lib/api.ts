export async function apiFetch(path: string, options: RequestInit = {}) {
  // Firebase Auth modülünden token al
  const token = await (await import("firebase/auth"))
    .getIdToken(
      (await (await import("./firebase")).auth).currentUser!,
      true
    )
    .catch(() => null);

  // Header’ları ayarla
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");

  // Backend’e istek at
  const res = await fetch(`http://localhost:5180${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  // JSON parse et, boşsa null dön
  return res.json().catch(() => null);
}
