export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5180";

export async function getPing() {
  const r = await fetch(`${API_BASE}/api/ping`, { cache: "no-store" });
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
}
