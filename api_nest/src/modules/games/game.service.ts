import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

import {
  convertBytesToUuid,
  convertUuidToBytes,
} from '../../common/utils/uuid.util';
import { PrismaService } from '../../models/prisma/prisma.service';
import { getChangedFields } from '../../common/utils/check-changed-fields.util';
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
      price: centsToReal(game.price.toNumber()),
    };

    return gameReturn;
  }

  async listAll(params: {
    page?: number;
    limitPerPage?: number;
    minPrice?: number;
    maxPrice?: number;
  }) {
    let {
      page = this.configService.get<number>('DEFAULT_PAGE'),
      limitPerPage,
      minPrice,
      maxPrice,
    } = params;
    const maxPageLimit = this.configService.get<number>(
      'MAX_PAGE_DEFAULT_LIMIT',
    );
    if (!limitPerPage || limitPerPage < 1 || limitPerPage > maxPageLimit!)
      limitPerPage = maxPageLimit!;

    // skip to the first item of the page
    const skipNum = (page! - 1) * limitPerPage;

    const where: Prisma.GamesWhereInput = {};
    if (minPrice || maxPrice) {
      where.price = {
        ...(minPrice ? { gte: minPrice } : {}),
        ...(maxPrice ? { lte: maxPrice } : {}),
      };
    }

    const [gamesList, totalGames] = await this.prisma.$transaction([
      this.prisma.games.findMany({
        where,
        skip: skipNum,
        take: Number(limitPerPage),
      }),
      this.prisma.games.count({ where }),
    ]);

    const totalPages = Math.ceil(totalGames / limitPerPage);

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
    image?: string;
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
        image: currentGame?.image,
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
