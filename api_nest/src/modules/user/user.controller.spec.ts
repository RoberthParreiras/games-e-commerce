import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ZodValidationPipe } from '../../models/zod.pipe';
import { CreateUser } from './user.schema';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

const id = uuidv4();
const hashedPassword = bcrypt.hashSync('test12345', 10);

const mockUser = {
  id: id,
  email: 'usertest@mail.com',
  name: 'User test',
  password: hashedPassword,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let mockResponse: Response;

  const mockUserService = {
    create: jest.fn(),
    get: jest.fn().mockResolvedValue(mockUser),
    put: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overridePipe(new ZodValidationPipe(CreateUser))
      .useValue({})
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should create a user and return a success message with the user object', async () => {
      const createUserDto = {
        name: 'New user test',
        email: 'usertestcreate@mail.com',
        password: 'testcreate12345',
      };

      mockUserService.create.mockResolvedValue(mockUser);

      await controller.createUser(createUserDto, mockResponse);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });
  });

  describe('getUser', () => {
    it('should retrieve a single user by id', async () => {
      await controller.getUser(id, mockResponse);

      expect(service.get).toHaveBeenCalledWith({ id: id });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User retrieved successfully',
        user: mockUser,
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user and return a success message', async () => {
      const updateDto = {
        name: 'Updated user test',
      };
      await controller.updateUser(id, updateDto, mockResponse);

      expect(service.put).toHaveBeenCalledWith({
        id: id,
        ...updateDto,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User updated with success',
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user and return a success message', async () => {
      await controller.deleteUser(id, mockResponse);

      expect(service.delete).toHaveBeenCalledWith({ id: id });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User deleted with success',
      });
    });
  });
});
