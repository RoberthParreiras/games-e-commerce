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

type FormValues = z.infer<typeof formSchemaEdit>;

export default function EditProduct() {
  const { id } = useParams();

  const router = useRouter();
  const { data: session, status } = useSession();

  const [product, setProduct] = useState<{
    image: string | undefined;
    oldImage: string | undefined;
  } | null>(null);

  const form = useForm<FormValues>({
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
    }

    async function fetchProduct() {
      const data: SingleGameResponse = await apiFetch(`/games/${id}`);

      setProduct({
        image: data.game.image || undefined,
        oldImage: data.game.image || undefined,
      });

      form.reset({
        name: data.game.name || "",
        description: data.game.description || "",
        price: data.game.price?.toString() || "",
        image: data.game.image || undefined,
      });
    }

    if (id) {
      fetchProduct();
    }
  }, [id, status, router]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!session?.accessToken) {
      console.error("No access token found");
      return;
    }

    const formData = new FormData();

    if (typeof data.image !== "string") {
      formData.append("file", data.image, "image.jpg");
      formData.append("oldImage", product?.oldImage!); // send the old image url for deletion
    } else {
      formData.append("image", data.image);
    }

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);

    apiFetch(`/games/${id}`, {
      method: "PATCH",
      body: formData,
      accessToken: session.accessToken,
    });
  };

  async function onDelete() {
    if (!session?.accessToken) {
      console.error("No access token found");
      return;
    }

    const formData = new FormData();
    formData.append("image", product?.oldImage!);

    apiFetch(`/games/${id}`, {
      method: "DELETE",
      body: formData,
      accessToken: session.accessToken,
    });
  }

  return (
    <FormProvider {...form}>
      <form
        className="w-full max-w-5xl mx-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <CropImageModalEdit image={product?.image!} />
        {form.formState.errors.image && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.image.message}
          </p>
        )}
        <GameFormEdit />
        <div className="mb-4 flex justify-between">
          <CustomButton visual="primary">Cancel</CustomButton>
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
          <CustomButton visual="destructive" type="button">
            Delete
          </CustomButton>
        </CustomAlertDialog>
      </form>
    </FormProvider>
  );
}
