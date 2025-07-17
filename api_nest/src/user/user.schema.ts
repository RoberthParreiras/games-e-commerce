import z from 'zod';

const UserSchema = z.object({
  id: z.instanceof(Buffer),
  name: z.string(),
  email: z.email(),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CreateUser = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateUserDto = z.infer<typeof CreateUser>;

export { CreateUser };
