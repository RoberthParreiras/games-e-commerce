import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { deleteAllUsers } from './helpers';

describe('User (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  beforeEach(async () => {
    await deleteAllUsers(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/user', () => {
    it('should fail to create a user with invalid data', async () => {
      const invalidUserDto = {
        // name is missing
        email: 'e2etest2@mail.com',
        password: 'e2etest12345',
      };
      await request(app.getHttpServer())
        .post('/user')
        .send(invalidUserDto)
        .expect(400);
    });
  });

  describe('/user/:id', () => {
    it('should perform CRUD operations on a user', async () => {
      // 1. Create User
      const createUserDto = {
        name: 'E2E Test User',
        email: 'e2etest@mail.com',
        password: 'e2etest12345',
      };
      const postResponse = await request(app.getHttpServer())
        .post('/user')
        .send(createUserDto)
        .expect(201);

      const userId = postResponse.body.user.id;
      expect(userId).toBeDefined();

      // 2. Get User by ID
      const getResponseAfterCreate = await request(app.getHttpServer())
        .get(`/user/${userId}`)
        .expect(200);
      expect(getResponseAfterCreate.body.user.id).toEqual(userId);

      // 3. Update User
      const updateUserDto = {
        name: 'Updated E2E Test User',
      };
      await request(app.getHttpServer())
        .put(`/user/${userId}`)
        .send(updateUserDto)
        .expect(200);

      // 4. Verify Update
      const getResponseAfterUpdate = await request(app.getHttpServer())
        .get(`/user/${userId}`)
        .expect(200);
      expect(getResponseAfterUpdate.body.user.name).toEqual(updateUserDto.name);

      // 5. Delete User
      await request(app.getHttpServer()).delete(`/user/${userId}`).expect(200);

      // 6. Verify Deletion
      await request(app.getHttpServer()).get(`/user/${userId}`).expect(404);
    });

    it('should return 404 for a non-existent user id', () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      return request(app.getHttpServer())
        .get(`/user/${nonExistentId}`)
        .expect(404);
    });
  });
});
