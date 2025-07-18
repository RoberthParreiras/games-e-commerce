import { Module } from '@nestjs/common';
import { GamesController } from './modules/games/game.controller';
import { GamesService } from './modules/games/game.service';
import { PrismaService } from './models/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [GamesController],
  providers: [GamesService, PrismaService],
})
export class AppModule {}
