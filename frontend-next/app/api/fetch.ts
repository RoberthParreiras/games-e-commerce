import { signOut } from "next-auth/react";

interface FetchOptions extends Omit<RequestInit, "body"> {
  accessToken?: string;
  body?: Record<string, unknown> | FormData | string;
  isAuthRoute?: boolean;
}

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  let base = process.env.NEXT_PUBLIC_API_URL ?? "";

  // If window is undefined, we're on the server.
  if (typeof window === "undefined") {
    base = process.env.INTERNAL_API_URL ?? "";
  }
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

  if (response.status === 401 && !options.isAuthRoute) {
    signOut({ callbackUrl: "/signin" });
  }

  if (!response.ok) {
    if (options.isAuthRoute) {
      return response;
    }

    const errorData = await response.json().catch(() => ({
      message: `Request failed with status ${response.status}`,
    }));
    console.log(response.status);
    throw new Error(errorData.message || "An unknown API error occurred");
  }
  // Handle responses with no content
  if (response.status === 204) {
    return null;
  }

  if (options.isAuthRoute) {
    return response;
  }

  return response.json();
}
