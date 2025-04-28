import { NextFunction, Request, Response } from "express";
import {
  convertBytesToUuid,
  convertUuidToBytes,
  createUuid,
} from "../components/uuidHandler.js";
import { CreateGame } from "../models/Game.js";
import prisma from "../models/prisma/prismaClient.js";
import CustomErrorHandler from "../components/customErrorHandler.js";

class GamesController {
  static async createGame(req: Request, res: Response, next: NextFunction) {
    try {
      const gamesIdBytes = createUuid();

      const validateGamesField = CreateGame.safeParse({
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        price: req.body.price,
      });

      if (!validateGamesField.success) {
        const error = new CustomErrorHandler("Error to validate fields", 500);
        throw error;
      }

      const { name, description, image, price } = validateGamesField.data!;

      await prisma.games.create({
        data: {
          id: gamesIdBytes,
          name: name,
          description: description,
          image: image,
          price: price,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      res.status(201).json({ message: "Game created with success!" });
    } catch (error) {
      next(error);
    }
  }

  static async listGames(req: Request, res: Response, next: NextFunction) {
    try {
      const gamesList = await prisma.games.findMany();

      if (gamesList.length == null) {
        const error = new CustomErrorHandler("There is no game listed", 404);
        throw error;
      }

      const gamesListForReturn = gamesList.map((game) => ({
        ...game,
        id: convertBytesToUuid(game.id),
      }));

      res.status(200).json({
        message: "Successful list games",
        gamesListForReturn,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteGame(req: Request, res: Response, next: NextFunction) {
    try {
      const gameId = req.params.id;
      await prisma.games.delete({
        where: {
          id: convertUuidToBytes(gameId),
        },
      });

      res.status(200).json({ message: "Game deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

export default GamesController;
