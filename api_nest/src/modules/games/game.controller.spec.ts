import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { Readable } from 'stream';
import { HttpStatus } from '@nestjs/common';

import { GamesController } from './game.controller';
import { GamesService } from './game.service';
import { ZodValidationPipe } from '../../models/zod.pipe';
import { CreateGame } from './game.schema';
import { AuthGuard } from '../auth/auth.guard';
import { ImageService } from '../../integration/imageModule/image.service';

const id = '2e5ef823-ae50-4f76-bb82-5d3c87fa05da';
const mockGame = {
  id: id,
  name: 'Game test',
  description: 'A description test',
  image: 'A image test',
  price: '10000',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockGamesList = {
  gamesListReturn: [mockGame],
  totalPages: 1,
};

describe('GamesController', () => {
  let controller: GamesController;
  let service: GamesService;
  let mockResponse: Response;

  const mockGamesService = {
    create: jest.fn(),
    get: jest.fn().mockResolvedValue(mockGame),
    listAll: jest.fn().mockResolvedValue(mockGamesList),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const mockImageService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: mockGamesService,
        },
        {
          provide: ImageService,
          useValue: mockImageService,
        },
      ],
    })
      .overridePipe(new ZodValidationPipe(CreateGame))
      .useValue({})
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context) => {
          const request = context.switchToHttp().getRequest();
          request['user'] = {
            id: id,
            name: 'Game test',
          };
          return true;
        },
      })
      .compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createGame', () => {
    it('should create a game and return a success message with the game object', async () => {
      const createGameDto = {
        name: 'New game test',
        description: 'New description test',
        price: '50000',
      };

      const mockRequest = {
        headers: {
          authorization: 'Bearer mock-token',
        },
      } as unknown as Request;

      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 12345,
        buffer: Buffer.from('test file content'),
        stream: Readable.from(Buffer.from('test file content')),
        destination: '',
        filename: '',
        path: '',
      };

      const mockImageUrl = 'http://example.com/image.jpg';
      mockImageService.create.mockResolvedValue(mockImageUrl);
      mockGamesService.create.mockResolvedValue(mockGame);

      await controller.createGame(
        createGameDto,
        mockRequest,
        mockResponse,
        mockFile,
      );

      expect(mockImageService.create).toHaveBeenCalledWith({
        authorization: mockRequest.headers.authorization,
        file: mockFile,
      });

      expect(service.create).toHaveBeenCalledWith({
        ...createGameDto,
        image: mockImageUrl,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });
  });

  describe('getGame', () => {
    it('should retrieve a single game by id', async () => {
      await controller.getGame(id, mockResponse);

      expect(service.get).toHaveBeenCalledWith({
        id: id,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Game retrieved successfully',
        game: mockGame,
      });
    });
  });

  describe('listAllGames', () => {
    it('should list all games with pagination', async () => {
      const page = 1;
      const limitPerPage = 10;
      const minPrice = 1;
      const maxPrice = 20000;

      await controller.listAllGames(
        page,
        limitPerPage,
        minPrice,
        maxPrice,
        mockResponse,
      );

      expect(service.listAll).toHaveBeenCalledWith({
        page,
        limitPerPage,
        minPrice,
        maxPrice,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'List games with success',
        games: mockGamesList.gamesListReturn,
        totalPages: mockGamesList.totalPages,
      });
    });
  });

  describe('updateGame', () => {
    it('should update a game and return a success message', async () => {
      const updateDto = {
        name: 'Updated Game test',
        description: 'Updated Description test',
        price: '15000',
      };
      await controller.updateGame(id, updateDto, mockResponse);

      expect(service.patch).toHaveBeenCalledWith({
        id: id,
        ...updateDto,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Game updated with success',
      });
    });
  });

  describe('deleteGame', () => {
    it('should delete a game and return a success message', async () => {
      await controller.deleteGame(id, mockResponse);

      expect(service.delete).toHaveBeenCalledWith({
        id: id,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Game deleted with success',
      });
    });
  });
});
