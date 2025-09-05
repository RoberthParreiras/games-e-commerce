import { apiFetch } from "@/app/api/fetch";
import { GameResponse } from "@/app/types/game";

export async function getGames({
  page,
  limitPerPage,
  minPrice,
  maxPrice,
}: {
  page?: number;
  limitPerPage?: number;
  minPrice?: number;
  maxPrice?: number;
}): Promise<GameResponse> {
  const params = new URLSearchParams();

  if (page) params.append("page", page.toString());
  if (limitPerPage) params.append("limitPerPage", limitPerPage.toString());
  if (minPrice !== undefined) params.append("minPrice", minPrice.toString());
  if (maxPrice !== undefined) params.append("maxPrice", maxPrice.toString());

  const queryString = params.toString();
  const queryParams = `/games${queryString ? `?${queryString}` : ""}`;

  const data = await apiFetch(queryParams, {
    method: "GET",
    cache: "no-cache",
  });

  return data as GameResponse;
}
