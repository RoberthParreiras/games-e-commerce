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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { ImageService } from '../../integration/imageModule/image.service';
import { ClerkAuthGuard } from '../auth/clerk.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('/games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
    private readonly imageService: ImageService,
  ) {}
  private readonly logger = new Logger(GamesController.name);

  @UseGuards(ClerkAuthGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createGame(
    @Body() body: CreateGameDto,
    @Req() request: Request,
    @Res() response: Response,
    @UploadedFile()
    file: Express.Multer.File,
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

    const imageUrlCreated = await this.imageService.create({
      authorization,
      file,
    });

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
      image: imageUrlCreated,
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

  @UseGuards(ClerkAuthGuard)
  @Roles('admin')
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async updateGame(
    @Param('id') id: string,
    @Body() body: UpdateGameDto,
    @Res() response: Response,
    @Req() request: Request,
    @UploadedFile()
    file: Express.Multer.File,
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

    // check if the image has changed
    let image = '';
    if (file) {
      image = await this.imageService.create({
        authorization,
        file,
      });
      await this.imageService.delete({
        authorization,
        image_url: body.oldImage!,
      });
    } else if (body.image) {
      image = body.image;
    }

    await this.gamesService.patch({
      id,
      name: body.name,
      description: body.description,
      price: body.price,
      image: image,
    });

    this.logger.log(
      `[${this.updateGame.name}] ${HttpStatus.OK} - Game with id: ${id} updated successfully`,
    );

    response.status(HttpStatus.OK).json({
      message: 'Game updated with success',
    });
  }

  @UseGuards(ClerkAuthGuard)
  @Roles('admin')
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
