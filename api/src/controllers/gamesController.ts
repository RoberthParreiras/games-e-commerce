import { NextFunction, Request, Response } from "express";
import { createUuid } from "../components/uuidHandler.js";
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
      const listGames = await prisma.games.findMany();

      if (listGames.length == null) {
        const error = new CustomErrorHandler("There is no game listed", 404);
        throw error;
      }

      res
        .status(200)
        .json({ message: "Successful list of games", list: listGames });
    } catch (error) {
      next(error);
    }
  }
}

export default GamesController;
