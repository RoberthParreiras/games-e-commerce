import express from "express";
import userRouter from "./userRoutes";
import loginRoutes from "./loginRoutes";

const routes = (app: express.Application) =>
  app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(userRouter)
    .use(loginRoutes);

export default routes;
