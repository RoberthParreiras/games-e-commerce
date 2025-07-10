import { z } from 'zod';

const GameSchema = z.object({
  id: z.instanceof(Buffer),
  name: z.string(),
  description: z.string(),
  image: z.string(),
  price: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CreateGame = GameSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateGameDto = z.infer<typeof CreateGame>;

export { CreateGame };
