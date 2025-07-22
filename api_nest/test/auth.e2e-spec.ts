import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { authUser, createUser, deleteAllUsers, UserDto } from './helpers';

describe('Auth (e2e)', () => {
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
    // for user authentication
    await deleteAllUsers(app);
    await createUser(app);
    accessToken = await authUser(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should login a user', async () => {
      const userDto: typeof UserDto = UserDto;
      const logInUser = {
        email: userDto.email,
        password: userDto.password,
      };
      const postResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(logInUser)
        .expect(200);

      expect(postResponse.body.access_token).toBeDefined();
    });

    it('should fail to login a user with invalid data', async () => {
      const invalidAuthDto = {
        // email is missing
        password: UserDto.password,
      };
      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidAuthDto)
        .expect(400);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout a user and blacklist the token', async () => {
      // 1. Logout successfully
      const logoutResponse = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(logoutResponse.body).toHaveProperty(
        'message',
        'Logout successfully',
      );

      // 2. Verify the token is blacklisted by trying to use it again
      const secondLogoutResponse = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);

      expect(secondLogoutResponse.body).toHaveProperty(
        'message',
        'Token has been blacklisted',
      );
    });
  });
});
