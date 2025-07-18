import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';

const UserDto = {
  name: 'E2E Test User',
  email: 'e2egametest@mail.com',
  password: 'e2etest12345',
};

async function createUser(app: INestApplication) {
  const userDto = UserDto;
  const userResponse = await request(app.getHttpServer())
    .post('/user')
    .send(userDto);
  const userId = userResponse.body.user.id;

  return userId;
}

async function authUser(app: INestApplication) {
  const userDto = UserDto;
  const loginResponse = await request(app.getHttpServer())
    .post('/auth/login')
    .send(userDto);
  const accessToken = loginResponse.body.access_token;

  return accessToken;
}

async function deleteUser(app: INestApplication, userId: string) {
  await request(app.getHttpServer()).delete(`/user/${userId}`).expect(200);
}

export { createUser, authUser, deleteUser };
