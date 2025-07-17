import { Module } from '@nestjs/common';
import { GamesController } from './games/game.controller';
import { GamesService } from './games/game.service';
import { PrismaService } from './models/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [GamesController, UserController],
  providers: [GamesService, UserService, PrismaService],
})
export class AppModule {}
