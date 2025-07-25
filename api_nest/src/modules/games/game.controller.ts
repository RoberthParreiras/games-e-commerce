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
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { GamesService } from './game.service';
import { ZodValidationPipe } from '../../models/zod.pipe';
import { CreateGame, CreateGameDto, UpdateGameDto } from './game.schema';
import { Response } from 'express';
import { convertBytesToUuid } from '../../common/utils/uuid.util';
import { AuthGuard } from '../auth/auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('/games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}
  private readonly logger = new Logger(GamesController.name);

  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ZodValidationPipe(CreateGame))
  async createGame(
    @Body() createGameDto: CreateGameDto,
    @Res() response: Response,
  ) {
    const gamecreated = await this.gamesService.create(createGameDto);

    const game = {
      ...gamecreated,
      id: convertBytesToUuid(gamecreated.id),
    };

    this.logger.log(
      `[${this.createGame.name}] ${HttpStatus.CREATED} - Game created with success`,
    );

    response.status(HttpStatus.CREATED).json({
      message: 'Game created with success',
      game,
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

  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateGame(
    @Param('id') id: string,
    @Body() body: UpdateGameDto,
    @Res() response: Response,
  ) {
    await this.gamesService.patch({
      id,
      name: body.name,
      description: body.description,
      price: body.price,
    });

    this.logger.log(
      `[${this.updateGame.name}] ${HttpStatus.OK} - Game with id: ${id} updated successfully`,
    );

    response.status(HttpStatus.OK).json({
      message: 'Game updated with success',
    });
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteGame(@Param('id') id: string, @Res() response: Response) {
    await this.gamesService.delete({ id });

    this.logger.log(
      `[${this.deleteGame.name}] ${HttpStatus.OK} - Game with id: ${id} deleted successfully`,
    );

    response.status(HttpStatus.OK).json({
      message: 'Game deleted with success',
    });
  }
}
