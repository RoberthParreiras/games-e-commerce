import { Module } from '@nestjs/common';
import { AppController } from './Games/app.controller';
import { GamesService } from './Games/app.service';
import { PrismaService } from './models/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [GamesService, PrismaService],
})
export class AppModule {}
