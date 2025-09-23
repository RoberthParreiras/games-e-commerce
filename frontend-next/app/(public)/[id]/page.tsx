"use client";

import { apiFetch } from "@/app/api/fetch";
import { CustomButton } from "@/app/components/base/button";
import { GameInfo, SingleGameResponse } from "@/app/types/game";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Product() {
  const { id } = useParams();
  const [game, setGame] = useState<GameInfo>();

  useEffect(() => {
    async function fetchProduct() {
      const data: SingleGameResponse = await apiFetch(`/games/${id}`);
      setGame(data.game);
    }

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return (
    <div className="mx-auto mt-10 w-full max-w-7xl px-4">
      <Link href="/">
        <CustomButton
          type="button"
          className="my-8 ml-4 text-xl w-1/2 sm:w-1/3 md:text-2xl"
        >
          Back to home
        </CustomButton>
      </Link>
      <div className="mt-10 grid w-full max-w-7xl px-4 sm:grid-cols-2">
        <Image
          src={game?.image!}
          alt={`${game?.name!} image`}
          width={570}
          height={570}
        />
        <div className="flex w-full flex-col justify-center gap-10 text-center">
          <h3 className="text-3xl md:text-4xl">{game?.name!}</h3>
          <p className="text-2xl">{game?.description!}</p>
          <span className="text-3xl">R$ {game?.price!}</span>
          <div className="mx-auto w-1/2 rounded-2xl bg-[#DFD0B8] py-4 text-[#393E46] hover:bg-[#948979]">
            <Link
              href={"#"}
              className="w-full py-2 text-center text-3xl md:text-5xl"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
