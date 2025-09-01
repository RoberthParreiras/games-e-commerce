import Image from "next/image";
import { GameCard } from "@/app/components/gameCard";
import { getGames } from "@/app/lib/game-data";

export default async function Home() {
  const games = await getGames();
  return (
    <div>
      <main className="w-full max-w-7xl mx-auto px-4">
        <div className="relative w-full h-[390px] md:h-[500px] lg:h-[960px]">
          <Image
            src="/banner.jpg"
            alt="banner with video game characters"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
        <h2 className="lg:text-5xl md:text-4xl text-center my-20">
          Discover, buy, and play thousands of games
        </h2>
        <section className="bg-[#393E46] p-5 grid gap-8 grid-cols-1 lg:grid-cols-3 text-[#DFD0B8]">
          {games.games.map((game) => (
            <GameCard key={game.name} game={game} />
          ))}
        </section>
        <section id="about">
          <h2 className="text-5xl text-center my-20">About us</h2>
          <div>
            <p className="lg:text-4xl text-center w-2/3 md:w-1/3 lg:w-11/12 mx-auto tracking-wide leading-14">
              With over a decade of experience serving the gaming community,
              we've built a modern e-commerce platform designed by gamers, for
              gamers. We leverage cutting-edge technology to bring you a fast,
              reliable, and extensive catalog of games. Our journey started 10
              years ago with a simple goal: to create the ultimate destination
              for discovering, buying, and playing the games you love. Join us
              as we continue to level up the world of game distribution.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
