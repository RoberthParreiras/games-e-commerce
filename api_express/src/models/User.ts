import { z } from "zod";

const UserSchema = z.object({
  id: z.instanceof(Uint8Array<ArrayBufferLike>),
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
});

const CreateUser = UserSchema.omit({
  id: true,
});

export { CreateUser };
