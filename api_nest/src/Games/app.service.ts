import { Injectable } from '@nestjs/common';
import { PrismaService } from '../models/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async create(params: {
    name: string;
    description: string;
    image: string;
    price: number;
  }) {
    const { name, description, image, price } = params;

    const uuid = uuidv4();
    const idInBytes = Buffer.from(uuid.replace(/-/g, ''), 'hex');

    await this.prisma.games.create({
      data: {
        id: idInBytes,
        name,
        description,
        image,
        price,
      },
    });
  }

  async listAll() {
    const gamesList = await this.prisma.games.findMany();

    // Convert the id Uint8Array<ArrayBufferLike> to Buffer<ArrayBuffer>
    const gamesListReturn = gamesList.map((game) => ({
      ...game,
      id: Buffer.from(String(game.id).replace(/-/g, ''), 'hex'),
    }));

    return gamesListReturn;
  }
}
