import Image from "next/image";
import Link from "next/link";
import { GameInfo } from "../types/game";

export function GameCardHome({ game }: { game: GameInfo }) {
  return (
    <article className="w-full max-w-md mx-auto flex flex-wrap justify-center hover:cursor-pointer">
      <Image
        src={game.image}
        alt={`${game.name} image`}
        width={400}
        height={400}
      />
      <div className="flex flex-col text-center gap-10 mt-6">
        <h3 className="text-5xl">{game.name}</h3>
        <p className="text-2xl">{game.description}</p>
        <span className="text-3xl">{game.price}</span>
        <div className="bg-[#DFD0B8] text-[#393E46] py-4 rounded-2xl hover:bg-[#948979]">
          <Link href={"#"} className="text-5xl">
            Buy Now
          </Link>
        </div>
      </div>
    </article>
  );
}
