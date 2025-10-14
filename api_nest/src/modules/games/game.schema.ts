import { z } from 'zod';

import { realToCents } from '../../common/utils/money-converter.util';

const GameSchema = z.object({
  id: z.instanceof(Buffer),
  name: z.string(),
  description: z.string(),
  price: z
    .preprocess(
      (val) => (typeof val === 'string' ? parseFloat(val) : val),
      z.number(),
    )
    .transform((val) => realToCents(val).toString()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const CreateGame = GameSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const UpdateGame = GameSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  imagesToKeep: z.string().optional(),
});

const DeleteGame = GameSchema.omit({
  id: true,
  createdAt: true,
  description: true,
  name: true,
  price: true,
  updatedAt: true,
});

export type CreateGameDto = z.infer<typeof CreateGame>;
export type UpdateGameDto = z.infer<typeof UpdateGame>;
export type DeleteGameDto = z.infer<typeof DeleteGame>;

export { CreateGame };
