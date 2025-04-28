import { Router } from "express";
import GamesController from "../controllers/gamesController.js";
import { authenticateToken } from "../middlewares/authenticateHandler.js";

const gameRoutes = Router();
gameRoutes.post("/games/", authenticateToken, GamesController.createGame);
gameRoutes.get("/games/", authenticateToken, GamesController.listGames);
gameRoutes.delete("/games/:id", authenticateToken, GamesController.deleteGame);

export default gameRoutes;
