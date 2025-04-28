import express from "express";
import userRouter from "./userRoutes.js";
import loginRoutes from "./loginRoutes.js";
import gameRoutes from "./gameRoutes.js";

const routes = (app: express.Application) =>
  app
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(userRouter)
    .use(loginRoutes)
    .use(gameRoutes);

export default routes;
