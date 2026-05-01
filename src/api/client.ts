const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const baseHeaders: Record<string, string> = {
    Accept: "application/json",
  };

  const method = String(fetchOptions.method || "GET").toUpperCase();
  const hasBody = fetchOptions.body !== undefined && fetchOptions.body !== null && method !== "GET" && method !== "HEAD";
  if (hasBody) {
    baseHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...fetchOptions,
    headers: { ...baseHeaders, ...(fetchOptions.headers as Record<string, string> | undefined) },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
