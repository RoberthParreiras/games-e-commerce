import z from 'zod';

const AuthSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export type SignUserDto = z.infer<typeof AuthSchema>;

export { AuthSchema };
