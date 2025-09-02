import { GameCardAdmin } from "@/app/components/gameCardAdmin";
import { GameFilter } from "@/app/components/gameFilter";
import { GamePagination } from "@/app/components/gamePagination";
import { getGames } from "@/app/lib/game-data";

export default async function Dashboard({
  searchParams,
}: {
  searchParams?: {
    page?: string;
    limitPerPage?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}) {
  const {
    page: pageStr = "1",
    limitPerPage: limitPerPageStr = "10",
    minPrice: minPriceStr,
    maxPrice: maxPriceStr,
  } = await searchParams ?? {};
  const minPriceInCents = Number(minPriceStr) * 100
  const maxPriceInCents = Number(maxPriceStr) * 100

  const page = Number(pageStr);
  const limitPerPage = Number(limitPerPageStr);
  const minPrice = minPriceStr ? minPriceInCents : undefined;
  const maxPrice = maxPriceStr ? maxPriceInCents : undefined;

  const gameList = await getGames({ page, limitPerPage, minPrice, maxPrice });
  return (
    <div>
      <GameFilter />
      <section className="bg-[#393E46] p-5 grid gap-8 grid-cols-1 lg:grid-cols-3 text-[#DFD0B8] mt-16">
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
