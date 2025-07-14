import { Injectable } from '@nestjs/common';
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

  async listAll() {
    const gamesList = await this.prisma.games.findMany();

    const gamesListReturn = gamesList.map((game) => ({
      ...game,
      id: convertBytesToUuid(game.id),
      price: MoneyConverter.centsToReal(game.price.toNumber()),
    }));

    return gamesListReturn;
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
