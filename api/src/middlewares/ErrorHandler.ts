import { NextFunction, Request, Response } from "express";

interface CustomError {
  statusCode?: number;
  message?: string;
  stack?: string;
}

function ErrorHandler(
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errStatus = err.statusCode || 500;
  const errMsg = err.message || "Something went wrong";

  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
  });
}

export default ErrorHandler;
