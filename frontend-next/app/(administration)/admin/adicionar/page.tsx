"use client";

import { useEffect } from "react";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import CropImageModal from "@/app/components/imageModal";
import { GameForm } from "@/app/components/productForm";
import { formSchema } from "@/app/schemas/gameFormSchema";
import { CustomButton } from "@/app/components/base/button";
import { apiFetch } from "@/app/api/fetch";

type FormValues = z.infer<typeof formSchema>;

export default function CreateProduct() {
  const router = useRouter();
  const { data: session, status } = useSession();
  console.log(session);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

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

    await apiFetch("/games", {
      method: "POST",
      body: formData,
      accessToken: session.accessToken,
    });
  };

  return (
    <FormProvider {...form}>
      <form
        className="w-full max-w-5xl mx-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <CropImageModal />
        {form.formState.errors.image && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.image.message}
          </p>
        )}
        <GameForm />
        <div className="mb-4 flex justify-between">
          <CustomButton visual="primary">Cancel</CustomButton>
          <CustomButton visual="primary" type="submit">
            Save
          </CustomButton>
        </div>
      </form>
    </FormProvider>
  );
}
