import { MoneyConverter } from '../../common/utils/money-converter.util';
import { z } from 'zod';

const GameSchema = z.object({
  id: z.instanceof(Buffer),
  name: z.string(),
  description: z.string(),
  image: z.string(),
  price: z.union([z.number(), z.string()]).transform((val) => {
    if (typeof val === 'number')
      return MoneyConverter.realToCents(Number(val)).toString();
    return val;
  }),
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
  image: true,
  updatedAt: true,
});

export type CreateGameDto = z.infer<typeof CreateGame>;
export type UpdateGameDto = z.infer<typeof UpdateGame>;

export { CreateGame };
