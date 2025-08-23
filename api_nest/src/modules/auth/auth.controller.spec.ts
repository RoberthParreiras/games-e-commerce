import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HttpStatus, UnauthorizedException } from '@nestjs/common';

import { ZodValidationPipe } from '../../models/zod.pipe';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSchema } from './auth.schema';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let mockResponse: Response;

  const mockAuthService = {
    signIn: jest.fn().mockResolvedValue({ access_token: 'mock_token' }),
    signOut: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overridePipe(new ZodValidationPipe(AuthSchema))
      .useValue(new ZodValidationPipe(AuthSchema))
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('logIn', () => {
    it('should sign in a user and return an access token', async () => {
      const signInDto = {
        email: 'testauth@example.com',
        password: 'passwordauth',
      };
      await controller.logIn(signInDto, mockResponse);

      expect(service.signIn).toHaveBeenCalledWith(signInDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should throw UnauthorizedException if signIn returns no access token', async () => {
      const signInDto = {
        email: 'testauth@example.com',
        password: 'passwordauth',
      };
      mockAuthService.signIn.mockResolvedValueOnce({});

      await expect(controller.logIn(signInDto, mockResponse)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logOut', () => {
    it('should log out a user and return a success message', async () => {
      const mockToken = 'some-bearer-token';
      const authHeader = `Bearer ${mockToken}`;
      await controller.logOut(authHeader, mockResponse);

      expect(service.signOut).toHaveBeenCalledWith(mockToken);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logout successfully',
      });
    });

    it('should not call signOut if token is not present', async () => {
      const authHeader = 'Bearer ';
      await controller.logOut(authHeader, mockResponse);

      expect(service.signOut).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logout successfully',
      });
    });
  });
});
