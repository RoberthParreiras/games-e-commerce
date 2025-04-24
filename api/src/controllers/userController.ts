import { NextFunction, Request, Response } from "express";
import prisma from "../models/prisma/prismaClient";
import { CreateUser } from "../models/User";
import { createHashedPassword } from "../components/passwordHandler";
import { convertUuidToBytes, createUuid } from "../components/uuidHandler";
import CustomErrorHandler from "../components/customErrorHandler";

class UserController {
  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userIdBuffer = convertUuidToBytes(req.body.id);

      const user = await prisma.user.findUnique({
        where: {
          id: userIdBuffer,
        },
      });

      if (!user) {
        const error = new CustomErrorHandler("User not found", 404);
        throw error;
      }

      res.status(200).json({ name: user!.name, email: user!.email });
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userIdBytes = createUuid();

      const validateUserFields = CreateUser.safeParse({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
      });

      if (!validateUserFields.success) {
        const error = new CustomErrorHandler("Error to validate fields", 500);
        throw error;
      }

      const { email, name, password } = validateUserFields.data!;

      const hashedPassword = await createHashedPassword(password);

      await prisma.user.create({
        data: {
          id: userIdBytes,
          name: name,
          email: email,
          password: hashedPassword,
        },
      });

      res.status(201).json({
        message: "User created with success!",
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
