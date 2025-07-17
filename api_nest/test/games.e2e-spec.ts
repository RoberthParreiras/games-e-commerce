import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Games (e2e)', () => {
  let app: INestApplication;
  let gameId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/games (POST)', () => {
    it('should create a new game', async () => {
      const createGameDto = {
        name: 'E2E Test Game',
        description: 'A game created for e2e testing.',
        image: 'E2E test image',
        price: '9999',
      };
      const postResponse = await request(app.getHttpServer())
        .post('/games')
        .send(createGameDto)
        .expect(201);

      expect(postResponse.body.game).toBeDefined();
      expect(postResponse.body.game.name).toEqual(createGameDto.name);
      expect(postResponse.body.game.id).toBeDefined();

      gameId = postResponse.body.game.id;
    });

    it('should fail to create a game with invalid data', async () => {
      const invalidGameDto = {
        // name is missing
        description: 'An invalid game.',
        image: 'E2E test image',
        price: '9999',
      };
      await request(app.getHttpServer())
        .post('/games')
        .send(invalidGameDto)
        .expect(400);
    });
  });

  describe('/games (GET)', () => {
    it('should get a list of all games', async () => {
      const getResponse = await request(app.getHttpServer())
        .get('/games')
        .expect(200);

      expect(Array.isArray(getResponse.body.games)).toBe(true);
      expect(getResponse.body.games.length).toBeGreaterThan(0);
    });
  });

  describe('/games/:id (GET)', () => {
    it('should get a single game by its id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/games/${gameId}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Game retrieved successfully',
      );
      expect(response.body.game).toBeDefined();
      expect(response.body.game.id).toEqual(gameId);
      expect(response.body.game.name).toEqual('E2E Test Game');
    });

    it('should return 404 for a non-existent game id', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/games/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('/games/:id (PUT)', () => {
    it('should update a game', async () => {
      const updateGameDto = {
        name: 'Updated E2E Test Game',
        price: '12999',
      };

      const response = await request(app.getHttpServer())
        .put(`/games/${gameId}`)
        .send(updateGameDto)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Game updated with success',
      );

      const getResponse = await request(app.getHttpServer())
        .get(`/games/${gameId}`)
        .expect(200);

      expect(getResponse.body.game.name).toEqual(updateGameDto.name);
      expect(getResponse.body.game.price).toEqual(updateGameDto.price);
    });
  });

  describe('/games/:id (DELETE)', () => {
    it('should delete a game', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/games/${gameId}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Game deleted with success',
      );
    });

    it('should return 404 after a game has been deleted', () => {
      return request(app.getHttpServer()).get(`/games/${gameId}`).expect(404);
    });
  });
});
