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

const UpdateUser = UserSchema.omit({
  id: true,
  email: true,
  password: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateUserDto = z.infer<typeof CreateUser>;
export type UpdateUser = z.infer<typeof UpdateUser>;

export { CreateUser };
