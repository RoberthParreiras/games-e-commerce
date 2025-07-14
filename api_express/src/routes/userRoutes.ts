import { Router } from "express";
import UserController from "../controllers/userController.js";
import { authenticateToken } from "../middlewares/authenticateHandler.js";

const userRouter = Router();
userRouter.get("/user/:id", authenticateToken, UserController.getUser);
userRouter.post("/user/", UserController.createUser);

export default userRouter;
