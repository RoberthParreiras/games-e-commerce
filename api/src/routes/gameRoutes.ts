import { Router } from "express";
import GamesController from "../controllers/gamesController.js";
import { authenticateToken } from "../middlewares/authenticateHandler.js";

const gameRoutes = Router();
gameRoutes.post("/create-game/", GamesController.createGame);
gameRoutes.get("/games/", authenticateToken, GamesController.listGames);

export default gameRoutes;
