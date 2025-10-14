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
    images: string[];
    price: string;
  }) {
    const { name, description, price, images } = params;

    const uuid = uuidv4();

    const gameCreated = await this.prisma.games.create({
      data: {
        id: convertUuidToBytes(uuid),
        name,
        description,
        price: parseInt(price),
      },
    });

    await Promise.all(
      images.map((image) =>
        this.prisma.gameImage.create({
          data: {
            id: convertUuidToBytes(uuidv4()),
            gameId: convertUuidToBytes(uuid),
            url: image,
          },
        }),
      ),
    );

    return gameCreated;
  }

  async get(params: { id: string }) {
    const { id } = params;

    const game = await this.prisma.games.findUnique({
      where: {
        id: convertUuidToBytes(id),
      },
      include: {
        images: true,
      },
    });

    if (!game) throw new NotFoundException('Game not found');

    const gameReturn = {
      ...game,
      id: convertBytesToUuid(game.id),
      price: centsToReal(Number(game.price)),
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
        include: {
          images: true,
        },
        skip: skipNum,
        take: Number(limitPerPage),
      }),
      this.prisma.games.count({ where }),
    ]);

    const totalPages = Math.ceil(totalGames / limitPerPage);

    const gamesListReturn = gamesList.map((game) => ({
      ...game,
      id: convertBytesToUuid(game.id),
      price: centsToReal(Number(game.price)),
    }));

    return { gamesListReturn, totalPages };
  }

  async patch(params: {
    id: string;
    name?: string;
    description?: string;
    price?: string;
    images?: string[];
  }) {
    const { id, images, ...updates } = params;

    const currentGame = await this.prisma.games.findUnique({
      where: { id: convertUuidToBytes(id) },
      include: {
        images: true,
      },
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

    let hasChanges = Object.keys(changedFields).length > 0;
    if (hasChanges) {
      const updateData = this.prepareUpdateData(changedFields);

      await this.prisma.games.update({
        where: {
          id: convertUuidToBytes(id),
        },
        data: updateData,
      });
    }

    if (images && Array.isArray(images)) {
      const oldImageUrls = currentGame.images.map((image) => image.url);
      const newImageUrls = images;

      const areImagesDifferent =
        oldImageUrls.length !== newImageUrls.length ||
        !oldImageUrls.every((url) => newImageUrls.includes(url));

      if (areImagesDifferent) {
        await this.prisma.gameImage.deleteMany({
          where: { gameId: convertUuidToBytes(id) },
        });

        await Promise.all(
          images.map((image) =>
            this.prisma.gameImage.create({
              data: {
                id: convertUuidToBytes(uuidv4()),
                gameId: convertUuidToBytes(id),
                url: image,
              },
            }),
          ),
        );
      }
    }
  }

  async delete(params: { id: string }) {
    const { id } = params;

    const game = await this.prisma.games.findUnique({
      where: { id: convertUuidToBytes(id) },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    await this.prisma.$transaction([
      this.prisma.gameImage.deleteMany({
        where: { gameId: convertUuidToBytes(id) },
      }),
      this.prisma.games.delete({
        where: { id: convertUuidToBytes(id) },
      }),
    ]);
  }
}
