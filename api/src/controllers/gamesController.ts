import { NextFunction, Request, Response } from "express";
import { createUuid } from "../components/uuidHandler";
import { CreateGame } from "../models/Game";
import prisma from "../models/prisma/prismaClient";
import CustomErrorHandler from "../components/customErrorHandler";

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
}

export default GamesController;
