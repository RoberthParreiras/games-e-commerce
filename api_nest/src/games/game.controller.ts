import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Res,
  UsePipes,
} from '@nestjs/common';
import { GamesService } from './game.service';
import { ZodValidationPipe } from 'src/models/zod.pipe';
import { CreateGame, CreateGameDto } from './game.schema';
import { Response } from 'express';

@Controller('/games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}
  private readonly logger = new Logger(GamesController.name);

  @Post()
  @UsePipes(new ZodValidationPipe(CreateGame))
  async createGame(
    @Body() createGameDto: CreateGameDto,
    @Res() response: Response,
  ) {
    await this.gamesService.create(createGameDto);

    this.logger.log(
      `[${this.createGame.name}] ${HttpStatus.CREATED} - Game created with success`,
    );

    response.status(HttpStatus.CREATED).json({
      message: 'Game created with success',
    });
  }

  @Get()
  async listAllGames(@Res() response: Response) {
    const games = await this.gamesService.listAll();

    this.logger.log(
      `[${this.listAllGames.name}] ${HttpStatus.OK} - List games with success`,
    );

    response.status(HttpStatus.OK).json({
      message: 'List games with success',
      games,
    });
  }

  @Put(':id')
  async updateGame(
    @Param('id') id: string,
    @Body() body: any,
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
