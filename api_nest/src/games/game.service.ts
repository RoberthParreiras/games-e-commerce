import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../models/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import {
  convertBytesToUuid,
  convertUuidToBytes,
} from 'src/common/utils/uuid.util';
import { getChangedFields } from 'src/common/utils/check-changed-fields.util';
import { MoneyConverter } from 'src/common/utils/money-converter.util';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  private MINPAGE = 1;
  private MAXLIMIT = 10;

  private prepareUpdateData(changedFields: any) {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (changedFields.name) {
      updateData.name = changedFields.name;
    }

    if (changedFields.description) {
      updateData.description = changedFields.description;
    }

    if (changedFields.price) {
      updateData.price = parseInt(changedFields.price);
    }

    return updateData;
  }

  async create(params: {
    name: string;
    description: string;
    image: string;
    price: string;
  }) {
    const { name, description, image, price } = params;

    const uuid = uuidv4();

    await this.prisma.games.create({
      data: {
        id: convertUuidToBytes(uuid),
        name,
        description,
        image,
        price: parseInt(price),
      },
    });
  }

  async get(params: { id: string }) {
    const { id } = params;

    const game = await this.prisma.games.findUnique({
      where: {
        id: convertUuidToBytes(id),
      },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    const gameReturn = {
      ...game,
      id: convertBytesToUuid(game.id),
    };

    return gameReturn;
  }

  async listAll({
    page = this.MINPAGE,
    limit = this.MAXLIMIT,
  }: {
    page?: number;
    limit?: number;
  }) {
    if (limit < 1) limit = 1;
    if (limit > this.MAXLIMIT) limit = this.MAXLIMIT;

    // skip to the first item of the page
    const skipNum = (page - 1) * limit;

    const [gamesList, totalGames] = await this.prisma.$transaction([
      this.prisma.games.findMany({
        skip: skipNum,
        take: Number(limit),
      }),
      this.prisma.games.count(),
    ]);

    const totalPages = Math.ceil(totalGames / limit);

    const gamesListReturn = gamesList.map((game) => ({
      ...game,
      id: convertBytesToUuid(game.id),
      price: MoneyConverter.centsToReal(game.price.toNumber()),
    }));

    return { gamesListReturn, totalPages };
  }

  async put(params: {
    id: string;
    name?: string;
    description?: string;
    price?: string;
  }) {
    const { id, ...updates } = params;

    const currentGame = await this.prisma.games.findUnique({
      where: { id: convertUuidToBytes(id) },
    });

    if (!currentGame) {
      throw new NotFoundException('Game not found');
    }

    const changedFields = getChangedFields(
      {
        name: currentGame?.name,
        description: currentGame?.description,
        price: currentGame?.price.toString(),
      },
      updates,
    );

    if (Object.keys(changedFields).length > 0) {
      const updateData = this.prepareUpdateData(changedFields);

      await this.prisma.games.update({
        where: {
          id: convertUuidToBytes(id),
        },
        data: updateData,
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
