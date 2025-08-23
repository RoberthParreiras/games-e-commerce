import Image from "next/image";
import Link from "next/link";
import { Game } from "../types/game";

export function GameCard({ game }: { game: Game }) {
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
