interface FetchOptions extends RequestInit {
  accessToken?: string;
  body?: any;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const url = `${base}${endpoint}`;

  const headers = new Headers(options.headers);

  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  let body: BodyInit | undefined;

  // If the body is not FormData, stringify it and set the Content-Type header
  if (options.body && !(options.body instanceof FormData)) {
    body = JSON.stringify(options.body);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  } else {
    body = options.body;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `Request failed with status ${response.status}`,
    }));
    throw new Error(errorData.message || "An unknown API error occurred");
  }

  // Handle responses with no content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
