import { Request, Response } from "express";
import prisma from "../models/prisma/prismaClient";
import { isValidPassword } from "../components/passwordHandler";

class LoginController {
  static async login(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: req.body.email,
        },
      });

      if (!user || !(await isValidPassword(req.body.password, user.password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      res.status(200).json({ message: "Login successful" });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  }
}

export default LoginController;
