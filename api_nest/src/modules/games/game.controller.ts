import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('/games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}
  private readonly logger = new Logger(GamesController.name);

  @UseGuards(JwtAuthGuard)
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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe)
    limit: number,
    @Res() response: Response,
  ) {
    const { gamesListReturn: games, totalPages } =
      await this.gamesService.listAll({
        page,
        limit,
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

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateGame(
    @Param('id') id: string,
    @Body() body: UpdateGameDto,
    @Res() response: Response,
  ) {
    await this.gamesService.put({
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
