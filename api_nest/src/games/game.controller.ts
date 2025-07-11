import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Req,
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

  @Post()
  @UsePipes(new ZodValidationPipe(CreateGame))
  async createGame(
    @Body() createGameDto: CreateGameDto,
    @Res() response: Response,
  ) {
    await this.gamesService.create(createGameDto);
    response.status(HttpStatus.CREATED).json({
      message: 'Created with success',
    });
  }

  @Get()
  async listAllGames(@Res() response: Response) {
    const games = await this.gamesService.listAll();
    response.status(HttpStatus.OK).json({
      message: 'Success',
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
    response.status(HttpStatus.OK).json({
      message: 'Updated with success',
    });
  }

  @Delete(':id')
  async deleteGame(@Param('id') id: string, @Res() response: Response) {
    await this.gamesService.delete({ id });
    response.status(HttpStatus.OK).json({
      message: 'Deleted with success',
    });
  }
}
