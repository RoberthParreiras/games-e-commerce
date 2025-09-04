"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CustomButton } from "@/app/components/base/button";
import { GameCardAdmin } from "@/app/components/gameCardAdmin";
import { GameFilter } from "@/app/components/gameFilter";
import { GamePagination } from "@/app/components/gamePagination";
import { getGames } from "@/app/lib/game-data";
import { GameResponse } from "@/app/types/game";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [gameList, setGameList] = useState<GameResponse | null>(null);

  useEffect(() => {
    const pageStr = searchParams.get("page") ?? "1";
    const limitPerPageStr = searchParams.get("limitPerPage") ?? "10";
    const minPriceStr = searchParams.get("minPrice");
    const maxPriceStr = searchParams.get("maxPrice");

    const minPriceInCents = Number(minPriceStr) * 100;
    const maxPriceInCents = Number(maxPriceStr) * 100;

    const page = Number(pageStr);
    const limitPerPage = Number(limitPerPageStr);
    const minPrice = minPriceStr ? minPriceInCents : undefined;
    const maxPrice = maxPriceStr ? maxPriceInCents : undefined;

    async function fetchGames() {
      const data = await getGames({ page, limitPerPage, minPrice, maxPrice });
      setGameList(data);
    }

    fetchGames();
  }, [searchParams]);

  if (!gameList) {
    // TODO add a skeleton
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Link href="/admin/adicionar">
        <CustomButton type="button" className="my-8 ml-4 w-1/3 text-2xl">
          Add game
        </CustomButton>
      </Link>
      <GameFilter />
      <section className="mt-16 grid grid-cols-1 gap-8 bg-[#393E46] p-5 text-[#DFD0B8] lg:grid-cols-3">
        {gameList.games.map((game) => (
          <GameCardAdmin game={game} key={game.id} />
        ))}
      </section>
      <div className="py-8">
        <GamePagination totalPages={gameList.totalPages} />
      </div>
    </div>
  );
}
