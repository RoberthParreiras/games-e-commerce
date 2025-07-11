import { Injectable } from '@nestjs/common';
import { PrismaService } from '../models/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import {
  convertBytesToUuid,
  convertUuidToBytes,
} from 'src/common/utils/uuid.util';
import { getChangedFields } from 'src/common/utils/check-changed-fields.util';

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

    await this.prisma.games.create({
      data: {
        id: convertUuidToBytes(uuid),
        name,
        description,
        image,
        price,
      },
    });
  }

  async listAll() {
    const gamesList = await this.prisma.games.findMany();

    const gamesListReturn = gamesList.map((game) => ({
      ...game,
      id: convertBytesToUuid(game.id),
    }));

    return gamesListReturn;
  }

  async put(params: {
    id: string;
    name?: string;
    description?: string;
    price?: number;
  }) {
    const { id, ...updates } = params;

    const currentGame = await this.prisma.games.findUnique({
      where: { id: convertUuidToBytes(id) },
    });

    const changedFields = getChangedFields(
      {
        name: currentGame?.name,
        description: currentGame?.description,
        price: currentGame?.price,
      },
      updates,
    );

    if (Object.keys(changedFields).length > 0) {
      await this.prisma.games.update({
        where: {
          id: convertUuidToBytes(id),
        },
        data: {
          ...changedFields,
          updatedAt: new Date(),
        },
      });
    }
  }

  async delete(params: { id: string }) {
    const { id } = params;
    await this.prisma.games.delete({
      where: {
        id: convertUuidToBytes(id),
      },
    });
  }
}
