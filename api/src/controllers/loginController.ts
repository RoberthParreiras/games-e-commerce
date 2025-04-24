import { NextFunction, Request, Response } from "express";
import prisma from "../models/prisma/prismaClient";
import { isValidPassword } from "../components/passwordHandler";
import CustomErrorHandler from "../components/customErrorHandler";

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

      res.status(200).json({ message: "Login successful" });
    } catch (error) {
      next(error);
    }
  }
}

export default LoginController;
