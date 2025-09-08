import Image from "next/image";
import Link from "next/link";

import { GameInfo } from "@/app/types/game";

export function GameCardAdmin({ game }: { game: GameInfo }) {
  return (
    <article className="mx-auto flex w-full max-w-md flex-wrap justify-center hover:cursor-pointer">
      <Image
        src={game.image}
        alt={`${game.name} image`}
        width={400}
        height={400}
      />
      <div className="mt-6 flex w-full flex-col gap-10 text-center">
        <h3 className="text-3xl md:text-4xl">{game.name}</h3>
        <p className="text-2xl">{game.description}</p>
        <span className="text-3xl">R$ {game.price}</span>
        <div className="rounded-2xl bg-[#DFD0B8] py-4 text-[#393E46] hover:bg-[#948979]">
          <Link
            href={`/admin/editar/${game.id}`}
            className="block w-full py-2 text-3xl md:text-5xl"
          >
            Edit
          </Link>
        </div>
      </div>
    </article>
  );
}
