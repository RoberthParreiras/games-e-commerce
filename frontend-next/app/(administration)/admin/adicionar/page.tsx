"use client";

import { useEffect } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import CropImageModal from "@/app/components/imageModal";
import { GameForm } from "@/app/components/productForm";
import { formSchema } from "@/app/schemas/gameFormSchema";
import { CustomButton } from "@/app/components/base/button";
import { apiFetch } from "@/app/api/fetch";
import { useAuth } from "@clerk/nextjs";

type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

export default function CreateProduct() {
  const router = useRouter();
  const { getToken } = useAuth();

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      image: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormOutput> = async (data) => {
    try {
      const token = await getToken();

      if (!token) {
        router.push("/sign-in");
        return;
      }

      const formData = new FormData();

      formData.append("file", data.image, "image.jpg");
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", String(data.price));

      await apiFetch("/games", {
        method: "POST",
        body: formData,
        accessToken: token,
      });

      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Failed to create product:", error);
      // Handle submission errors (e.g., show an alert to the user)
    }
  };

  return (
    <FormProvider {...form}>
      <form
        className="mx-auto w-full max-w-5xl"
        onSubmit={form.handleSubmit(onSubmit as SubmitHandler<FormInput>)}
      >
        <CropImageModal />
        {form.formState.errors.image && (
          <p className="text-destructive text-sm font-medium">
            {form.formState.errors.image.message}
          </p>
        )}
        <GameForm />
        <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <CustomButton
            visual="primary"
            type="button"
            onClick={() => router.push("/admin")}
          >
            Cancel
          </CustomButton>
          <CustomButton visual="primary" type="submit">
            Save
          </CustomButton>
        </div>
      </form>
    </FormProvider>
  );
}
