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

const formSchemaEdit = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "Enter a valid price" }),
  image: z.union([
    z.instanceof(Blob, { message: "A cropped image is required." }),
    z.string(),
  ]),
});

export { formSchema, formSchemaEdit };
