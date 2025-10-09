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

type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

export default function CreateProduct() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      images: undefined,
    },
  });

  const onSubmit: SubmitHandler<FormOutput> = async (data) => {
    if (!session?.accessToken) {
      console.error("No access token found");
      return;
    }

    const formData = new FormData();

    for (const file of data.images) {
      formData.append("file", file, "image.jpg");
    }

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", String(data.price));

    await apiFetch("/api/games", {
      method: "POST",
      body: formData,
      accessToken: session.accessToken,
    });

    router.push("/admin");
  };

  return (
    <FormProvider {...form}>
      <form
        className="mx-auto w-full max-w-5xl"
        onSubmit={form.handleSubmit(onSubmit as SubmitHandler<FormInput>)}
      >
        <CropImageModal index={0} key={0}/>
        <CropImageModal index={1} key={1}/>
        {form.formState.errors.images && (
          <p className="text-destructive text-sm font-medium">
            {form.formState.errors.images.message}
          </p>
        )}
        <GameForm />
        <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <CustomButton visual="primary" onClick={() => router.push("/admin")}>
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
