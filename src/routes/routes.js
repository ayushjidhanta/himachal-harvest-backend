import baseRouter from "./baseRouter.js";
import authRouter from "./authRouter.js";
import productRouter from "./productRouter.js";

export const configureRoutes = (app) => {
  app.use("/", baseRouter);
  app.use("/auth", authRouter);
  app.use("/products", productRouter);
};
