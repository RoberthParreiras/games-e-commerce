import Image from "next/image";

import { GameCardHome } from "@/app/components/gameCardHome";
import { getGames } from "@/app/lib/game-data";

export default async function Home() {
  const games = await getGames({});
  return (
    <div>
      <main className="mx-auto w-full max-w-7xl px-4">
        <div className="relative h-[390px] w-full md:h-[500px] lg:h-[960px]">
          <Image
            src="/banner.jpg"
            alt="banner with video game characters"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
        <h2 className="my-20 text-center md:text-4xl lg:text-5xl">
          Discover, buy, and play thousands of games
        </h2>
        <section className="grid grid-cols-1 gap-8 bg-[#393E46] p-5 text-[#DFD0B8] lg:grid-cols-3">
          {games.games.map((game) => (
            <GameCardHome key={game.id} game={game} />
          ))}
        </section>
        <section id="about">
          <h2 className="my-20 text-center text-5xl">About us</h2>
          <div>
            <p className="mx-auto w-2/3 text-center leading-14 tracking-wide md:w-1/3 lg:w-11/12 lg:text-4xl">
              With over a decade of experience serving the gaming community,
              we&apos;ve built a modern e-commerce platform designed by gamers,
              for gamers. We leverage cutting-edge technology to bring you a
              fast, reliable, and extensive catalog of games. Our journey
              started 10 years ago with a simple goal: to create the ultimate
              destination for discovering, buying, and playing the games you
              love. Join us as we continue to level up the world of game
              distribution.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
