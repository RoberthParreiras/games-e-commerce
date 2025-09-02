"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Slider } from "./ui/slider";

export function GameFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Define the full range of the slider
  const MIN = 1;
  const MAX = 1000;

  // Get initial values from URL or use the full range
  const initialMin = Number(searchParams.get("minPrice") || MIN);
  const initialMax = Number(searchParams.get("maxPrice") || MAX);

  const [value, setValue] = useState<number[]>([initialMin, initialMax]);

  // Update slider if URL changes (e.g., browser back/forward)
  useEffect(() => {
    setValue([
      Number(searchParams.get("minPrice") || MIN),
      Number(searchParams.get("maxPrice") || MAX),
    ]);
  }, [searchParams]);

  const handleSliderChange = (newValue: number[]) => {
    setValue(newValue as number[]);
  };

  const handlePriceChange = (newValue: number[]) => {
    const params = new URLSearchParams(searchParams);
    const [newMin, newMax] = newValue as number[];
    params.set("page", "1");
    params.set("minPrice", newMin.toString());
    params.set("maxPrice", newMax.toString());
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-[#222831]">
      <h2 className="text-2xl">Price Range</h2>
      <Slider
        value={value}
        onValueChange={handleSliderChange}
        onValueCommit={handlePriceChange}
        min={MIN}
        max={MAX}
        step={10}
        className="my-4 h-5 rounded-2xl bg-[#393E46]"
      />
      <div className="flex w-full justify-around text-sm">
        <span>Min: ${value[0]}</span>
        <span>Max: ${value[1]}</span>
      </div>
    </div>
  );
}
