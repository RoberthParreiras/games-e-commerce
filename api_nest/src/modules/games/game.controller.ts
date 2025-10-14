import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';

import { GamesService } from './game.service';
import { ZodValidationPipe } from '../../models/zod.pipe';
import {
  CreateGame,
  CreateGameDto,
  DeleteGameDto,
  UpdateGameDto,
} from './game.schema';
import { convertBytesToUuid } from '../../common/utils/uuid.util';
import { AuthGuard } from '../auth/auth.guard';
import { ImageService } from '../../integration/imageModule/image.service';

@Controller('/games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly imageService: ImageService,
  ) {}
  private readonly logger = new Logger(GamesController.name);

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async createGame(
    @Body() body: CreateGameDto,
    @Req() request: Request,
    @Res() response: Response,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    const authorization = request.headers['authorization'];
    if (!authorization) {
      this.logger.error(
        `[${this.createGame.name}] ${HttpStatus.UNAUTHORIZED} - Authorization header missing`,
      );
      return response.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Authorization header missing',
      });
    }

    const imagesUrlCreated = await Promise.all(
      files.map((file) =>
        this.imageService.create({
          authorization,
          file,
        }),
      ),
    );

    const createGameDto = {
      name: body.name,
      description: body.description,
      price: body.price,
    };

    // validating after the createGameDto because of multipart/form-data
    new ZodValidationPipe(CreateGame).transform(createGameDto, {
      type: 'body',
    });

    const gameWithImageUrl = {
      ...createGameDto,
      images: imagesUrlCreated,
    };

    const gameCreated = await this.gamesService.create(gameWithImageUrl);

    const game = {
      ...gameCreated,
      id: convertBytesToUuid(gameCreated.id),
    };

    this.logger.log(
      `[${this.createGame.name}] ${HttpStatus.CREATED} - Game created with success`,
    );

    response.status(HttpStatus.CREATED).json({
      message: 'Game created with success',
      game,
    });
  }

  @Get()
  async listAllGames(
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number | undefined,
    @Query('limitPerPage', new ParseIntPipe({ optional: true }))
    limitPerPage: number | undefined,
    @Query('minPrice', new ParseIntPipe({ optional: true }))
    minPrice: number | undefined,
    @Query('maxPrice', new ParseIntPipe({ optional: true }))
    maxPrice: number | undefined,
    @Res() response: Response,
  ) {
    const { gamesListReturn: games, totalPages } =
      await this.gamesService.listAll({
        page,
        limitPerPage,
        minPrice,
        maxPrice,
      });

    this.logger.log(
      `[${this.listAllGames.name}] ${HttpStatus.OK} - List games with success`,
    );

    response.status(HttpStatus.OK).json({
      message: 'List games with success',
      games,
      totalPages,
    });
  }

  @Get(':id')
  async getGame(@Param('id') id: string, @Res() response: Response) {
    const game = await this.gamesService.get({ id });

    this.logger.log(
      `[${this.getGame.name}] ${HttpStatus.OK} - Game with id: ${id} found with success`,
    );

    response.status(HttpStatus.OK).json({
      message: 'Game retrieved successfully',
      game,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor())
  async updateGame(
    @Param('id') id: string,
    @Body() body: UpdateGameDto,
    @Res() response: Response,
    @Req() request: Request,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    const authorization = request.headers['authorization'];
    if (!authorization) {
      this.logger.error(
        `[${this.createGame.name}] ${HttpStatus.UNAUTHORIZED} - Authorization header missing`,
      );
      return response.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Authorization header missing',
      });
    }

    const currentGame = await this.gamesService.get({ id });
    const oldImageUrls = currentGame.images.map((image) => image.url);

    const newImageUrls = await Promise.all(
      files.map((file) =>
        this.imageService.create({
          authorization,
          file,
        }),
      ),
    );

    const keptImageUrls = body.imagesToKeep
      ? JSON.parse(body.imagesToKeep)
      : [];
    const finalImagesUrls = [...keptImageUrls, ...newImageUrls];

    const imagesToDelete = oldImageUrls.filter(
      (url) => !finalImagesUrls.includes(url),
    );

    if (imagesToDelete.length > 0) {
      await Promise.all(
        imagesToDelete.map((image_url) =>
          this.imageService.delete({
            authorization,
            image_url: image_url,
          }),
        ),
      );
    }

    await this.gamesService.patch({
      id,
      name: body.name,
      description: body.description,
      price: body.price,
      images: finalImagesUrls,
    });

    response.status(HttpStatus.OK).json({
      message: 'Game updated with success',
    });
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteGame(
    @Param('id') id: string,
    @Body() body: DeleteGameDto,
    @Res() response: Response,
    @Req() request: Request,
  ) {
    const authorization = request.headers['authorization'];
    if (!authorization) {
      this.logger.error(
        `[${this.createGame.name}] ${HttpStatus.UNAUTHORIZED} - Authorization header missing`,
      );
      return response.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Authorization header missing',
      });
    }

    await this.gamesService.delete({ id });
    await this.imageService.delete({ authorization, image_url: body.image });

    this.logger.log(
      `[${this.deleteGame.name}] ${HttpStatus.OK} - Game with id: ${id} deleted successfully`,
    );

    response.status(HttpStatus.OK).json({
      message: 'Game deleted with success',
    });
  }
}
