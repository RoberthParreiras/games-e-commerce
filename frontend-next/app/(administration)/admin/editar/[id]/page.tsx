"use client";

import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

import CropImageModalEdit from "@/app/components/imageModalEdit";
import { GameFormEdit } from "@/app/components/productFormEdit";
import { formSchemaEdit } from "@/app/schemas/gameFormSchema";
import { useEffect, useState } from "react";
import { CustomAlertDialog } from "@/app/components/base/alert";
import { CustomButton } from "@/app/components/base/button";
import { apiFetch } from "@/app/api/fetch";
import { GameInfo, SingleGameResponse } from "@/app/types/game";

type FormInput = z.input<typeof formSchemaEdit>;
type FormOutput = z.output<typeof formSchemaEdit>;

export default function EditProduct() {
  const { id } = useParams();

  const router = useRouter();
  const { data: session, status } = useSession();

  const [product, setProduct] = useState<GameInfo | undefined>(undefined);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchemaEdit),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      images: undefined,
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      router.refresh();
    }

    async function fetchProduct() {
      const data: SingleGameResponse = await apiFetch(`/api/games/${id}`);

      setProduct(data.game);

      form.reset({
        name: data.game.name || "",
        description: data.game.description || "",
        price: data.game.price.toString() || "",
        images: data.game.images.map((image) => image.url),
      });
    }

    if (id && status === "authenticated") {
      fetchProduct();
    }
  }, [id, status, form, router]);

  const onSubmit: SubmitHandler<FormOutput> = async (data) => {
    if (!session?.accessToken) {
      console.error("No access token found");
      return;
    }

    const formData = new FormData();
    const imagesToKeep: string[] = [];

    if (data.images && Array.isArray(data.images)) {
      for (const image of data.images) {
        if (image instanceof File) {
          formData.append("file", image, "image.jpg");
        } else if (typeof image === "string") {
          imagesToKeep.push(image);
        }
      }
    }

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("imagesToKeep", JSON.stringify(imagesToKeep));

    await apiFetch(`/api/games/${id}`, {
      method: "PATCH",
      body: formData,
      accessToken: session?.accessToken,
    });

    router.push("/admin");
  };

  async function onDelete() {
    if (!session?.accessToken) {
      console.error("No access token found");
      return;
    }

    apiFetch(`/api/games/${id}`, {
      method: "DELETE",
      accessToken: session?.accessToken,
    });

    router.push("/admin");
    router.refresh();
  }

  return (
    <FormProvider {...form}>
      <form
        className="mx-auto mt-16 w-full max-w-5xl"
        onSubmit={form.handleSubmit(onSubmit as SubmitHandler<FormInput>)}
      >
        <CropImageModalEdit
          key={0}
          image={product?.images[0]?.url ?? ""}
          index={0}
        />
        <CropImageModalEdit
          key={1}
          image={product?.images[1]?.url ?? ""}
          index={1}
        />
        {form.formState.errors.images && (
          <p className="text-destructive text-sm font-medium">
            {form.formState.errors.images.message}
          </p>
        )}
        <GameFormEdit />
        <div className="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <CustomButton visual="primary" onClick={() => router.push("/admin")}>
            Cancel
          </CustomButton>
          <CustomButton visual="primary" type="submit">
            Save
          </CustomButton>
        </div>
        <CustomAlertDialog
          onConfirm={onDelete}
          title="Are you sure?"
          description="This action cannot be undone. This will permanently delete
          the game and remove the data from our servers."
        >
          <div className="flex w-full justify-center sm:justify-start">
            <CustomButton visual="destructive" type="button">
              Delete
            </CustomButton>
          </div>
        </CustomAlertDialog>
      </form>
    </FormProvider>
  );
}
