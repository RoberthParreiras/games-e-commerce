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
import { SingleGameResponse } from "@/app/types/game";

type FormInput = z.input<typeof formSchemaEdit>;
type FormOutput = z.output<typeof formSchemaEdit>;

export default function EditProduct() {
  const { id } = useParams();

  const router = useRouter();
  const { data: session, status } = useSession();

  const [product, setProduct] = useState<{
    image: string | undefined;
    oldImage: string | undefined;
  } | null>(null);

  const form = useForm<FormInput>({
    resolver: zodResolver(formSchemaEdit),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      image: undefined,
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      router.refresh();
    }

    async function fetchProduct() {
      const data: SingleGameResponse = await apiFetch(`/games/${id}`);

      const gameData = {
        image: data.game.image || undefined,
        oldImage: data.game.image || undefined,
      };
      setProduct(gameData);

      form.reset({
        name: data.game.name || "",
        description: data.game.description || "",
        price: data.game.price.toString() || "",
        image: data.game.image || undefined,
      });
    }

    if (id) {
      fetchProduct();
    }
  }, [id, status, form, router]);

  const onSubmit: SubmitHandler<FormOutput> = async (data) => {
    const formData = new FormData();

    if (typeof data.image !== "string" && product?.oldImage) {
      formData.append("file", data.image, "image.jpg");
      formData.append("oldImage", product.oldImage); // send the old image url for deletion
    } else {
      formData.append("image", data.image);
    }

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", String(data.price));

    await apiFetch(`/games/${id}`, {
      method: "PATCH",
      body: formData,
      accessToken: session?.accessToken,
    });

    router.push("/admin");
  };

  async function onDelete() {
    if (!product?.oldImage) return;
    const formData = new FormData();
    formData.append("image", product?.oldImage);

    apiFetch(`/games/${id}`, {
      method: "DELETE",
      body: formData,
      accessToken: session?.accessToken,
    });

    router.push("/admin");
  }

  return (
    <FormProvider {...form}>
      <form
        className="mx-auto mt-16 w-full max-w-5xl"
        onSubmit={form.handleSubmit(onSubmit as SubmitHandler<FormInput>)}
      >
        <CropImageModalEdit image={product?.image ?? ""} />
        {form.formState.errors.image && (
          <p className="text-destructive text-sm font-medium">
            {form.formState.errors.image.message}
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
