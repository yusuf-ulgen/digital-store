export type ApiOpts = {
  method?: "GET"|"POST"|"PUT"|"DELETE";
  body?: any;
  idToken?: string | null;
  extraHeaders?: Record<string,string>;
};

export async function api<T>(path: string, opts: ApiOpts = {}) {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const headers: Record<string,string> = {
    "Content-Type": "application/json",
    ...(opts.idToken ? { Authorization: `Bearer ${opts.idToken}` } : {}),
    ...(opts.extraHeaders || {}),
  };
  const res = await fetch(`${base}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (res.status === 204 ? null : (await res.json())) as T;
}
