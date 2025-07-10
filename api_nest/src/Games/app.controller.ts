import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { GamesService } from './app.service';
import { ZodValidationPipe } from 'src/models/zod';
import { CreateGame, CreateGameDto } from './gameSchema';
import { Response } from 'express';

@Controller("/games")
export class AppController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateGame))
  async createGame(@Body() createGameDto: CreateGameDto) {
    await this.gamesService.create(createGameDto);
  }

  @Get()
  async listAllGames(@Res() response: Response) {
    const games = await this.gamesService.listAll();
    response.status(HttpStatus.OK).json({
      message: 'Success',
      games,
    });
  }
}
