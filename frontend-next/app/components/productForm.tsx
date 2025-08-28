"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";

export function GameForm() {
  const { control } = useFormContext();

  return (
    <div>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel
              style={{ color: "#DFD0B8", fontFamily: "Montserrat, sans-serif" }}
            >
              Name
            </FormLabel>
            <FormControl>
              <Input
                className="bg-[#DFD0B8] text-[#222831] h-12"
                placeholder="Name of the game"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel
              style={{ color: "#DFD0B8", fontFamily: "Montserrat, sans-serif" }}
            >
              Description
            </FormLabel>
            <FormControl>
              <textarea
                className="bg-[#DFD0B8] text-[#222831] h-28 pt-2 px-3 rounded"
                placeholder="Write a description for the game"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="price"
        render={({ field }) => (
          <FormItem className="mb-4">
            <FormLabel
              style={{ color: "#DFD0B8", fontFamily: "Montserrat, sans-serif" }}
            >
              Price
            </FormLabel>
            <FormControl>
              <Input
                className="bg-[#DFD0B8] text-[#222831] h-12"
                placeholder="price"
                type="number"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
