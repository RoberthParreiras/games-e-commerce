import { Module } from '@nestjs/common';
import { GamesController } from './games/game.controller';
import { GamesService } from './games/game.service';
import { PrismaService } from './models/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [GamesController],
  providers: [GamesService, PrismaService],
})
export class AppModule {}
