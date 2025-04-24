import { Request, Response } from "express";
import { createUuid } from "../components/uuidHandler";
import { CreateGame } from "../models/Game";
import prisma from "../models/prisma/prismaClient";

class GamesController {
  static async createGame(req: Request, res: Response) {
    try {
      const gamesIdBytes = createUuid();

      const validateGamesField = CreateGame.safeParse({
        name: req.body.name,
        description: req.body.description,
        image: req.body.image,
        price: req.body.price,
      });

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
      res.status(500).json({ message: error });
    }
  }
}

export default GamesController;
