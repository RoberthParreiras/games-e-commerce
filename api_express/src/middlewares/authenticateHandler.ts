import { NextFunction, Request, Response } from "express";
import CustomErrorHandler from "../components/customErrorHandler.js";
import { jwtVerify } from "jose";

async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      const error = new CustomErrorHandler("Authentication token missing", 401);
      throw error;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secret);

    next();
  } catch (error) {
    next(error);
  }
}

export { authenticateToken };
