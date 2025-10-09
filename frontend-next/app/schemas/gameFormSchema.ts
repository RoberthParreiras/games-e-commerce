import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "A file is required")
  .refine((file) => file.size <= MAX_FILE_SIZE, "Max file size is 5MB")
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Only .jpg, .jpeg, .png and .webp formats are supported.",
  );

const urlSchema = z.url().optional();

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  price: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return parseFloat(val.replace(/,/g, ""));
      }
      return val;
    },
    z.number().gt(0, { message: "Price must be greater than 0" }),
  ),
  images: z
    .array(z.union([fileSchema, urlSchema]).optional())
    .transform((files) => files.filter((file): file is File => !!file))
    .refine((files) => files.length > 0, "At least one image is required.")
    .refine(
      (files) => files.length <= 2,
      "You can upload a maximum of 2 images.",
    ),
});

const formSchemaEdit = formSchema.extend({
  images: z
    .array(z.union([fileSchema, urlSchema]))
    .min(1, "At least one image is required.")
    .max(2, "You can upload a maximum of 2 images."),
});

export { formSchema, formSchemaEdit };
