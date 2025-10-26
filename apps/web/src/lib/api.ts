export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export async function apiFetch<T = any>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(json?.error || res.statusText);
    return json;
  } catch {
    // عندما يرجع HTML من خادم آخر (مثلاً 404 من Next)
    throw new Error(
      `Unexpected response (not JSON). Status ${res.status}. Body: ${text.slice(0, 200)}`
    );
  }
}
