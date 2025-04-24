import { Request, Response } from "express";
import prisma from "../models/prisma/prismaClient";
import { v4 as uuidv4 } from "uuid";
import { CreateUser } from "../models/User";
import { createHashedPassword } from "../components/passwordHandler";

class UserController {
  static async getUser(req: Request, res: Response) {
    try {
      const userIdBuffer = Buffer.from(req.params.id.replace(/-/g, ""), "hex");
      const user = await prisma.user.findUnique({
        where: {
          id: userIdBuffer,
        },
      });

      res.status(200).json({ name: user!.name, email: user!.email });
    } catch (error) {
      res.status(500).json({ message: "User not found" });
    }
  }

  static async createUser(req: Request, res: Response) {
    try {
      const userIdUuid = uuidv4();
      const userIdBytes = Buffer.from(userIdUuid.replace(/-/g, ""), "hex");

      const validateUserFields = CreateUser.safeParse({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
      });

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
        id: userIdUuid,
      });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ message: "ERROR" });
    }
  }
}

export default UserController;
