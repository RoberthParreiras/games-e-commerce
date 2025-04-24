import { Router } from "express";
import UserController from "../controllers/userController";

const userRouter = Router();
userRouter.get("/user/:id", UserController.getUser);
userRouter.post("/user/", UserController.createUser);

export default userRouter;
