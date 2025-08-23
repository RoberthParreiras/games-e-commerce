import { Module } from '@nestjs/common';

import { ImageModule } from '../../integration/imageModule/image.module';
import { GamesController } from './game.controller';
import { GamesService } from './game.service';
import { PrismaService } from '../../models/prisma/prisma.service';

@Module({
  imports: [ImageModule],
  controllers: [GamesController],
  providers: [GamesService, PrismaService],
})
export class GameModule {}
