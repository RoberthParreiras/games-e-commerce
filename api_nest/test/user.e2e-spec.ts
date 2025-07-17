import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('User (e2e)', () => {
  let app: INestApplication;
  let userId: string;

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

  describe('/user (POST)', () => {
    it('should create a user', async () => {
      const createUserDto = {
        name: 'E2E Test User',
        email: 'e2etest@mail.com',
        password: 'e2etest12345',
      };
      const postResponse = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(201);

      expect(postResponse.body.user).toBeDefined();
      expect(postResponse.body.user.name).toEqual(createUserDto.name);
      expect(postResponse.body.user.id).toBeDefined();

      userId = postResponse.body.user.id;
    });

    it('should fail to create a user with invalid data', async () => {
      const invalidGameDto = {
        // name is missing
        email: 'e2etest2@mail.com',
        password: 'e2etest12345',
      };
      await request(app.getHttpServer())
        .post('/user')
        .send(invalidGameDto)
        .expect(400);
    });
  });

  describe('/user/:id (GET)', () => {
    it('should get a single user by its id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/user/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'User retrieved successfully',
      );
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toEqual(userId);
      expect(response.body.user.name).toEqual('E2E Test User');
    });

    it('should return 404 for a non-existent user id', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/user/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('/user/:id (PUT)', () => {
    it('should update a user', async () => {
      const updateUserDto = {
        name: 'Updated E2E Test User',
      };

      const response = await request(app.getHttpServer())
        .put(`/user/${userId}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'User updated with success',
      );

      const getResponse = await request(app.getHttpServer())
        .get(`/user/${userId}`)
        .expect(200);

      expect(getResponse.body.user.name).toEqual(updateUserDto.name);
    });
  });

  describe('/user/:id (DELETE)', () => {
    it('should delete a user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/user/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'User deleted with success',
      );
    });

    it('should return 404 after a user has been deleted', () => {
      return request(app.getHttpServer()).get(`/user/${userId}`).expect(404);
    });
  });
});
