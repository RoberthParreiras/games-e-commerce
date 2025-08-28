import Image from "next/image";
import { GameCard } from "@/app/components/gameCard";
import { getGames } from "@/app/lib/game-data";

export default async function Home() {
  const games = await getGames();
  return (
    <div>
      <header className="pl-4">
        <Image
          src="/logo.png"
          alt="logo company"
          width={120}
          height={120}
          priority
        />
      </header>
      <main className="w-7xl m-auto">
        <Image
          src="/banner.jpg"
          alt="banner with video game characters"
          width={1280}
          height={960}
        />
        <h2 className="text-5xl text-center my-20">
          Discover, buy, and play thousands of games
        </h2>
        <section className="md:h-[1580px] lg:h-[800px] bg-[#393E46] p-5 grid grid-rows-2 grid-cols-2 lg:grid-cols-3 text-[#DFD0B8]">
          {games.games.map((game) => (
            <GameCard key={game.name} game={game} />
          ))}
        </section>
        <section id="about">
          <h2 className="text-5xl text-center my-20">About us</h2>
          <div>
            <p className="text-4xl text-center w-11/12 mx-auto tracking-wide leading-14">
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
      {/* <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer> */}
    </div>
  );
}
