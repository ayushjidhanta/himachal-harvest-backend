import baseRouter from "./baseRouter.js";
import authRouter from "./authRouter.js";
import productRouter from "./productRouter.js";
import contactRouter from "./contactRouter.js";
import reviewRouter from "./reviewRouter.js";
export const configureRoutes = (app) => {
  app.use("/", baseRouter);
  app.use("/auth", authRouter);
  // app.use("/products", productRouter);
  app.use("/contact", contactRouter)
  app.use("/review", reviewRouter) 
};
