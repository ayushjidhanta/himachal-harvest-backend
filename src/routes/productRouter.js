import express from "express";
import { createProduct, getProducts, getProductsById, updateProductById } from "../controller/productController.js";
import { requireAdminKey } from "../utils/requireAdminKey.js";

const productRouter = express.Router();

productRouter.get("/getProducts", getProducts);
productRouter.get("/getProducts/:id", getProductsById);
productRouter.post("", requireAdminKey, createProduct);
productRouter.patch("/:id", requireAdminKey, updateProductById);

export default productRouter;
