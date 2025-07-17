import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './game.controller';
import { GamesService } from './game.service';
import { ZodValidationPipe } from '../../models/zod.pipe';
import { CreateGame } from './game.schema';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

const mockGame = {
  id: '2e5ef823-ae50-4f76-bb82-5d3c87fa05da',
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
    put: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: mockGamesService,
        },
      ],
    })
      .overridePipe(new ZodValidationPipe(CreateGame))
      .useValue({})
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
        image: 'image test',
        price: '50000',
      };

      mockGamesService.create.mockResolvedValue(mockGame);

      await controller.createGame(createGameDto, mockResponse);

      expect(service.create).toHaveBeenCalledWith(createGameDto);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });
  });

  describe('getGame', () => {
    it('should retrieve a single game by id', async () => {
      await controller.getGame(
        '2e5ef823-ae50-4f76-bb82-5d3c87fa05da',
        mockResponse,
      );

      expect(service.get).toHaveBeenCalledWith({
        id: '2e5ef823-ae50-4f76-bb82-5d3c87fa05da',
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
      await controller.listAllGames(1, 10, mockResponse);

      expect(service.listAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
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
      await controller.updateGame(
        '2e5ef823-ae50-4f76-bb82-5d3c87fa05da',
        updateDto,
        mockResponse,
      );

      expect(service.put).toHaveBeenCalledWith({
        id: '2e5ef823-ae50-4f76-bb82-5d3c87fa05da',
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
      await controller.deleteGame(
        '2e5ef823-ae50-4f76-bb82-5d3c87fa05da',
        mockResponse,
      );

      expect(service.delete).toHaveBeenCalledWith({
        id: '2e5ef823-ae50-4f76-bb82-5d3c87fa05da',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Game deleted with success',
      });
    });
  });
});
