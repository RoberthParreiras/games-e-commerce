import z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  price: z.preprocess((val) => {
    if (typeof val === "string") {
      return parseFloat(val.replace(/,/g, ""));
    }
    return val;
  }, z.number().gt(0, { message: "Price must be greater than 0" })),
  image: z.instanceof(Blob, { message: "A cropped image is required." }),
});

const formSchemaEdit = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  price: z.preprocess((val) => {
    if (typeof val === "string") {
      return parseFloat(val.replace(/,/g, ""));
    }
    return val;
  }, z.number().gt(0, { message: "Price must be greater than 0" })),
  image: z.union([
    z.instanceof(Blob, { message: "A cropped image is required." }),
    z.string(),
  ]),
});

export { formSchema, formSchemaEdit };
