import { NextFunction, Request, Response } from "express";
import prisma from "../models/prisma/prismaClient.js";
import { isValidPassword } from "../components/passwordHandler.js";
import CustomErrorHandler from "../components/customErrorHandler.js";
import { signUser } from "../components/signInHandler.js";

class LoginController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: req.body.email,
        },
      });

      if (!user || !(await isValidPassword(req.body.password, user.password))) {
        const error = new CustomErrorHandler("Invalid email or password", 401);
        throw error;
      }

      const payload = {
        user: user.id,
      };

      const jwtToken = await signUser(payload);

      res.status(200).json({ message: `Login successful. TOKEN:${jwtToken}` });
    } catch (error) {
      next(error);
    }
  }
}

export default LoginController;
