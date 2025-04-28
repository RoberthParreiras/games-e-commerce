import { Router } from "express";
import LoginController from "../controllers/loginController.js";

const loginRoutes = Router();
loginRoutes.post("/login/", LoginController.login);

export default loginRoutes;
