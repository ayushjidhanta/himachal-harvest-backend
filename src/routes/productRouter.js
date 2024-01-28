import express from "express";
import { getProducts, getProductsById } from "../controller/productController.js";

const productRouter = express.Router();

productRouter.get("/getProducts", getProducts);
productRouter.get("/getProducts/:id", getProductsById);

export default productRouter;
