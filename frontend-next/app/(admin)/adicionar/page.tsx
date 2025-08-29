"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import CropImageModal from "@/app/components/imageModal";
import { GameForm } from "@/app/components/productForm";
import { Button } from "@/app/components/ui/button";
import { formSchema } from "@/app/schemas/gameFormSchema";

type FormValues = z.infer<typeof formSchema>;

export default function Image() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/signin");
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      image: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!session?.accessToken) {
      console.error("No access token found");
      return;
    }

    const formData = new FormData();

    formData.append("file", data.image, "image.jpg");
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);

    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    const url = `${base}/games`;

    await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
  };

  return (
    <FormProvider {...form}>
      <form className="w-5xl mx-auto" onSubmit={form.handleSubmit(onSubmit)}>
        <CropImageModal />
        {form.formState.errors.image && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.image.message}
          </p>
        )}
        <GameForm />
        <div className="mb-4 flex justify-between">
          <Button className=" bg-[#DFD0B8] text-[#222831] h-12 w-52 hover:bg-[#cbb89d] hover:cursor-pointer">
            Cancel
          </Button>
          <Button
            className=" bg-[#DFD0B8] text-[#222831] h-12 w-52 hover:bg-[#cbb89d] hover:cursor-pointer"
            type="submit"
          >
            Save
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
