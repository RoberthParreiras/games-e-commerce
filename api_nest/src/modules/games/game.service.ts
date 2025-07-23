import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../models/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import {
  convertBytesToUuid,
  convertUuidToBytes,
} from '../../common/utils/uuid.util';
import { getChangedFields } from '../../common/utils/check-changed-fields.util';
import { ConfigService } from '@nestjs/config';
import { centsToReal } from '../../common/utils/money-converter.util';
import { BaseService } from '../../common/base.service';

@Injectable()
export class GamesService extends BaseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  async create(params: {
    name: string;
    description: string;
    image: string;
    price: string;
  }) {
    const { name, description, image, price } = params;

    const uuid = uuidv4();

    const gameCreated = await this.prisma.games.create({
      data: {
        id: convertUuidToBytes(uuid),
        name,
        description,
        image,
        price: parseInt(price),
      },
    });

    return gameCreated;
  }

  async get(params: { id: string }) {
    const { id } = params;

    const game = await this.prisma.games.findUnique({
      where: {
        id: convertUuidToBytes(id),
      },
    });

    if (!game) throw new NotFoundException('Game not found');

    const gameReturn = {
      ...game,
      id: convertBytesToUuid(game.id),
    };

    return gameReturn;
  }

  async listAll({
    page = this.configService.get<number>('DEFAULT_PAGE'),
    limit = this.configService.get<number>('DEFAULT_LIMIT'),
  }: {
    page?: number;
    limit?: number;
  }) {
    const maxLimit = this.configService.get<number>('DEFAULT_LIMIT');
    if (limit! < 1) limit = 1;
    if (limit! > maxLimit!)
      limit = this.configService.get<number>('DEFAULT_LIMIT');

    // skip to the first item of the page
    const skipNum = (page! - 1) * limit!;

    const [gamesList, totalGames] = await this.prisma.$transaction([
      this.prisma.games.findMany({
        skip: skipNum,
        take: limit,
      }),
      this.prisma.games.count(),
    ]);

    const totalPages = Math.ceil(totalGames / limit!);

    const gamesListReturn = gamesList.map((game) => ({
      ...game,
      id: convertBytesToUuid(game.id),
      price: centsToReal(game.price.toNumber()),
    }));

    return { gamesListReturn, totalPages };
  }

  async patch(params: {
    id: string;
    name?: string;
    description?: string;
    price?: string;
  }) {
    const { id, ...updates } = params;

    const currentGame = await this.prisma.games.findUnique({
      where: { id: convertUuidToBytes(id) },
    });

    if (!currentGame) throw new NotFoundException('Game not found');

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
