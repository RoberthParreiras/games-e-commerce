import { Module } from '@nestjs/common';
import { GamesController } from './modules/games/game.controller';
import { GamesService } from './modules/games/game.service';
import { PrismaService } from './models/prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        const configService = new ConfigService();
        return {
          stores: [
            new KeyvRedis(
              `redis://${configService.get<string>('REDIS_HOST')}:${configService.get<number>('REDIS_PORT')}`,
            ),
          ],
        };
      },
    }),
  ],
  controllers: [GamesController],
  providers: [GamesService, PrismaService],
})
export class AppModule {}
