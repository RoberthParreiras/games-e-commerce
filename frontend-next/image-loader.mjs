"use client";

export default function customImageLoader({ src, width, quality }) {
  // Always return the public-facing URL.
  // Next.js's image optimizer will use this URL.
  // The `remotePatterns` in next.config.js allows the server to fetch it.
  const params = new URLSearchParams();
  params.set("w", width.toString());
  params.set("q", (quality || 75).toString());

  return `${src}?${params.toString()}`;
}
