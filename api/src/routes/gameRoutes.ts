import { Router } from "express";
import GamesController from "../controllers/gamesController";

const gameRoutes = Router();
gameRoutes.post("/create-game/", GamesController.createGame);

export default gameRoutes;
