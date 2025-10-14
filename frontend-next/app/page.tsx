import Image from "next/image";

import { GameCardHome } from "@/app/components/gameCardHome";
import { getGames } from "@/app/lib/game-data";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/components/ui/carousel";

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
          Discover and play thousands of games
        </h2>
        <section className="flex flex-col bg-[#393E46] p-5 text-[#DFD0B8]">
          <Carousel className="mx-10">
            <CarouselContent className="ml-5">
              {games.games.map((game) => (
                <CarouselItem
                  key={game.id}
                  className="sm:basis-1/2 lg:basis-1/3"
                >
                  <GameCardHome key={game.id} game={game} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>
        <section id="about">
          <h2 className="my-20 text-center text-5xl">About us</h2>
          <div>
            <div className="flex w-full flex-col items-center justify-center gap-2 sm:mb-32 md:flex-row md:justify-between">
              <p className="w-2/3 text-center leading-14 tracking-wide md:w-1/3 lg:w-2/4 lg:text-2xl">
                With over a decade of experience serving the gaming community,
                we&apos;ve built a modern e-commerce platform designed by
                gamers, for gamers.
              </p>
              <div className="hidden aspect-[2/1] w-full max-w-xl sm:relative sm:block">
                <Image
                  src="/about-1.png"
                  alt="person with a laptop"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-2 sm:mb-32 md:flex-row md:justify-between">
              <div className="hidden aspect-[2/1] w-full max-w-xl sm:relative sm:block">
                <Image
                  src="/about-2.png"
                  alt="person with a laptop"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <p className="w-2/3 text-center leading-14 tracking-wide md:w-1/3 lg:w-2/4 lg:text-2xl">
                We leverage cutting-edge technology to bring you a fast,
                reliable, and extensive catalog of games.
              </p>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-2 sm:mb-32 md:flex-row md:justify-between">
              <p className="w-2/3 text-center leading-14 tracking-wide md:w-1/3 lg:w-2/4 lg:text-2xl">
                Our journey started 10 years ago with a simple goal: to create
                the ultimate destination for discovering, buying, and playing
                the games you love.
              </p>
              <div className="hidden aspect-[2/1] w-full max-w-xl sm:relative sm:block">
                <Image
                  src="/about-3.png"
                  alt="person with a laptop"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-1 sm:mb-32 md:flex-row md:justify-between">
              <div className="hidden aspect-[2/1] w-full max-w-xl sm:relative sm:block">
                <Image
                  src="/about-4.png"
                  alt="person with a laptop"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <p className="w-2/3 text-center leading-14 tracking-wide md:w-1/3 lg:w-2/4 lg:text-2xl">
                Join us as we continue to level up the world of game
                distribution.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
