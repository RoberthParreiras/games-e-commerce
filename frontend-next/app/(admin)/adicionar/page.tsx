"use client";

import { GameForm } from "@/app/components/productForm";
import { Button } from "@/app/components/ui/button";
import CropImageModal from "@/app/components/imageModal";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Enter a valid price" }),
  image: z.instanceof(Blob, { message: "A cropped image is required." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Image() {
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
    const formData = new FormData();

    formData.append("file", data.image, "image.jpg");
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);

    // console.log("S", ...formData.entries());
    const base = process.env.NEXT_PUBLIC_API_URL ?? "";
    const url = `${base}/games`;

    const res = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        // TODO when implement authentication, change to use cookies instead
        Authorization:
          "Bearer ",
      },
    });

    console.log(res);
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
