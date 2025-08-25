import { GameResponse } from "../types/game";

export async function getGames(): Promise<GameResponse> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "";
  const url = `${base}/games`;

  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(`Failed to fetch games: ${res.status} - ${res.statusText}`);
  }

  const data = await res.json();
  return data as GameResponse;
}
