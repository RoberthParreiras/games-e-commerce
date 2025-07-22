import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { authUser, createUser, deleteAllUsers } from './helpers';

describe('Games (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  beforeEach(async () => {
    // Clean the DB and set up a fresh user and token for each test
    await deleteAllUsers(app);
    await createUser(app);
    accessToken = await authUser(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/games', () => {
    it('should fail to create a game with invalid data', async () => {
      const invalidGameDto = {
        // name is missing
        description: 'An invalid game.',
        image: 'E2E test image',
        price: '9999',
      };
      await request(app.getHttpServer())
        .post('/games')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidGameDto)
        .expect(400);
    });

    it('should get a list of all games', async () => {
      // First, create a game to ensure the list is not empty
      const createGameDto = {
        name: 'E2E Test Game',
        description: 'A game created for e2e testing.',
        image: 'E2E test image',
        price: '9999',
      };
      await request(app.getHttpServer())
        .post('/games')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createGameDto)
        .expect(201);

      // Then, get the list
      const getResponse = await request(app.getHttpServer())
        .get('/games')
        .expect(200);

      expect(Array.isArray(getResponse.body.games)).toBe(true);
      expect(getResponse.body.games.length).toBeGreaterThan(0);
    });
  });

  describe('/games/:id', () => {
    it('should perform CRUD operations on a game', async () => {
      // 1. Create Game
      const createGameDto = {
        name: 'E2E Test Game',
        description: 'A game created for e2e testing.',
        image: 'E2E test image',
        price: '9999',
      };
      const postResponse = await request(app.getHttpServer())
        .post('/games')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createGameDto)
        .expect(201);

      const gameId = postResponse.body.game.id;
      expect(gameId).toBeDefined();

      // 2. Get Game by ID
      await request(app.getHttpServer()).get(`/games/${gameId}`).expect(200);

      // 3. Update Game
      const updateGameDto = {
        name: 'Updated E2E Test Game',
        price: '12999',
      };
      await request(app.getHttpServer())
        .put(`/games/${gameId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateGameDto)
        .expect(200);

      // 4. Verify Update
      const getResponse = await request(app.getHttpServer())
        .get(`/games/${gameId}`)
        .expect(200);
      expect(getResponse.body.game.name).toEqual(updateGameDto.name);

      // 5. Delete Game
      await request(app.getHttpServer())
        .delete(`/games/${gameId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // 6. Verify Deletion
      await request(app.getHttpServer()).get(`/games/${gameId}`).expect(404);
    });

    it('should return 404 for a non-existent game id', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/games/${nonExistentId}`)
        .expect(404);
    });
  });
});
