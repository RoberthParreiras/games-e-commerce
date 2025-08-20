import Image from "next/image";
import Link from "next/link";

type Game = {
  name: string;
  platform: string;
  price: string;
  image: string;
  link: string;
};

const games: Game[] = [
  {
    name: "God of War",
    platform: "Playstation 2",
    price: "R$ 100,00",
    image: "/god_of_war_400.jpg",
    link: "#",
  },
  {
    name: "God of War 2",
    platform: "Playstation 2",
    price: "R$ 120,00",
    image: "/god_of_war_2_400.jpg",
    link: "#",
  },
  {
    name: "Chrono Trigger",
    platform: "Super Nintendo",
    price: "R$ 60,00",
    image: "/Chrono_Trigger_400.jpg",
    link: "#",
  },
];

function GameCard({ game }: { game: Game }) {
  return (
    <article className="w-[410px] h-[782px] mx-auto flex flex-wrap justify-center hover:cursor-pointer">
      <Image
        src={game.image}
        alt={`${game.name} image`}
        width={400}
        height={400}
      />
      <div className="flex flex-col text-center gap-10 mt-6">
        <h3 className="text-5xl">{game.name}</h3>
        <p className="text-4xl">{game.platform}</p>
        <span className="text-3xl">{game.price}</span>
        <div className="bg-[#DFD0B8] text-[#393E46] py-4 rounded-2xl hover:bg-[#948979]">
          <Link href={game.link} className="text-5xl">
            Buy Now
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
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
          {games.map((game) => (
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
